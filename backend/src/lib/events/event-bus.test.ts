/**
 * Event Bus Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { eventBus } from './event-bus';
import { EventTypes } from './domain-events';

describe('EventBus', () => {
  beforeEach(() => {
    // Clear all event handlers before each test
    eventBus.clear();
  });

  describe('on and emit', () => {
    it('should subscribe to and receive events', async () => {
      const handler = vi.fn();

      eventBus.on(EventTypes.SITE_CREATED, handler);

      await eventBus.emit(EventTypes.SITE_CREATED, {
        siteId: 'site-123',
        name: 'Test Site',
        domain: 'test.com',
        ownerId: 'user-123',
      });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: EventTypes.SITE_CREATED,
          timestamp: expect.any(Date),
          payload: expect.objectContaining({
            siteId: 'site-123',
            name: 'Test Site',
          }),
        })
      );
    });

    it('should support multiple handlers for same event', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.on(EventTypes.MESSAGE_RECEIVED, handler1);
      eventBus.on(EventTypes.MESSAGE_RECEIVED, handler2);

      await eventBus.emit(EventTypes.MESSAGE_RECEIVED, {
        sessionId: 'session-123',
        messageId: 'msg-123',
        siteId: 'site-123',
        content: 'Hello',
        role: 'user',
      });

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should not call handler for different event type', async () => {
      const handler = vi.fn();

      eventBus.on(EventTypes.SITE_CREATED, handler);

      await eventBus.emit(EventTypes.SITE_UPDATED, {
        siteId: 'site-123',
        changes: { name: 'New Name' },
      });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should include custom metadata in event', async () => {
      const handler = vi.fn();

      eventBus.on(EventTypes.CONVERSATION_STARTED, handler);

      const metadata = {
        userId: 'user-123',
        requestId: 'req-456',
      };

      await eventBus.emit(
        EventTypes.CONVERSATION_STARTED,
        {
          sessionId: 'session-123',
          siteId: 'site-123',
          sessionKey: 'key-123',
        },
        metadata
      );

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: EventTypes.CONVERSATION_STARTED,
          timestamp: expect.any(Date),
          metadata: expect.objectContaining({
            userId: 'user-123',
            requestId: 'req-456',
          }),
        })
      );
    });
  });

  describe('onAny', () => {
    it('should receive all events', async () => {
      const handler = vi.fn();

      eventBus.onAny(handler);

      await eventBus.emit(EventTypes.SITE_CREATED, {
        siteId: 'site-123',
        name: 'Test',
        domain: 'test.com',
        ownerId: 'user-123',
      });

      await eventBus.emit(EventTypes.CONVERSATION_RATED, {
        sessionId: 'session-123',
        siteId: 'site-123',
        rating: 5,
      });

      expect(handler).toHaveBeenCalledTimes(2);
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe from events', async () => {
      const handler = vi.fn();

      const unsubscribe = eventBus.on(EventTypes.SITE_DELETED, handler);

      await eventBus.emit(EventTypes.SITE_DELETED, {
        siteId: 'site-123',
      });

      expect(handler).toHaveBeenCalledTimes(1);

      unsubscribe();

      await eventBus.emit(EventTypes.SITE_DELETED, {
        siteId: 'site-456',
      });

      // Still called only once
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should unsubscribe from wildcard events', async () => {
      const handler = vi.fn();

      const unsubscribe = eventBus.onAny(handler);

      await eventBus.emit(EventTypes.SITE_CREATED, {
        siteId: 'site-123',
        name: 'Test',
        domain: 'test.com',
        ownerId: 'user-123',
      });

      expect(handler).toHaveBeenCalledTimes(1);

      unsubscribe();

      await eventBus.emit(EventTypes.SITE_UPDATED, {
        siteId: 'site-123',
        changes: {},
      });

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling', () => {
    it('should call all handlers even if one fails', async () => {
      const failingHandler = vi.fn().mockRejectedValue(new Error('Handler error'));
      const successHandler = vi.fn();

      eventBus.on(EventTypes.CONVERSATION_TAGGED, failingHandler);
      eventBus.on(EventTypes.CONVERSATION_TAGGED, successHandler);

      // Event bus will reject if any handler rejects
      try {
        await eventBus.emit(EventTypes.CONVERSATION_TAGGED, {
          sessionId: 'session-123',
          tagIds: ['tag-1'],
        });
      } catch (error) {
        // Expected to throw
      }

      // Both handlers should be called despite first one failing
      expect(failingHandler).toHaveBeenCalled();
      expect(successHandler).toHaveBeenCalled();
    });

    it('should propagate handler errors', async () => {
      const failingHandler = vi.fn().mockRejectedValue(new Error('Test error'));

      eventBus.on(EventTypes.USER_CREATED, failingHandler);

      // Should throw
      await expect(
        eventBus.emit(EventTypes.USER_CREATED, {
          userId: 'user-123',
          email: 'test@example.com',
          role: 'MEMBER',
        })
      ).rejects.toThrow();
    });
  });

  describe('async handlers', () => {
    it('should handle async handlers', async () => {
      const handler = vi.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      eventBus.on(EventTypes.WIDGET_CONFIGURATION_UPDATED, handler);

      await eventBus.emit(EventTypes.WIDGET_CONFIGURATION_UPDATED, {
        siteId: 'site-123',
        changes: { primaryColor: '#ff0000' },
      });

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('listenerCount', () => {
    it('should return count of handlers for an event', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.on(EventTypes.SITE_CREATED, handler1);
      eventBus.on(EventTypes.SITE_CREATED, handler2);

      expect(eventBus.listenerCount(EventTypes.SITE_CREATED)).toBe(2);
    });

    it('should include wildcard handlers in count', () => {
      const handler1 = vi.fn();
      const wildcardHandler = vi.fn();

      eventBus.on(EventTypes.SITE_CREATED, handler1);
      eventBus.onAny(wildcardHandler);

      expect(eventBus.listenerCount(EventTypes.SITE_CREATED)).toBe(2);
    });
  });
});
