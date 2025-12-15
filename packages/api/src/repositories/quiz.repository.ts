import { getPrisma } from '../lib/index.js';
import type { ServiceResult } from '../types/index.js';

export class QuizRepository {
  async findAll(): Promise<ServiceResult<any[]>> {
    try {
      const prisma = getPrisma();
      const quizzes = await prisma.quiz.findMany({
        include: { project: true },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        data: quizzes,
      };
    } catch (error) {
      console.error('QuizRepository.findAll error:', error);
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch quizzes',
        },
      };
    }
  }

  async findById(id: string): Promise<ServiceResult<any | null>> {
    try {
      const prisma = getPrisma();
      const quiz = await prisma.quiz.findUnique({
        where: { id },
        include: { project: true },
      });

      return {
        success: true,
        data: quiz,
      };
    } catch (error) {
      console.error('QuizRepository.findById error:', error);
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch quiz',
        },
      };
    }
  }

  async create(data: any): Promise<ServiceResult<any>> {
    try {
      const prisma = getPrisma();
      const quiz = await prisma.quiz.create({
        data,
      });

      return {
        success: true,
        data: quiz,
      };
    } catch (error) {
      console.error('QuizRepository.create error:', error);
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to create quiz',
        },
      };
    }
  }
}
