/**
 * Logger Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger, LogLevel, logger } from './logger';

describe('Logger', () => {
  let testLogger: Logger;
  let consoleLogSpy: any;
  let consoleErrorSpy: any;
  let consoleWarnSpy: any;
  let consoleDebugSpy: any;

  beforeEach(() => {
    testLogger = new Logger(LogLevel.DEBUG);
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleDebugSpy.mockRestore();
  });

  describe('log levels', () => {
    it('should log debug messages', () => {
      testLogger.debug('Debug message');

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining('"level":"DEBUG"')
      );
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining('"message":"Debug message"')
      );
    });

    it('should log info messages', () => {
      testLogger.info('Info message');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('"level":"INFO"')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('"message":"Info message"')
      );
    });

    it('should log warning messages', () => {
      testLogger.warn('Warning message');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('"level":"WARN"')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('"message":"Warning message"')
      );
    });

    it('should log error messages', () => {
      testLogger.error('Error message');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('"level":"ERROR"')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('"message":"Error message"')
      );
    });
  });

  describe('log level filtering', () => {
    it('should not log debug when level is INFO', () => {
      const infoLogger = new Logger(LogLevel.INFO);
      infoLogger.debug('Debug message');

      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });

    it('should not log info when level is WARN', () => {
      const warnLogger = new Logger(LogLevel.WARN);
      warnLogger.info('Info message');

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should log error when level is WARN', () => {
      const warnLogger = new Logger(LogLevel.WARN);
      warnLogger.error('Error message');

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('context', () => {
    it('should include context in log output', () => {
      testLogger.setContext({ userId: 'user-123', siteId: 'site-456' });
      testLogger.info('Message with context');

      const logCall = consoleLogSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.context).toMatchObject({
        userId: 'user-123',
        siteId: 'site-456',
      });
    });

    it('should merge context with additional data', () => {
      testLogger.setContext({ userId: 'user-123' });
      testLogger.info('Message', { requestId: 'req-456' });

      const logCall = consoleLogSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.context).toMatchObject({
        userId: 'user-123',
        requestId: 'req-456',
      });
    });

    it('should clear context', () => {
      testLogger.setContext({ userId: 'user-123' });
      testLogger.clearContext();
      testLogger.info('Message');

      const logCall = consoleLogSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.context).toBeUndefined();
    });
  });

  describe('child logger', () => {
    it('should create child with inherited context', () => {
      testLogger.setContext({ userId: 'user-123' });
      const childLogger = testLogger.child({ sessionId: 'session-456' });

      childLogger.info('Child message');

      const logCall = consoleLogSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.context).toMatchObject({
        userId: 'user-123',
        sessionId: 'session-456',
      });
    });

    it('should not affect parent context', () => {
      testLogger.setContext({ userId: 'user-123' });
      const childLogger = testLogger.child({ sessionId: 'session-456' });

      childLogger.setContext({ requestId: 'req-789' });
      testLogger.info('Parent message');

      const logCall = consoleLogSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.context).toMatchObject({
        userId: 'user-123',
      });
      expect(logEntry.context).not.toHaveProperty('requestId');
    });
  });

  describe('error logging', () => {
    it('should include error details', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.ts:1:1';

      testLogger.error('Operation failed', error);

      const logCall = consoleErrorSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.error).toMatchObject({
        message: 'Test error',
        name: 'Error',
        stack: expect.stringContaining('test.ts:1:1'),
      });
    });
  });

  describe('timestamp', () => {
    it('should include ISO timestamp', () => {
      testLogger.info('Message');

      const logCall = consoleLogSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('setLevel', () => {
    it('should change log level', () => {
      testLogger.setLevel(LogLevel.ERROR);
      testLogger.info('Info message');
      testLogger.error('Error message');

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});

describe('global logger instance', () => {
  it('should be configured from environment', () => {
    expect(logger).toBeDefined();
    expect(logger).toBeInstanceOf(Logger);
  });
});
