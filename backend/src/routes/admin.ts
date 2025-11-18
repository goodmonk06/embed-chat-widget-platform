import { FastifyInstance } from 'fastify';
import { prisma } from '../db';
import {
  createSiteSchema,
  updateSiteSchema,
  siteIdParamSchema,
  ownerIdQuerySchema,
  sessionIdParamSchema,
} from '../schemas';
import { NotFoundError } from '../utils/errors';

export async function adminRoutes(fastify: FastifyInstance) {
  // Create a new site
  fastify.post('/api/admin/sites', async (request, reply) => {
    const body = createSiteSchema.parse(request.body);

    const site = await prisma.site.create({
      data: {
        name: body.name,
        domain: body.domain,
        ownerId: body.ownerId,
      },
    });

    return reply.code(201).send(site);
  });

  // List all sites for an owner
  fastify.get('/api/admin/sites', async (request, reply) => {
    const query = ownerIdQuerySchema.parse(request.query);

    const sites = await prisma.site.findMany({
      where: { ownerId: query.ownerId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        domain: true,
        publicKey: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { sessions: true },
        },
      },
    });

    return sites;
  });

  // Get a specific site
  fastify.get('/api/admin/sites/:siteId', async (request, reply) => {
    const params = siteIdParamSchema.parse(request.params);

    const site = await prisma.site.findUnique({
      where: { id: params.siteId },
      include: {
        _count: {
          select: { sessions: true },
        },
      },
    });

    if (!site) {
      throw new NotFoundError('Site');
    }

    return site;
  });

  // Update a site
  fastify.put('/api/admin/sites/:siteId', async (request, reply) => {
    const params = siteIdParamSchema.parse(request.params);
    const body = updateSiteSchema.parse(request.body);

    const site = await prisma.site.update({
      where: { id: params.siteId },
      data: body,
    });

    return site;
  });

  // Delete a site
  fastify.delete('/api/admin/sites/:siteId', async (request, reply) => {
    const params = siteIdParamSchema.parse(request.params);

    await prisma.site.delete({
      where: { id: params.siteId },
    });

    return { success: true, message: 'Site deleted successfully' };
  });

  // Get analytics for a site
  fastify.get('/api/admin/sites/:siteId/analytics', async (request, reply) => {
    const params = siteIdParamSchema.parse(request.params);

    // Verify site exists
    const site = await prisma.site.findUnique({
      where: { id: params.siteId },
    });

    if (!site) {
      throw new NotFoundError('Site');
    }

    const [sessionsCount, messagesCount, recentSessions] = await Promise.all([
      prisma.chatSession.count({
        where: { siteId: params.siteId },
      }),
      prisma.chatMessage.count({
        where: {
          session: { siteId: params.siteId },
        },
      }),
      prisma.chatSession.findMany({
        where: { siteId: params.siteId },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          _count: {
            select: { messages: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      totalSessions: sessionsCount,
      totalMessages: messagesCount,
      recentSessions: recentSessions.map(session => ({
        id: session.id,
        sessionKey: session.sessionKey,
        createdAt: session.createdAt,
        messageCount: session._count.messages,
        lastMessage: session.messages[0] || null,
      })),
    };
  });

  // Get messages for a session
  fastify.get('/api/admin/sessions/:sessionId/messages', async (request, reply) => {
    const params = sessionIdParamSchema.parse(request.params);

    const session = await prisma.chatSession.findUnique({
      where: { id: params.sessionId },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId: params.sessionId },
      orderBy: { createdAt: 'asc' },
    });

    return messages;
  });
}
