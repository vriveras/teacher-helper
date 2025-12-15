import type { FastifyInstance } from 'fastify';
import type { ApiResponse, Quiz } from '@teacher-helper/shared';
import { QuizService } from '../services/index.js';

export async function quizzesRoutes(app: FastifyInstance): Promise<void> {
  const quizService = new QuizService();

  app.get<{ Reply: ApiResponse<Quiz[]> }>('/api/v1/quizzes', async (_request, reply) => {
    const result = await quizService.getAllQuizzes();

    if (!result.success) {
      return reply.status(500).send({
        success: false,
        error: result.error,
      });
    }

    return reply.send({
      success: true,
      data: result.data,
    });
  });

  app.get<{
    Params: { id: string };
    Reply: ApiResponse<Quiz | null>;
  }>('/api/v1/quizzes/:id', async (request, reply) => {
    const { id } = request.params;
    const result = await quizService.getQuizById(id);

    if (!result.success) {
      return reply.status(500).send({
        success: false,
        error: result.error,
      });
    }

    if (!result.data) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Quiz not found',
        },
      });
    }

    return reply.send({
      success: true,
      data: result.data,
    });
  });
}
