/**
 * Events Module
 * Domain events and event bus
 */

export * from './domain-events';
export * from './event-bus';

import { registerNotificationHandlers } from './handlers/notification.handler';
import { registerAnalyticsHandlers } from './handlers/analytics.handler';

/**
 * Initialize all event handlers
 */
export function initializeEventHandlers() {
  registerNotificationHandlers();
  registerAnalyticsHandlers();
}
