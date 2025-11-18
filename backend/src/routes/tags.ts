import { FastifyInstance } from 'fastify';
import { prisma } from '../db';
import { createTagSchema, updateTagSchema } from '../schemas';
import { NotFoundError } from '../utils/errors';

export async function tagRoutes(fastify: FastifyInstance) {
  // Create tag
  fastify.post('/api/admin/tags', async (request, reply) => {
    const body = createTagSchema.parse(request.body);

    const tag = await prisma.conversationTag.create({
      data: body,
    });

    return reply.code(201).send(tag);
  });

  // List all tags
  fastify.get('/api/admin/tags', async (request, reply) => {
    const tags = await prisma.conversationTag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { sessions: true },
        },
      },
    });

    return tags.map(tag => ({
      ...tag,
      usageCount: tag._count.sessions,
    }));
  });

  // Get specific tag
  fastify.get('/api/admin/tags/:tagId', async (request, reply) => {
    const { tagId } = request.params as { tagId: string };

    const tag = await prisma.conversationTag.findUnique({
      where: { id: tagId },
      include: {
        _count: {
          select: { sessions: true },
        },
      },
    });

    if (!tag) {
      throw new NotFoundError('Tag');
    }

    return {
      ...tag,
      usageCount: tag._count.sessions,
    };
  });

  // Update tag
  fastify.put('/api/admin/tags/:tagId', async (request, reply) => {
    const { tagId } = request.params as { tagId: string };
    const body = updateTagSchema.parse(request.body);

    const tag = await prisma.conversationTag.update({
      where: { id: tagId },
      data: body,
    });

    return tag;
  });

  // Delete tag
  fastify.delete('/api/admin/tags/:tagId', async (request, reply) => {
    const { tagId } = request.params as { tagId: string };

    await prisma.conversationTag.delete({
      where: { id: tagId },
    });

    return { success: true, message: 'Tag deleted successfully' };
  });
}
