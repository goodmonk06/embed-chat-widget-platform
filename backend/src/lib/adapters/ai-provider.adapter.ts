/**
 * AI Provider Adapter Interface
 * Allows swapping AI backends (OpenAI, Anthropic, local models, etc.)
 */

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface IAIProviderAdapter {
  /**
   * Generate a chat completion
   */
  chat(messages: Message[], options?: ChatOptions): Promise<string>;

  /**
   * Get provider name
   */
  getName(): string;

  /**
   * Check if provider is available
   */
  healthCheck(): Promise<boolean>;
}

/**
 * OpenAI Provider Adapter
 */
export class OpenAIProviderAdapter implements IAIProviderAdapter {
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey: string, defaultModel: string = 'gpt-4o-mini') {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
  }

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const OpenAI = (await import('openai')).default;
    const client = new OpenAI({ apiKey: this.apiKey });

    const response = await client.chat.completions.create({
      model: options?.model || this.defaultModel,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1000,
    });

    return response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  }

  getName(): string {
    return 'OpenAI';
  }

  async healthCheck(): Promise<boolean> {
    try {
      const OpenAI = (await import('openai')).default;
      const client = new OpenAI({ apiKey: this.apiKey });
      await client.models.list();
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Anthropic Provider Adapter
 */
export class AnthropicProviderAdapter implements IAIProviderAdapter {
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey: string, defaultModel: string = 'claude-3-5-sonnet-20241022') {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
  }

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey: this.apiKey });

    // Filter out system messages for Anthropic
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const response = await client.messages.create({
      model: options?.model || this.defaultModel,
      max_tokens: options?.maxTokens ?? 1000,
      messages: conversationMessages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    });

    const textBlock = response.content.find(block => block.type === 'text');
    return textBlock && 'text' in textBlock ? textBlock.text : 'Sorry, I could not generate a response.';
  }

  getName(): string {
    return 'Anthropic';
  }

  async healthCheck(): Promise<boolean> {
    return !!this.apiKey;
  }
}

/**
 * Mock AI Provider (for testing)
 */
export class MockAIProviderAdapter implements IAIProviderAdapter {
  private responses: string[];
  private currentIndex: number = 0;

  constructor(responses: string[] = ['This is a mock response']) {
    this.responses = responses;
  }

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const response = this.responses[this.currentIndex % this.responses.length];
    this.currentIndex++;
    return response;
  }

  getName(): string {
    return 'Mock';
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}
