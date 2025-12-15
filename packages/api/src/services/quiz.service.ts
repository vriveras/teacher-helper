import type { Quiz } from '@teacher-helper/shared';
import { QuizRepository } from '../repositories/index.js';
import type { ServiceResult } from '../types/index.js';

export class QuizService {
  private repository: QuizRepository;

  constructor() {
    this.repository = new QuizRepository();
  }

  async getAllQuizzes(): Promise<ServiceResult<Quiz[]>> {
    const result = await this.repository.findAll();

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      data: result.data as unknown as Quiz[],
    };
  }

  async getQuizById(id: string): Promise<ServiceResult<Quiz | null>> {
    if (!id) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Quiz ID is required',
        },
      };
    }

    const result = await this.repository.findById(id);

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      data: result.data as unknown as Quiz,
    };
  }
}
