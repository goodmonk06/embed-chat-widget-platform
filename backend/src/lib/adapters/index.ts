/**
 * Adapter Registry
 * Central place to register and retrieve adapters
 */

import { INotificationAdapter, ConsoleNotificationAdapter } from './notification.adapter';
import { IAIProviderAdapter } from './ai-provider.adapter';
import { IAnalyticsAdapter, ConsoleAnalyticsAdapter } from './analytics.adapter';
import { IStorageAdapter, InMemoryStorageAdapter } from './storage.adapter';

export * from './notification.adapter';
export * from './ai-provider.adapter';
export * from './analytics.adapter';
export * from './storage.adapter';

interface AdapterRegistry {
  notification: INotificationAdapter;
  aiProvider: IAIProviderAdapter;
  analytics: IAnalyticsAdapter;
  storage: IStorageAdapter;
}

class AdapterManager {
  private adapters: Partial<AdapterRegistry> = {};

  register<K extends keyof AdapterRegistry>(
    type: K,
    adapter: AdapterRegistry[K]
  ): void {
    this.adapters[type] = adapter;
  }

  get<K extends keyof AdapterRegistry>(type: K): AdapterRegistry[K] {
    const adapter = this.adapters[type];
    if (!adapter) {
      throw new Error(`Adapter not registered: ${type}`);
    }
    return adapter as AdapterRegistry[K];
  }

  has(type: keyof AdapterRegistry): boolean {
    return !!this.adapters[type];
  }

  async healthCheck(): Promise<Record<keyof AdapterRegistry, boolean>> {
    const results: any = {};

    for (const [type, adapter] of Object.entries(this.adapters) as [keyof AdapterRegistry, any][]) {
      try {
        results[type] = await adapter.healthCheck();
      } catch {
        results[type] = false;
      }
    }

    return results;
  }
}

// Global singleton instance
export const adapters = new AdapterManager();

// Initialize with default adapters
export function initializeDefaultAdapters() {
  if (!adapters.has('notification')) {
    adapters.register('notification', new ConsoleNotificationAdapter());
  }

  if (!adapters.has('analytics')) {
    adapters.register('analytics', new ConsoleAnalyticsAdapter());
  }

  if (!adapters.has('storage')) {
    adapters.register('storage', new InMemoryStorageAdapter());
  }
}
