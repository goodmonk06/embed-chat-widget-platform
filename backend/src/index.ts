import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { widgetRoutes } from './routes/widget';
import { adminRoutes } from './routes/admin';
import { widgetConfigRoutes } from './routes/widget-config';
import { conversationRoutes } from './routes/conversations';
import { tagRoutes } from './routes/tags';
import { templateRoutes } from './routes/templates';
import { handleError } from './utils/errors';
import { initializeDefaultAdapters, adapters } from './lib/adapters';
import { initializeEventHandlers } from './lib/events';
import { OpenAIProviderAdapter, AnthropicProviderAdapter } from './lib/adapters/ai-provider.adapter';
import { logger } from './lib/logger';
import { metrics } from './lib/metrics';

dotenv.config({ path: '../.env' });

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

// Request timing middleware
fastify.addHook('onRequest', async (request, reply) => {
  (request as any).startTime = Date.now();
});

fastify.addHook('onResponse', async (request, reply) => {
  const duration = Date.now() - ((request as any).startTime || Date.now());
  await metrics.measureRequest(
    request.method,
    request.routeOptions.url || request.url,
    reply.statusCode,
    duration
  );
});

async function start() {
  try {
    // Initialize adapters
    logger.info('Initializing adapters...');
    initializeDefaultAdapters();

    // Initialize AI provider
    if (process.env.OPENAI_API_KEY) {
      adapters.register('aiProvider', new OpenAIProviderAdapter(process.env.OPENAI_API_KEY));
      logger.info('Registered OpenAI provider');
    } else if (process.env.ANTHROPIC_API_KEY) {
      adapters.register('aiProvider', new AnthropicProviderAdapter(process.env.ANTHROPIC_API_KEY));
      logger.info('Registered Anthropic provider');
    } else {
      logger.warn('No AI provider configured');
    }

    // Initialize event handlers
    logger.info('Initializing event handlers...');
    initializeEventHandlers();

    // Register CORS for widget embedding
    await fastify.register(cors, {
      origin: true, // Allow all origins for widget embedding
      credentials: true,
    });

    // Global error handler
    fastify.setErrorHandler((error, request, reply) => {
      handleError(error, request, reply);
    });

    // Register routes
    await fastify.register(widgetRoutes);
    await fastify.register(adminRoutes);
    await fastify.register(widgetConfigRoutes);
    await fastify.register(conversationRoutes);
    await fastify.register(tagRoutes);
    await fastify.register(templateRoutes);

    // Health check with adapter status
    fastify.get('/health', async () => {
      const adapterHealth = await adapters.healthCheck();
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        adapters: adapterHealth,
      };
    });

    const port = parseInt(process.env.PORT || '3001', 10);
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });

    logger.info(`Server running at http://localhost:${port}`, { port, host });
    logger.info(`Health check available at http://localhost:${port}/health`);
  } catch (err) {
    logger.error('Failed to start server', err as Error);
    process.exit(1);
  }
}

// Export for testing
export { fastify };

// Start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  start();
}
