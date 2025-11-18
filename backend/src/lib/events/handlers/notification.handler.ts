/**
 * Notification Event Handlers
 * Send notifications when certain events occur
 */

import { DomainEvent, EventTypes } from '../domain-events';
import { adapters } from '../../adapters';

export function registerNotificationHandlers() {
  const { eventBus } = require('../event-bus');

  // Notify when conversation is started
  eventBus.on(EventTypes.CONVERSATION_STARTED, async (event: DomainEvent) => {
    const { sessionId, siteId } = event.payload;

    try {
      const notificationAdapter = adapters.get('notification');
      await notificationAdapter.send({
        title: 'New Conversation Started',
        message: `A new conversation has been started on site ${siteId}`,
        metadata: { sessionId, siteId },
        priority: 'normal',
      });
    } catch (error) {
      console.error('Failed to send conversation started notification:', error);
    }
  });

  // Notify when conversation is rated poorly
  eventBus.on(EventTypes.CONVERSATION_RATED, async (event: DomainEvent) => {
    const { sessionId, siteId, rating, feedback } = event.payload;

    // Only notify for low ratings
    if (rating <= 2) {
      try {
        const notificationAdapter = adapters.get('notification');
        await notificationAdapter.send({
          title: 'Low Rating Received',
          message: `Conversation ${sessionId} received a ${rating}-star rating${feedback ? ': ' + feedback : ''}`,
          metadata: { sessionId, siteId, rating, feedback },
          priority: 'high',
        });
      } catch (error) {
        console.error('Failed to send low rating notification:', error);
      }
    }
  });

  // Notify when site is created
  eventBus.on(EventTypes.SITE_CREATED, async (event: DomainEvent) => {
    const { siteId, name, ownerId } = event.payload;

    try {
      const notificationAdapter = adapters.get('notification');
      await notificationAdapter.send({
        title: 'New Site Created',
        message: `Site "${name}" has been created`,
        metadata: { siteId, ownerId },
        priority: 'low',
      });
    } catch (error) {
      console.error('Failed to send site created notification:', error);
    }
  });
}
