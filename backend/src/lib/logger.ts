/**
 * Structured Logger
 * Provides context-aware logging with levels
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogContext {
  userId?: string;
  siteId?: string;
  sessionId?: string;
  requestId?: string;
  [key: string]: any;
}

interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
}

class Logger {
  private level: LogLevel;
  private context: LogContext = {};

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  clearContext(): void {
    this.context = {};
  }

  child(context: LogContext): Logger {
    const childLogger = new Logger(this.level);
    childLogger.setContext({ ...this.context, ...context });
    return childLogger;
  }

  private log(level: LogLevel, levelName: string, message: string, data?: any): void {
    if (level < this.level) {
      return;
    }

    const entry: LogEntry = {
      level: levelName,
      message,
      timestamp: new Date().toISOString(),
    };

    if (Object.keys(this.context).length > 0 || data) {
      entry.context = { ...this.context, ...data };
    }

    if (data instanceof Error) {
      entry.error = {
        message: data.message,
        stack: data.stack,
        name: data.name,
      };
    }

    // Use appropriate console method based on level
    switch (level) {
      case LogLevel.ERROR:
        console.error(JSON.stringify(entry));
        break;
      case LogLevel.WARN:
        console.warn(JSON.stringify(entry));
        break;
      case LogLevel.DEBUG:
        console.debug(JSON.stringify(entry));
        break;
      default:
        console.log(JSON.stringify(entry));
    }
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, 'INFO', message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, 'WARN', message, data);
  }

  error(message: string, error?: Error | any): void {
    this.log(LogLevel.ERROR, 'ERROR', message, error);
  }
}

// Global logger instance
export const logger = new Logger(
  process.env.LOG_LEVEL === 'debug' ? LogLevel.DEBUG :
  process.env.LOG_LEVEL === 'warn' ? LogLevel.WARN :
  process.env.LOG_LEVEL === 'error' ? LogLevel.ERROR :
  LogLevel.INFO
);

// Export for creating child loggers
export { Logger };
