import { FastifyInstance } from 'fastify';
import { prisma } from '../db';
import {
  listConversationsSchema,
  rateConversationSchema,
  tagConversationSchema,
  updateConversationStatusSchema,
  sessionIdParamSchema,
} from '../schemas';
import { NotFoundError } from '../utils/errors';
import { eventBus, EventTypes } from '../lib/events';

export async function conversationRoutes(fastify: FastifyInstance) {
  // List conversations with filters
  fastify.get('/api/admin/conversations', async (request, reply) => {
    const query = listConversationsSchema.parse(request.query);

    const where: any = {
      siteId: query.siteId,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.tagId) {
      where.tags = {
        some: {
          tagId: query.tagId,
        },
      };
    }

    // Search in messages if search term provided
    if (query.search) {
      where.messages = {
        some: {
          content: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      };
    }

    const [conversations, total] = await Promise.all([
      prisma.chatSession.findMany({
        where,
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          tags: {
            include: {
              tag: true,
            },
          },
          rating: true,
          _count: {
            select: { messages: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.chatSession.count({ where }),
    ]);

    return {
      conversations: conversations.map(c => ({
        id: c.id,
        sessionKey: c.sessionKey,
        status: c.status,
        userEmail: c.userEmail,
        userName: c.userName,
        messageCount: c._count.messages,
        lastMessage: c.messages[0] || null,
        tags: c.tags.map(t => t.tag),
        rating: c.rating,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
      },
    };
  });

  // Get conversation detail
  fastify.get('/api/admin/conversations/:sessionId', async (request, reply) => {
    const params = sessionIdParamSchema.parse(request.params);

    const conversation = await prisma.chatSession.findUnique({
      where: { id: params.sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        rating: true,
        site: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundError('Conversation');
    }

    return {
      ...conversation,
      tags: conversation.tags.map(t => t.tag),
    };
  });

  // Rate a conversation
  fastify.post('/api/admin/conversations/:sessionId/rate', async (request, reply) => {
    const params = sessionIdParamSchema.parse(request.params);
    const body = rateConversationSchema.parse(request.body);

    const session = await prisma.chatSession.findUnique({
      where: { id: params.sessionId },
    });

    if (!session) {
      throw new NotFoundError('Conversation');
    }

    const rating = await prisma.conversationRating.upsert({
      where: { sessionId: params.sessionId },
      create: {
        sessionId: params.sessionId,
        rating: body.rating,
        feedback: body.feedback,
      },
      update: {
        rating: body.rating,
        feedback: body.feedback,
      },
    });

    // Emit event
    await eventBus.emit(EventTypes.CONVERSATION_RATED, {
      sessionId: params.sessionId,
      siteId: session.siteId,
      rating: body.rating,
      feedback: body.feedback,
    });

    return rating;
  });

  // Tag a conversation
  fastify.post('/api/admin/conversations/:sessionId/tags', async (request, reply) => {
    const params = sessionIdParamSchema.parse(request.params);
    const body = tagConversationSchema.parse(request.body);

    const session = await prisma.chatSession.findUnique({
      where: { id: params.sessionId },
    });

    if (!session) {
      throw new NotFoundError('Conversation');
    }

    // Remove existing tags
    await prisma.sessionTag.deleteMany({
      where: { sessionId: params.sessionId },
    });

    // Add new tags
    const tags = await Promise.all(
      body.tagIds.map(tagId =>
        prisma.sessionTag.create({
          data: {
            sessionId: params.sessionId,
            tagId,
          },
          include: {
            tag: true,
          },
        })
      )
    );

    // Emit events for each tag
    for (const tag of tags) {
      await eventBus.emit(EventTypes.CONVERSATION_TAGGED, {
        sessionId: params.sessionId,
        siteId: session.siteId,
        tagId: tag.tagId,
        tagName: tag.tag.name,
      });
    }

    return tags.map(t => t.tag);
  });

  // Update conversation status
  fastify.put('/api/admin/conversations/:sessionId/status', async (request, reply) => {
    const params = sessionIdParamSchema.parse(request.params);
    const body = updateConversationStatusSchema.parse(request.body);

    const conversation = await prisma.chatSession.update({
      where: { id: params.sessionId },
      data: { status: body.status },
    });

    return conversation;
  });

  // Export conversation
  fastify.get('/api/admin/conversations/:sessionId/export', async (request, reply) => {
    const params = sessionIdParamSchema.parse(request.params);

    const conversation = await prisma.chatSession.findUnique({
      where: { id: params.sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        rating: true,
        site: {
          select: {
            name: true,
            domain: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundError('Conversation');
    }

    // Format as JSON export
    const exportData = {
      conversationId: conversation.id,
      site: conversation.site,
      status: conversation.status,
      startedAt: conversation.createdAt,
      endedAt: conversation.updatedAt,
      messageCount: conversation.messages.length,
      tags: conversation.tags.map(t => t.tag.name),
      rating: conversation.rating,
      messages: conversation.messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.createdAt,
      })),
    };

    reply.header('Content-Type', 'application/json');
    reply.header(
      'Content-Disposition',
      `attachment; filename="conversation-${conversation.id}.json"`
    );

    return exportData;
  });
}
