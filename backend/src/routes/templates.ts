import { FastifyInstance } from 'fastify';
import { prisma } from '../db';
import { createTemplateSchema, updateTemplateSchema, siteIdParamSchema } from '../schemas';
import { NotFoundError } from '../utils/errors';

export async function templateRoutes(fastify: FastifyInstance) {
  // Create template
  fastify.post('/api/admin/templates', async (request, reply) => {
    const body = createTemplateSchema.parse(request.body);

    // Verify site exists
    const site = await prisma.site.findUnique({
      where: { id: body.siteId },
    });

    if (!site) {
      throw new NotFoundError('Site');
    }

    const template = await prisma.messageTemplate.create({
      data: body,
    });

    return reply.code(201).send(template);
  });

  // List templates for a site
  fastify.get('/api/admin/sites/:siteId/templates', async (request, reply) => {
    const params = siteIdParamSchema.parse(request.params);
    const { category, isActive } = request.query as { category?: string; isActive?: string };

    const where: any = {
      siteId: params.siteId,
    };

    if (category) {
      where.category = category;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const templates = await prisma.messageTemplate.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return templates;
  });

  // Get specific template
  fastify.get('/api/admin/templates/:templateId', async (request, reply) => {
    const { templateId } = request.params as { templateId: string };

    const template = await prisma.messageTemplate.findUnique({
      where: { id: templateId },
      include: {
        site: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundError('Template');
    }

    return template;
  });

  // Update template
  fastify.put('/api/admin/templates/:templateId', async (request, reply) => {
    const { templateId } = request.params as { templateId: string };
    const body = updateTemplateSchema.parse(request.body);

    const template = await prisma.messageTemplate.update({
      where: { id: templateId },
      data: body,
    });

    return template;
  });

  // Delete template
  fastify.delete('/api/admin/templates/:templateId', async (request, reply) => {
    const { templateId } = request.params as { templateId: string };

    await prisma.messageTemplate.delete({
      where: { id: templateId },
    });

    return { success: true, message: 'Template deleted successfully' };
  });

  // Get templates by category (public endpoint for widget)
  fastify.get('/api/widget/templates/:siteKey/:category', async (request, reply) => {
    const { siteKey, category } = request.params as { siteKey: string; category: string };

    const site = await prisma.site.findUnique({
      where: { publicKey: siteKey },
    });

    if (!site) {
      throw new NotFoundError('Site');
    }

    const templates = await prisma.messageTemplate.findMany({
      where: {
        siteId: site.id,
        category: category.toUpperCase() as any,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
      },
    });

    return templates;
  });
}
