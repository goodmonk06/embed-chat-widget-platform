/**
 * AI Provider Adapter Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  OpenAIProviderAdapter,
  AnthropicProviderAdapter,
  MockAIProviderAdapter,
  Message,
} from './ai-provider.adapter';

describe('MockAIProviderAdapter', () => {
  let adapter: MockAIProviderAdapter;

  beforeEach(() => {
    adapter = new MockAIProviderAdapter();
  });

  it('should return default mock response', async () => {
    const messages: Message[] = [
      { role: 'user', content: 'Hello' },
    ];

    const response = await adapter.chat(messages);
    expect(response).toBe('This is a mock response');
  });

  it('should ignore options and return same response', async () => {
    const messages: Message[] = [
      { role: 'user', content: 'Test' },
    ];

    const response = await adapter.chat(messages, {
      model: 'gpt-4',
      temperature: 0.8,
      maxTokens: 500,
    });

    expect(response).toBe('This is a mock response');
  });

  it('should handle multiple messages', async () => {
    const messages: Message[] = [
      { role: 'system', content: 'You are helpful' },
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi' },
      { role: 'user', content: 'How are you?' },
    ];

    const response = await adapter.chat(messages);
    expect(response).toBe('This is a mock response');
  });

  it('should cycle through custom responses', async () => {
    const customAdapter = new MockAIProviderAdapter(['Response 1', 'Response 2']);
    const messages: Message[] = [{ role: 'user', content: 'Test' }];

    const response1 = await customAdapter.chat(messages);
    expect(response1).toBe('Response 1');

    const response2 = await customAdapter.chat(messages);
    expect(response2).toBe('Response 2');

    const response3 = await customAdapter.chat(messages);
    expect(response3).toBe('Response 1'); // Cycles back
  });

  it('should pass health check', async () => {
    const isHealthy = await adapter.healthCheck();
    expect(isHealthy).toBe(true);
  });

  it('should return correct name', () => {
    expect(adapter.getName()).toBe('Mock');
  });
});

describe('OpenAIProviderAdapter', () => {
  it('should instantiate with API key', () => {
    const adapter = new OpenAIProviderAdapter('test-key');
    expect(adapter).toBeDefined();
    expect(adapter.getName()).toBe('OpenAI');
  });

  it('should accept custom default model', () => {
    const adapter = new OpenAIProviderAdapter('test-key', 'gpt-4');
    expect(adapter.getName()).toBe('OpenAI');
  });

  it('should implement IAIProviderAdapter interface', () => {
    const adapter = new OpenAIProviderAdapter('test-key');

    expect(typeof adapter.chat).toBe('function');
    expect(typeof adapter.getName).toBe('function');
    expect(typeof adapter.healthCheck).toBe('function');
  });

  // Note: Integration tests with real API calls require OPENAI_API_KEY environment variable
  // These tests are intentionally simplified to avoid hitting real APIs during unit tests
});

describe('AnthropicProviderAdapter', () => {
  it('should instantiate with API key', () => {
    const adapter = new AnthropicProviderAdapter('test-key');
    expect(adapter).toBeDefined();
    expect(adapter.getName()).toBe('Anthropic');
  });

  it('should accept custom default model', () => {
    const adapter = new AnthropicProviderAdapter('test-key', 'claude-3-opus-20240229');
    expect(adapter.getName()).toBe('Anthropic');
  });

  it('should implement IAIProviderAdapter interface', () => {
    const adapter = new AnthropicProviderAdapter('test-key');

    expect(typeof adapter.chat).toBe('function');
    expect(typeof adapter.getName).toBe('function');
    expect(typeof adapter.healthCheck).toBe('function');
  });

  // Note: Integration tests with real API calls require ANTHROPIC_API_KEY environment variable
  // These tests are intentionally simplified to avoid hitting real APIs during unit tests
});

describe('IAIProviderAdapter interface compliance', () => {
  const testAdapters = [
    { name: 'MockAIProviderAdapter', adapter: new MockAIProviderAdapter() },
    { name: 'OpenAIProviderAdapter', adapter: new OpenAIProviderAdapter('test-key') },
    { name: 'AnthropicProviderAdapter', adapter: new AnthropicProviderAdapter('test-key') },
  ];

  testAdapters.forEach(({ name, adapter }) => {
    describe(name, () => {
      it('should have chat method', () => {
        expect(typeof adapter.chat).toBe('function');
      });

      it('should have getName method', () => {
        expect(typeof adapter.getName).toBe('function');
        expect(typeof adapter.getName()).toBe('string');
      });

      it('should have healthCheck method', () => {
        expect(typeof adapter.healthCheck).toBe('function');
      });
    });
  });
});
