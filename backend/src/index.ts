import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { widgetRoutes } from './routes/widget';
import { adminRoutes } from './routes/admin';

dotenv.config({ path: '../.env' });

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

async function start() {
  try {
    // Register CORS for widget embedding
    await fastify.register(cors, {
      origin: true, // Allow all origins for widget embedding
      credentials: true,
    });

    // Register routes
    await fastify.register(widgetRoutes);
    await fastify.register(adminRoutes);

    // Health check
    fastify.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    const port = parseInt(process.env.PORT || '3001', 10);
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });

    console.log(`🚀 Server running at http://localhost:${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
