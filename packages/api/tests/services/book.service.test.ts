import { describe, it, expect } from 'vitest';
import { BookService } from '../../src/services/book.service.js';

describe('BookService', () => {
  it('should create a BookService instance', () => {
    const service = new BookService();
    expect(service).toBeDefined();
  });

  it('should validate book ID in getBookById', async () => {
    const service = new BookService();
    const result = await service.getBookById('');

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('VALIDATION_ERROR');
    expect(result.error?.message).toContain('Book ID is required');
  });

  // Note: Full integration tests with database would go here
  // For now, we're testing the validation layer
});
