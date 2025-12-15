import type { FastifyInstance } from 'fastify';
import { getPrisma } from '../lib/index.js';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  });

  app.get('/health/ready', async () => {
    try {
      // Check database connection
      const prisma = getPrisma();
      await prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'connected',
        },
      };
    } catch (error) {
      return {
        statusCode: 503,
        error: 'Service Unavailable',
        message: 'Service not ready',
      };
    }
  });
}
