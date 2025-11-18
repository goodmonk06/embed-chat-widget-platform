/**
 * Event Bus
 * Pub/sub system for domain events
 */

import { DomainEvent } from './domain-events';

export type EventHandler<T = any> = (event: DomainEvent<T>) => Promise<void> | void;

class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();
  private wildcardHandlers: EventHandler[] = [];

  /**
   * Subscribe to an event type
   */
  on(eventType: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }

    this.handlers.get(eventType)!.push(handler);

    // Return unsubscribe function
    return () => this.off(eventType, handler);
  }

  /**
   * Subscribe to all events
   */
  onAny(handler: EventHandler): () => void {
    this.wildcardHandlers.push(handler);

    return () => {
      const index = this.wildcardHandlers.indexOf(handler);
      if (index > -1) {
        this.wildcardHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Unsubscribe from an event type
   */
  off(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (!handlers) return;

    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * Publish an event
   */
  async emit<T = any>(eventType: string, payload: T, metadata?: Record<string, any>): Promise<void> {
    const event: DomainEvent<T> = {
      type: eventType,
      timestamp: new Date(),
      payload,
      metadata,
    };

    // Get specific handlers
    const handlers = this.handlers.get(eventType) || [];

    // Combine with wildcard handlers
    const allHandlers = [...handlers, ...this.wildcardHandlers];

    // Execute all handlers
    const promises = allHandlers.map(handler => {
      try {
        return Promise.resolve(handler(event));
      } catch (error) {
        console.error(`Event handler error for ${eventType}:`, error);
        return Promise.resolve();
      }
    });

    await Promise.all(promises);
  }

  /**
   * Clear all handlers (useful for testing)
   */
  clear(): void {
    this.handlers.clear();
    this.wildcardHandlers = [];
  }

  /**
   * Get count of handlers for an event
   */
  listenerCount(eventType: string): number {
    return (this.handlers.get(eventType)?.length || 0) + this.wildcardHandlers.length;
  }
}

// Global singleton instance
export const eventBus = new EventBus();
