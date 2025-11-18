/**
 * Metrics Collection
 * Simple abstraction for recording metrics
 */

import { adapters } from './adapters';

export interface MetricLabels {
  [key: string]: string;
}

class MetricsCollector {
  private enabled: boolean = true;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Increment a counter
   */
  async incrementCounter(name: string, labels?: MetricLabels, value: number = 1): Promise<void> {
    if (!this.enabled) return;

    try {
      const analyticsAdapter = adapters.get('analytics');
      await analyticsAdapter.recordMetric({
        name,
        value,
        labels,
      });
    } catch (error) {
      console.error('Failed to record counter metric:', error);
    }
  }

  /**
   * Record a gauge (current value)
   */
  async recordGauge(name: string, value: number, labels?: MetricLabels): Promise<void> {
    if (!this.enabled) return;

    try {
      const analyticsAdapter = adapters.get('analytics');
      await analyticsAdapter.recordMetric({
        name,
        value,
        labels,
      });
    } catch (error) {
      console.error('Failed to record gauge metric:', error);
    }
  }

  /**
   * Record a histogram value (for latencies, sizes, etc.)
   */
  async recordHistogram(name: string, value: number, labels?: MetricLabels): Promise<void> {
    if (!this.enabled) return;

    try {
      const analyticsAdapter = adapters.get('analytics');
      await analyticsAdapter.recordMetric({
        name,
        value,
        labels,
      });
    } catch (error) {
      console.error('Failed to record histogram metric:', error);
    }
  }

  /**
   * Time a function execution
   */
  async time<T>(name: string, fn: () => Promise<T>, labels?: MetricLabels): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      await this.recordHistogram(`${name}_duration_ms`, duration, labels);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      await this.recordHistogram(`${name}_duration_ms`, duration, {
        ...labels,
        status: 'error',
      });
      throw error;
    }
  }

  /**
   * Measure HTTP request latency
   */
  async measureRequest(
    method: string,
    path: string,
    statusCode: number,
    durationMs: number
  ): Promise<void> {
    if (!this.enabled) return;

    try {
      await this.recordHistogram('http_request_duration_ms', durationMs, {
        method,
        path,
        status: statusCode.toString(),
      });

      await this.incrementCounter('http_requests_total', {
        method,
        path,
        status: statusCode.toString(),
      });
    } catch (error) {
      console.error('Failed to measure request:', error);
    }
  }
}

// Global metrics instance
export const metrics = new MetricsCollector();
