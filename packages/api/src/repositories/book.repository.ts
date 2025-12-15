import { getPrisma } from '../lib/index.js';
import type { ServiceResult } from '../types/index.js';

export class BookRepository {
  async findAll(): Promise<ServiceResult<any[]>> {
    try {
      const prisma = getPrisma();
      const books = await prisma.book.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        data: books,
      };
    } catch (error) {
      console.error('BookRepository.findAll error:', error);
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch books',
        },
      };
    }
  }

  async findById(id: string): Promise<ServiceResult<any | null>> {
    try {
      const prisma = getPrisma();
      const book = await prisma.book.findUnique({
        where: { id },
      });

      return {
        success: true,
        data: book,
      };
    } catch (error) {
      console.error('BookRepository.findById error:', error);
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch book',
        },
      };
    }
  }

  async create(data: any): Promise<ServiceResult<any>> {
    try {
      const prisma = getPrisma();
      const book = await prisma.book.create({
        data,
      });

      return {
        success: true,
        data: book,
      };
    } catch (error) {
      console.error('BookRepository.create error:', error);
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to create book',
        },
      };
    }
  }
}
