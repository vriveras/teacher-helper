import { describe, it, expect } from 'vitest';
import { bookSchema, licensePolicySchema, tocEntrySchema } from '../../src/schemas/book.schema.js';

describe('Book Schemas', () => {
  describe('licensePolicySchema', () => {
    it('should validate a valid license policy', () => {
      const validPolicy = {
        maxExcerptLength: 500,
        allowWatermark: true,
        usageLogging: true,
      };

      const result = licensePolicySchema.safeParse(validPolicy);
      expect(result.success).toBe(true);
    });

    it('should reject negative maxExcerptLength', () => {
      const invalidPolicy = {
        maxExcerptLength: -1,
        allowWatermark: true,
        usageLogging: true,
      };

      const result = licensePolicySchema.safeParse(invalidPolicy);
      expect(result.success).toBe(false);
    });
  });

  describe('tocEntrySchema', () => {
    it('should validate a simple TOC entry', () => {
      const validEntry = {
        id: 'toc-1',
        title: 'Chapter 1',
        level: 1,
        pageStart: 1,
        pageEnd: 20,
      };

      const result = tocEntrySchema.safeParse(validEntry);
      expect(result.success).toBe(true);
    });

    it('should validate nested TOC entries', () => {
      const validEntry = {
        id: 'toc-1',
        title: 'Chapter 1',
        level: 1,
        children: [
          {
            id: 'toc-1-1',
            title: 'Section 1.1',
            level: 2,
          },
        ],
      };

      const result = tocEntrySchema.safeParse(validEntry);
      expect(result.success).toBe(true);
    });
  });

  describe('bookSchema', () => {
    it('should validate a complete book object', () => {
      const validBook = {
        id: 'book-1',
        title: 'Introduction to Biology',
        edition: '5th',
        subject: 'Biology',
        gradeBand: '9-12',
        language: 'en',
        licensePolicy: {
          maxExcerptLength: 500,
          allowWatermark: true,
          usageLogging: true,
        },
        toc: [
          {
            id: 'toc-1',
            title: 'Chapter 1: Cells',
            level: 1,
            pageStart: 1,
            pageEnd: 50,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = bookSchema.safeParse(validBook);
      expect(result.success).toBe(true);
    });

    it('should require mandatory fields', () => {
      const invalidBook = {
        id: 'book-1',
        title: '',
        subject: 'Biology',
      };

      const result = bookSchema.safeParse(invalidBook);
      expect(result.success).toBe(false);
    });
  });
});
