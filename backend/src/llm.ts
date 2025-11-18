import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export class LLMService {
  private openai?: OpenAI;
  private anthropic?: Anthropic;
  private provider: 'openai' | 'anthropic';

  constructor() {
    // Determine which provider to use based on available API keys
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      this.provider = 'openai';
    } else if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
      this.provider = 'anthropic';
    } else {
      throw new Error('No LLM API key provided. Set OPENAI_API_KEY or ANTHROPIC_API_KEY');
    }
  }

  async chat(messages: Message[]): Promise<string> {
    if (this.provider === 'openai' && this.openai) {
      return this.chatWithOpenAI(messages);
    } else if (this.provider === 'anthropic' && this.anthropic) {
      return this.chatWithAnthropic(messages);
    }
    throw new Error('No LLM provider configured');
  }

  private async chatWithOpenAI(messages: Message[]): Promise<string> {
    const response = await this.openai!.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  }

  private async chatWithAnthropic(messages: Message[]): Promise<string> {
    // Anthropic requires separating system messages from user/assistant messages
    const systemMessage = messages.find(m => m.role === 'assistant' && messages.indexOf(m) === 0);
    const conversationMessages = systemMessage ? messages.slice(1) : messages;

    const response = await this.anthropic!.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: conversationMessages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    });

    const textBlock = response.content.find(block => block.type === 'text');
    return textBlock && 'text' in textBlock ? textBlock.text : 'Sorry, I could not generate a response.';
  }
}

export const llmService = new LLMService();
