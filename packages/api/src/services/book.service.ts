import type { Book } from '@teacher-helper/shared';
import { BookRepository } from '../repositories/index.js';
import type { ServiceResult } from '../types/index.js';

export class BookService {
  private repository: BookRepository;

  constructor() {
    this.repository = new BookRepository();
  }

  async getAllBooks(): Promise<ServiceResult<Book[]>> {
    const result = await this.repository.findAll();

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      data: result.data as unknown as Book[],
    };
  }

  async getBookById(id: string): Promise<ServiceResult<Book | null>> {
    if (!id) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Book ID is required',
        },
      };
    }

    const result = await this.repository.findById(id);

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      data: result.data as unknown as Book,
    };
  }
}
