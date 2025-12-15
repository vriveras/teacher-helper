import type { FastifyInstance } from 'fastify';
import { healthRoutes } from './health.routes.js';
import { booksRoutes } from './books.routes.js';
import { quizzesRoutes } from './quizzes.routes.js';

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  await healthRoutes(app);
  await booksRoutes(app);
  await quizzesRoutes(app);
}
