import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { PrismaClient } from '@prisma/client';
import type { Book, Quiz, ApiResponse } from '@teacher-helper/shared';

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize Fastify
const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: { colorize: true },
          }
        : undefined,
  },
});

// Register plugins
await app.register(cors, {
  origin: process.env.NODE_ENV === 'production' ? false : true,
});

await app.register(helmet);

// Health check
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// API routes
app.get('/api/v1/books', async (): Promise<ApiResponse<Book[]>> => {
  try {
    const books = await prisma.book.findMany();
    return {
      success: true,
      data: books as unknown as Book[],
    };
  } catch (error) {
    app.log.error(error);
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch books',
      },
    };
  }
});

app.get('/api/v1/quizzes', async (): Promise<ApiResponse<Quiz[]>> => {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: { project: true },
    });
    return {
      success: true,
      data: quizzes as unknown as Quiz[],
    };
  } catch (error) {
    app.log.error(error);
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch quizzes',
      },
    };
  }
});

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.API_PORT || '3001', 10);
    const host = process.env.API_HOST || '0.0.0.0';

    await app.listen({ port, host });
    app.log.info(`TeacherHelper API running on http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async () => {
  app.log.info('Shutting down...');
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
