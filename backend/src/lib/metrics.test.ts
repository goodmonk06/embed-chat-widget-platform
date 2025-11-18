/**
 * Metrics Collector Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { metrics } from './metrics';
import { adapters } from './adapters';
import { InMemoryAnalyticsAdapter } from './adapters/analytics.adapter';

describe('MetricsCollector', () => {
  let analyticsAdapter: InMemoryAnalyticsAdapter;

  beforeEach(() => {
    analyticsAdapter = new InMemoryAnalyticsAdapter();
    adapters.register('analytics', analyticsAdapter);
    metrics.setEnabled(true);
  });

  describe('incrementCounter', () => {
    it('should track counter metric', async () => {
      await metrics.incrementCounter('api.requests');

      const metricsData = analyticsAdapter.getMetrics();
      expect(metricsData).toHaveLength(1);
      expect(metricsData[0]).toMatchObject({
        name: 'api.requests',
        value: 1,
      });
    });

    it('should increment counter by custom value', async () => {
      await metrics.incrementCounter('messages.sent', {}, 5);

      const metricsData = analyticsAdapter.getMetrics();
      expect(metricsData[0].value).toBe(5);
    });

    it('should include labels', async () => {
      await metrics.incrementCounter('requests', { method: 'GET', status: '200' });

      const metricsData = analyticsAdapter.getMetrics();
      expect(metricsData[0].labels).toMatchObject({
        method: 'GET',
        status: '200',
      });
    });
  });

  describe('recordGauge', () => {
    it('should track gauge metric', async () => {
      await metrics.recordGauge('active.connections', 42);

      const metricsData = analyticsAdapter.getMetrics();
      expect(metricsData[0]).toMatchObject({
        name: 'active.connections',
        value: 42,
      });
    });

    it('should include labels', async () => {
      await metrics.recordGauge('queue.size', 10, { queue: 'emails' });

      const metricsData = analyticsAdapter.getMetrics();
      expect(metricsData[0].labels).toMatchObject({
        queue: 'emails',
      });
    });
  });

  describe('recordHistogram', () => {
    it('should track histogram metric', async () => {
      await metrics.recordHistogram('response.time', 123.45);

      const metricsData = analyticsAdapter.getMetrics();
      expect(metricsData[0]).toMatchObject({
        name: 'response.time',
        value: 123.45,
      });
    });

    it('should include labels', async () => {
      await metrics.recordHistogram('query.duration', 50.5, { database: 'postgres' });

      const metricsData = analyticsAdapter.getMetrics();
      expect(metricsData[0].labels).toMatchObject({
        database: 'postgres',
      });
    });
  });

  describe('measureRequest', () => {
    it('should record request metrics', async () => {
      await metrics.measureRequest('GET', '/api/sites', 200, 45.5);

      const metricsData = analyticsAdapter.getMetrics();

      // Should record both histogram and counter
      expect(metricsData.length).toBeGreaterThanOrEqual(2);

      const histogram = metricsData.find(m => m.name === 'http_request_duration_ms');
      expect(histogram).toBeDefined();
      expect(histogram!.value).toBe(45.5);
      expect(histogram!.labels).toMatchObject({
        method: 'GET',
        path: '/api/sites',
        status: '200',
      });

      const counter = metricsData.find(m => m.name === 'http_requests_total');
      expect(counter).toBeDefined();
    });

    it('should track different status codes', async () => {
      await metrics.measureRequest('POST', '/api/sites', 201, 100);
      await metrics.measureRequest('GET', '/api/sites/123', 404, 10);

      const metricsData = analyticsAdapter.getMetrics();
      expect(metricsData.length).toBeGreaterThanOrEqual(4); // 2 requests * 2 metrics each
    });
  });

  describe('time', () => {
    it('should time and record operation', async () => {
      const result = await metrics.time(
        'database.query',
        async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return 'result';
        }
      );

      expect(result).toBe('result');

      const metricsData = analyticsAdapter.getMetrics();
      const histogram = metricsData.find(m => m.name === 'database.query_duration_ms');

      expect(histogram).toBeDefined();
      expect(histogram!.value).toBeGreaterThan(0);
    });

    it('should include labels', async () => {
      await metrics.time(
        'cache.lookup',
        async () => 'cached-value',
        { cache: 'redis' }
      );

      const metricsData = analyticsAdapter.getMetrics();
      const histogram = metricsData.find(m => m.name === 'cache.lookup_duration_ms');

      expect(histogram!.labels).toMatchObject({
        cache: 'redis',
      });
    });

    it('should propagate errors', async () => {
      await expect(
        metrics.time('failing.operation', async () => {
          throw new Error('Operation failed');
        })
      ).rejects.toThrow('Operation failed');
    });

    it('should still record metrics on error', async () => {
      try {
        await metrics.time('failing.operation', async () => {
          throw new Error('Operation failed');
        });
      } catch {
        // Expected
      }

      const metricsData = analyticsAdapter.getMetrics();
      const histogram = metricsData.find(m => m.name === 'failing.operation_duration_ms');

      expect(histogram).toBeDefined();
      expect(histogram!.labels?.status).toBe('error');
    });
  });

  describe('enabled/disabled', () => {
    it('should not record metrics when disabled', async () => {
      metrics.setEnabled(false);

      await metrics.incrementCounter('test.counter');
      await metrics.recordGauge('test.gauge', 10);
      await metrics.recordHistogram('test.histogram', 20);

      const metricsData = analyticsAdapter.getMetrics();
      expect(metricsData).toHaveLength(0);
    });

    it('should record metrics when re-enabled', async () => {
      metrics.setEnabled(false);
      await metrics.incrementCounter('test.counter');

      metrics.setEnabled(true);
      await metrics.incrementCounter('test.counter');

      const metricsData = analyticsAdapter.getMetrics();
      expect(metricsData).toHaveLength(1);
    });
  });

  describe('error handling', () => {
    it('should handle adapter errors gracefully', async () => {
      const failingAdapter = {
        recordMetric: vi.fn().mockRejectedValue(new Error('Adapter error')),
        trackEvent: vi.fn(),
        flush: vi.fn(),
        healthCheck: vi.fn().mockResolvedValue(false),
      };

      adapters.register('analytics', failingAdapter as any);

      // Should not throw
      await expect(
        metrics.incrementCounter('test.metric')
      ).resolves.not.toThrow();
    });
  });
});

describe('global metrics instance', () => {
  it('should be available', () => {
    expect(metrics).toBeDefined();
    expect(typeof metrics.incrementCounter).toBe('function');
    expect(typeof metrics.recordGauge).toBe('function');
    expect(typeof metrics.recordHistogram).toBe('function');
    expect(typeof metrics.measureRequest).toBe('function');
    expect(typeof metrics.time).toBe('function');
  });
});
