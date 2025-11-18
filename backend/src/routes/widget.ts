import { FastifyInstance } from 'fastify';
import { prisma } from '../db';
import { llmService } from '../llm';
import { nanoid } from 'nanoid';
import { initWidgetSchema, chatMessageSchema } from '../schemas';
import { NotFoundError } from '../utils/errors';

export async function widgetRoutes(fastify: FastifyInstance) {
  // Initialize a new chat session
  fastify.post('/api/widget/init', async (request, reply) => {
    const body = initWidgetSchema.parse(request.body);

    // Verify the site exists with this public key
    const site = await prisma.site.findUnique({
      where: { publicKey: body.siteKey },
    });

    if (!site) {
      throw new NotFoundError('Site');
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
    const body = chatMessageSchema.parse(request.body);

    // Find the session
    const session = await prisma.chatSession.findUnique({
      where: { sessionKey: body.sessionKey },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        site: true,
      },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'user',
        content: body.message,
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
      content: body.message,
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
      throw new Error('Failed to generate AI response');
    }
  });
}
