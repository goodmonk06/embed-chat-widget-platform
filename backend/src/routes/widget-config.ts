import { FastifyInstance } from 'fastify';
import { prisma } from '../db';
import {
  createWidgetConfigSchema,
  updateWidgetConfigSchema,
  siteIdParamSchema,
} from '../schemas';
import { NotFoundError } from '../utils/errors';
import { eventBus, EventTypes } from '../lib/events';

export async function widgetConfigRoutes(fastify: FastifyInstance) {
  // Create or update widget configuration
  fastify.post('/api/admin/sites/:siteId/widget-config', async (request, reply) => {
    const params = siteIdParamSchema.parse(request.params);
    const body = createWidgetConfigSchema.parse(request.body);

    // Verify site exists
    const site = await prisma.site.findUnique({
      where: { id: params.siteId },
    });

    if (!site) {
      throw new NotFoundError('Site');
    }

    // Check if config already exists
    const existing = await prisma.widgetConfiguration.findUnique({
      where: { siteId: params.siteId },
    });

    let config;
    if (existing) {
      // Update existing
      config = await prisma.widgetConfiguration.update({
        where: { siteId: params.siteId },
        data: body,
      });
    } else {
      // Create new
      config = await prisma.widgetConfiguration.create({
        data: {
          siteId: params.siteId,
          ...body,
        },
      });
    }

    // Emit event
    await eventBus.emit(EventTypes.WIDGET_CONFIGURATION_UPDATED, {
      siteId: params.siteId,
      configurationId: config.id,
      changes: body,
    });

    return config;
  });

  // Get widget configuration
  fastify.get('/api/admin/sites/:siteId/widget-config', async (request, reply) => {
    const params = siteIdParamSchema.parse(request.params);

    const config = await prisma.widgetConfiguration.findUnique({
      where: { siteId: params.siteId },
    });

    if (!config) {
      // Return default configuration
      return {
        siteId: params.siteId,
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        position: 'BOTTOM_RIGHT',
        greetingMessage: 'Hello! How can we help you today?',
        placeholderText: 'Type your message...',
        headerText: 'Chat with us',
        borderRadius: 12,
        showBranding: true,
      };
    }

    return config;
  });

  // Update widget configuration
  fastify.put('/api/admin/sites/:siteId/widget-config', async (request, reply) => {
    const params = siteIdParamSchema.parse(request.params);
    const body = updateWidgetConfigSchema.parse(request.body);

    const config = await prisma.widgetConfiguration.update({
      where: { siteId: params.siteId },
      data: body,
    });

    // Emit event
    await eventBus.emit(EventTypes.WIDGET_CONFIGURATION_UPDATED, {
      siteId: params.siteId,
      configurationId: config.id,
      changes: body,
    });

    return config;
  });

  // Delete widget configuration (resets to default)
  fastify.delete('/api/admin/sites/:siteId/widget-config', async (request, reply) => {
    const params = siteIdParamSchema.parse(request.params);

    await prisma.widgetConfiguration.delete({
      where: { siteId: params.siteId },
    });

    return { success: true, message: 'Widget configuration reset to default' };
  });

  // Get widget configuration for widget (public endpoint)
  fastify.get('/api/widget/config/:siteKey', async (request, reply) => {
    const { siteKey } = request.params as { siteKey: string };

    const site = await prisma.site.findUnique({
      where: { publicKey: siteKey },
      include: { configuration: true },
    });

    if (!site) {
      throw new NotFoundError('Site');
    }

    // Return config or defaults
    const config = site.configuration || {
      primaryColor: '#667eea',
      secondaryColor: '#764ba2',
      position: 'BOTTOM_RIGHT',
      greetingMessage: 'Hello! How can we help you today?',
      placeholderText: 'Type your message...',
      headerText: 'Chat with us',
      borderRadius: 12,
      showBranding: true,
    };

    return config;
  });
}
