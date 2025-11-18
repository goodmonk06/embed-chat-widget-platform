/**
 * Analytics Adapter Interface
 * Allows sending metrics to external analytics platforms
 */

export interface MetricData {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp?: Date;
}

export interface EventData {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp?: Date;
}

export interface IAnalyticsAdapter {
  /**
   * Record a metric (counter, gauge, histogram)
   */
  recordMetric(metric: MetricData): Promise<void>;

  /**
   * Track an event
   */
  trackEvent(event: EventData): Promise<void>;

  /**
   * Flush pending analytics
   */
  flush(): Promise<void>;

  /**
   * Health check
   */
  healthCheck(): Promise<boolean>;
}

/**
 * Console Analytics Adapter (for development)
 */
export class ConsoleAnalyticsAdapter implements IAnalyticsAdapter {
  async recordMetric(metric: MetricData): Promise<void> {
    console.log('[METRIC]', {
      name: metric.name,
      value: metric.value,
      labels: metric.labels,
      timestamp: metric.timestamp || new Date(),
    });
  }

  async trackEvent(event: EventData): Promise<void> {
    console.log('[EVENT]', {
      name: event.name,
      properties: event.properties,
      userId: event.userId,
      sessionId: event.sessionId,
      timestamp: event.timestamp || new Date(),
    });
  }

  async flush(): Promise<void> {
    console.log('[ANALYTICS] Flush complete');
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}

/**
 * In-Memory Analytics Adapter (for testing/debugging)
 */
export class InMemoryAnalyticsAdapter implements IAnalyticsAdapter {
  private metrics: MetricData[] = [];
  private events: EventData[] = [];

  async recordMetric(metric: MetricData): Promise<void> {
    this.metrics.push({
      ...metric,
      timestamp: metric.timestamp || new Date(),
    });
  }

  async trackEvent(event: EventData): Promise<void> {
    this.events.push({
      ...event,
      timestamp: event.timestamp || new Date(),
    });
  }

  async flush(): Promise<void> {
    // In-memory adapter doesn't need to flush
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  getMetrics(): MetricData[] {
    return [...this.metrics];
  }

  getEvents(): EventData[] {
    return [...this.events];
  }

  clear(): void {
    this.metrics = [];
    this.events = [];
  }
}

/**
 * Multi Analytics Adapter (sends to multiple backends)
 */
export class MultiAnalyticsAdapter implements IAnalyticsAdapter {
  constructor(private adapters: IAnalyticsAdapter[]) {}

  async recordMetric(metric: MetricData): Promise<void> {
    await Promise.all(
      this.adapters.map(adapter => adapter.recordMetric(metric).catch(err => {
        console.error('Analytics adapter failed:', err);
      }))
    );
  }

  async trackEvent(event: EventData): Promise<void> {
    await Promise.all(
      this.adapters.map(adapter => adapter.trackEvent(event).catch(err => {
        console.error('Analytics adapter failed:', err);
      }))
    );
  }

  async flush(): Promise<void> {
    await Promise.all(this.adapters.map(adapter => adapter.flush()));
  }

  async healthCheck(): Promise<boolean> {
    const results = await Promise.all(
      this.adapters.map(adapter => adapter.healthCheck())
    );
    return results.some(result => result);
  }
}
