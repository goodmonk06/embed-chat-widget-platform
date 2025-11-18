import { FastifyInstance } from 'fastify';
import { prisma } from '../db';

export async function adminRoutes(fastify: FastifyInstance) {
  // Create a new site
  fastify.post('/api/admin/sites', async (request, reply) => {
    const { name, domain, ownerId } = request.body as {
      name: string;
      domain: string;
      ownerId: string;
    };

    if (!name || !domain || !ownerId) {
      return reply.code(400).send({ error: 'name, domain, and ownerId are required' });
    }

    const site = await prisma.site.create({
      data: {
        name,
        domain,
        ownerId,
      },
    });

    return site;
  });

  // List all sites for an owner
  fastify.get('/api/admin/sites', async (request, reply) => {
    const { ownerId } = request.query as { ownerId?: string };

    if (!ownerId) {
      return reply.code(400).send({ error: 'ownerId query parameter is required' });
    }

    const sites = await prisma.site.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });

    return sites;
  });

  // Get a specific site
  fastify.get('/api/admin/sites/:siteId', async (request, reply) => {
    const { siteId } = request.params as { siteId: string };

    const site = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return reply.code(404).send({ error: 'Site not found' });
    }

    return site;
  });

  // Update a site
  fastify.put('/api/admin/sites/:siteId', async (request, reply) => {
    const { siteId } = request.params as { siteId: string };
    const { name, domain } = request.body as {
      name?: string;
      domain?: string;
    };

    const site = await prisma.site.update({
      where: { id: siteId },
      data: {
        ...(name && { name }),
        ...(domain && { domain }),
      },
    });

    return site;
  });

  // Delete a site
  fastify.delete('/api/admin/sites/:siteId', async (request, reply) => {
    const { siteId } = request.params as { siteId: string };

    await prisma.site.delete({
      where: { id: siteId },
    });

    return { success: true };
  });

  // Get analytics for a site
  fastify.get('/api/admin/sites/:siteId/analytics', async (request, reply) => {
    const { siteId } = request.params as { siteId: string };

    const [sessionsCount, messagesCount, recentSessions] = await Promise.all([
      prisma.chatSession.count({
        where: { siteId },
      }),
      prisma.chatMessage.count({
        where: {
          session: { siteId },
        },
      }),
      prisma.chatSession.findMany({
        where: { siteId },
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
      recentSessions,
    };
  });

  // Get messages for a session
  fastify.get('/api/admin/sessions/:sessionId/messages', async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });

    return messages;
  });
}
