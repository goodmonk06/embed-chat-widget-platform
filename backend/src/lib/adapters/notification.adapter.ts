/**
 * Notification Adapter Interface
 * Allows plugging in different notification providers (email, Slack, Discord, webhooks)
 */

export interface NotificationPayload {
  title: string;
  message: string;
  metadata?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface INotificationAdapter {
  /**
   * Send a notification
   */
  send(payload: NotificationPayload): Promise<void>;

  /**
   * Check if the adapter is healthy/configured
   */
  healthCheck(): Promise<boolean>;
}

/**
 * Console Notification Adapter (for development)
 */
export class ConsoleNotificationAdapter implements INotificationAdapter {
  async send(payload: NotificationPayload): Promise<void> {
    console.log('[NOTIFICATION]', {
      title: payload.title,
      message: payload.message,
      priority: payload.priority || 'normal',
      metadata: payload.metadata,
      timestamp: new Date().toISOString(),
    });
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}

/**
 * Webhook Notification Adapter
 * Sends notifications to external webhooks
 */
export class WebhookNotificationAdapter implements INotificationAdapter {
  constructor(private webhookUrl: string) {}

  async send(payload: NotificationPayload): Promise<void> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: payload.title,
          message: payload.message,
          priority: payload.priority || 'normal',
          metadata: payload.metadata,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Webhook notification failed:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(this.webhookUrl, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * No-op Notification Adapter (for testing)
 */
export class NoOpNotificationAdapter implements INotificationAdapter {
  async send(payload: NotificationPayload): Promise<void> {
    // Intentionally does nothing
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}
