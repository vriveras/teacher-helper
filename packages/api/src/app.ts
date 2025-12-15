import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { getEnv } from './config/env.js';
import { registerRoutes } from './routes/index.js';
import { errorHandler } from './middleware/index.js';

export async function createApp(): Promise<FastifyInstance> {
  const env = getEnv();

  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport:
        env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: { colorize: true },
            }
          : undefined,
    },
  });

  // Register error handler
  app.setErrorHandler(errorHandler);

  // Register plugins
  await app.register(cors, {
    origin: env.CORS_ORIGIN || (env.NODE_ENV === 'production' ? false : true),
  });

  await app.register(helmet);

  // Register routes
  await registerRoutes(app);

  return app;
}
