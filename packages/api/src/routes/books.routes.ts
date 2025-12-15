import type { FastifyInstance } from 'fastify';
import type { ApiResponse, Book } from '@teacher-helper/shared';
import { BookService } from '../services/index.js';

export async function booksRoutes(app: FastifyInstance): Promise<void> {
  const bookService = new BookService();

  app.get<{ Reply: ApiResponse<Book[]> }>('/api/v1/books', async (_request, reply) => {
    const result = await bookService.getAllBooks();

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
    Reply: ApiResponse<Book | null>;
  }>('/api/v1/books/:id', async (request, reply) => {
    const { id } = request.params;
    const result = await bookService.getBookById(id);

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
          message: 'Book not found',
        },
      });
    }

    return reply.send({
      success: true,
      data: result.data,
    });
  });
}
