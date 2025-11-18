import { FastifyInstance } from 'fastify';
import { prisma } from '../db';
import { llmService } from '../llm';
import { nanoid } from 'nanoid';

export async function widgetRoutes(fastify: FastifyInstance) {
  // Initialize a new chat session
  fastify.post('/api/widget/init', async (request, reply) => {
    const { siteKey } = request.body as { siteKey: string };

    if (!siteKey) {
      return reply.code(400).send({ error: 'siteKey is required' });
    }

    // Verify the site exists with this public key
    const site = await prisma.site.findUnique({
      where: { publicKey: siteKey },
    });

    if (!site) {
      return reply.code(404).send({ error: 'Invalid siteKey' });
    }

    // Create a new session
    const session = await prisma.chatSession.create({
      data: {
        siteId: site.id,
        sessionKey: nanoid(32),
      },
    });

    return {
      sessionKey: session.sessionKey,
      sessionId: session.id,
    };
  });

  // Handle chat messages
  fastify.post('/api/widget/chat', async (request, reply) => {
    const { sessionKey, message } = request.body as {
      sessionKey: string;
      message: string;
    };

    if (!sessionKey || !message) {
      return reply.code(400).send({ error: 'sessionKey and message are required' });
    }

    // Find the session
    const session = await prisma.chatSession.findUnique({
      where: { sessionKey },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        site: true,
      },
    });

    if (!session) {
      return reply.code(404).send({ error: 'Session not found' });
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'user',
        content: message,
      },
    });

    // Prepare conversation history for LLM
    const conversationHistory = session.messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Add the new user message
    conversationHistory.push({
      role: 'user',
      content: message,
    });

    try {
      // Get AI response
      const aiResponse = await llmService.chat(conversationHistory);

      // Save assistant message
      const assistantMessage = await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          role: 'assistant',
          content: aiResponse,
        },
      });

      return {
        message: aiResponse,
        messageId: assistantMessage.id,
        timestamp: assistantMessage.createdAt,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Failed to generate response',
        message: 'An error occurred while processing your message.',
      });
    }
  });
}
