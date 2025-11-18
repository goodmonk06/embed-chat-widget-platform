/**
 * LLM Service
 * Facade for AI provider adapters
 * @deprecated Use adapters.get('aiProvider') directly instead
 */

import { adapters } from './lib/adapters';
import { Message } from './lib/adapters/ai-provider.adapter';

export class LLMService {
  async chat(messages: Message[]): Promise<string> {
    try {
      const aiProvider = adapters.get('aiProvider');
      return await aiProvider.chat(messages);
    } catch (error) {
      console.error('LLM service error:', error);
      throw new Error('Failed to generate AI response');
    }
  }
}

// Maintain backwards compatibility
export const llmService = new LLMService();
