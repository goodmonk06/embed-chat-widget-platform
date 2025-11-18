/**
 * Notification Adapter Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ConsoleNotificationAdapter,
  NoOpNotificationAdapter,
  WebhookNotificationAdapter,
  NotificationPayload,
} from './notification.adapter';

describe('ConsoleNotificationAdapter', () => {
  let adapter: ConsoleNotificationAdapter;

  beforeEach(() => {
    adapter = new ConsoleNotificationAdapter();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should send notification to console', async () => {
    const payload: NotificationPayload = {
      title: 'Test Notification',
      message: 'This is a test',
      priority: 'normal',
    };

    await adapter.send(payload);

    expect(console.log).toHaveBeenCalledWith(
      '[NOTIFICATION]',
      expect.objectContaining({
        title: 'Test Notification',
        message: 'This is a test',
        priority: 'normal',
      })
    );
  });

  it('should pass health check', async () => {
    const isHealthy = await adapter.healthCheck();
    expect(isHealthy).toBe(true);
  });
});

describe('NoOpNotificationAdapter', () => {
  let adapter: NoOpNotificationAdapter;

  beforeEach(() => {
    adapter = new NoOpNotificationAdapter();
  });

  it('should not send notification', async () => {
    const payload: NotificationPayload = {
      title: 'Test',
      message: 'Test',
      priority: 'normal',
    };

    // Should not throw
    await expect(adapter.send(payload)).resolves.not.toThrow();
  });

  it('should pass health check', async () => {
    const isHealthy = await adapter.healthCheck();
    expect(isHealthy).toBe(true);
  });
});

describe('WebhookNotificationAdapter', () => {
  let adapter: WebhookNotificationAdapter;
  const testUrl = 'https://example.com/webhook';

  beforeEach(() => {
    adapter = new WebhookNotificationAdapter(testUrl);
    global.fetch = vi.fn();
  });

  it('should send notification via webhook', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
    });

    const payload: NotificationPayload = {
      title: 'Critical Alert',
      message: 'Something went wrong',
      priority: 'high',
      metadata: { userId: '123' },
    };

    await adapter.send(payload);

    expect(global.fetch).toHaveBeenCalledWith(
      testUrl,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );

    // Check the body contains expected fields
    const fetchCall = (global.fetch as any).mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    expect(body.title).toBe('Critical Alert');
    expect(body.message).toBe('Something went wrong');
    expect(body.priority).toBe('high');
    expect(body.metadata).toEqual({ userId: '123' });
  });

  it('should throw error on failed webhook', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const payload: NotificationPayload = {
      title: 'Test',
      message: 'Test',
      priority: 'normal',
    };

    await expect(adapter.send(payload)).rejects.toThrow(
      'Webhook failed with status 500'
    );
  });

  it('should pass health check on successful webhook test', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
    });

    const isHealthy = await adapter.healthCheck();
    expect(isHealthy).toBe(true);
  });

  it('should fail health check on webhook error', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const isHealthy = await adapter.healthCheck();
    expect(isHealthy).toBe(false);
  });
});
