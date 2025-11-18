/**
 * Analytics Event Handlers
 * Track analytics when certain events occur
 */

import { DomainEvent, EventTypes } from '../domain-events';
import { adapters } from '../../adapters';

export function registerAnalyticsHandlers() {
  const { eventBus } = require('../event-bus');

  // Track conversation started
  eventBus.on(EventTypes.CONVERSATION_STARTED, async (event: DomainEvent) => {
    const { sessionId, siteId } = event.payload;

    try {
      const analyticsAdapter = adapters.get('analytics');

      await analyticsAdapter.recordMetric({
        name: 'conversation_started',
        value: 1,
        labels: { siteId },
      });

      await analyticsAdapter.trackEvent({
        name: 'conversation_started',
        sessionId,
        properties: { siteId },
      });
    } catch (error) {
      console.error('Failed to track conversation started:', error);
    }
  });

  // Track messages
  eventBus.on(EventTypes.MESSAGE_RECEIVED, async (event: DomainEvent) => {
    const { messageId, sessionId, siteId, role } = event.payload;

    try {
      const analyticsAdapter = adapters.get('analytics');

      await analyticsAdapter.recordMetric({
        name: 'message_received',
        value: 1,
        labels: { siteId, role },
      });

      await analyticsAdapter.trackEvent({
        name: 'message_received',
        sessionId,
        properties: { siteId, role, messageId },
      });
    } catch (error) {
      console.error('Failed to track message:', error);
    }
  });

  // Track conversation ratings
  eventBus.on(EventTypes.CONVERSATION_RATED, async (event: DomainEvent) => {
    const { sessionId, siteId, rating } = event.payload;

    try {
      const analyticsAdapter = adapters.get('analytics');

      await analyticsAdapter.recordMetric({
        name: 'conversation_rating',
        value: rating,
        labels: { siteId },
      });

      await analyticsAdapter.trackEvent({
        name: 'conversation_rated',
        sessionId,
        properties: { siteId, rating },
      });
    } catch (error) {
      console.error('Failed to track rating:', error);
    }
  });

  // Track widget configuration updates
  eventBus.on(EventTypes.WIDGET_CONFIGURATION_UPDATED, async (event: DomainEvent) => {
    const { siteId } = event.payload;

    try {
      const analyticsAdapter = adapters.get('analytics');

      await analyticsAdapter.trackEvent({
        name: 'widget_configuration_updated',
        properties: { siteId },
      });
    } catch (error) {
      console.error('Failed to track widget update:', error);
    }
  });
}
