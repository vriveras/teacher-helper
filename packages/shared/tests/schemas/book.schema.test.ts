import { describe, it, expect } from 'vitest';
import {
  bookSchema,
  licensePolicySchema,
  tocEntrySchema,
  bookStatusSchema,
  bookFileMetadataSchema,
  createBookInputSchema,
  updateBookInputSchema,
  chunkSchema,
  chunkLocationSchema,
  createChunkInputSchema,
  validateTokenCount,
  chunkingConfigSchema,
  chunkSearchResultSchema,
  embeddingSchema,
  bookIngestionProgressSchema,
} from '../../src/schemas/book.schema.js';

describe('Book Schemas', () => {
  describe('bookStatusSchema', () => {
    it('should accept all valid status values', () => {
      const validStatuses = ['PENDING', 'PROCESSING', 'CHUNKED', 'INDEXING', 'READY', 'ERROR'];
      
      validStatuses.forEach((status) => {
        const result = bookStatusSchema.safeParse(status);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid status values', () => {
      const invalidStatuses = ['UNKNOWN', 'pending', 'Started', ''];
      
      invalidStatuses.forEach((status) => {
        const result = bookStatusSchema.safeParse(status);
        expect(result.success).toBe(false);
      });
    });
  });

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

    it('should accept zero maxExcerptLength', () => {
      const validPolicy = {
        maxExcerptLength: 0,
        allowWatermark: false,
        usageLogging: false,
      };

      const result = licensePolicySchema.safeParse(validPolicy);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidPolicy = {
        maxExcerptLength: 500,
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

    it('should reject negative level', () => {
      const invalidEntry = {
        id: 'toc-1',
        title: 'Chapter 1',
        level: -1,
      };

      const result = tocEntrySchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
    });
  });

  describe('bookFileMetadataSchema', () => {
    it('should validate valid file metadata', () => {
      const validMetadata = {
        fileName: 'biology-textbook.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        storageKey: 's3://bucket/books/biology-textbook.pdf',
      };

      const result = bookFileMetadataSchema.safeParse(validMetadata);
      expect(result.success).toBe(true);
    });

    it('should reject empty fileName', () => {
      const invalidMetadata = {
        fileName: '',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        storageKey: 's3://bucket/books/file.pdf',
      };

      const result = bookFileMetadataSchema.safeParse(invalidMetadata);
      expect(result.success).toBe(false);
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
        status: 'PENDING',
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

  describe('createBookInputSchema', () => {
    it('should validate a valid create book input', () => {
      const validInput = {
        title: 'New Book',
        subject: 'Science',
        gradeBand: '6-8',
        licensePolicy: {
          maxExcerptLength: 500,
          allowWatermark: true,
          usageLogging: true,
        },
      };

      const result = createBookInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should apply default language', () => {
      const validInput = {
        title: 'New Book',
        subject: 'Science',
        gradeBand: '6-8',
        licensePolicy: {
          maxExcerptLength: 500,
          allowWatermark: true,
          usageLogging: true,
        },
      };

      const result = createBookInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.language).toBe('en');
      }
    });

    it('should reject empty title', () => {
      const invalidInput = {
        title: '',
        subject: 'Science',
        gradeBand: '6-8',
        licensePolicy: {
          maxExcerptLength: 500,
          allowWatermark: true,
          usageLogging: true,
        },
      };

      const result = createBookInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });
});

describe('Chunk Schemas', () => {
  describe('chunkLocationSchema', () => {
    it('should validate a complete location', () => {
      const validLocation = {
        chapter: 'Chapter 1',
        section: 'Section 1.1',
        pageStart: 10,
        pageEnd: 15,
      };

      const result = chunkLocationSchema.safeParse(validLocation);
      expect(result.success).toBe(true);
    });

    it('should accept partial location', () => {
      const partialLocation = {
        chapter: 'Chapter 1',
      };

      const result = chunkLocationSchema.safeParse(partialLocation);
      expect(result.success).toBe(true);
    });

    it('should accept empty location', () => {
      const result = chunkLocationSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('chunkSchema', () => {
    it('should validate a complete chunk', () => {
      const validChunk = {
        id: 'chunk-1',
        bookId: 'book-1',
        chapter: 'Chapter 1',
        section: 'Section 1.1',
        pageStart: 10,
        pageEnd: 12,
        text: 'This is the content of the chunk.',
        tokenCount: 450,
        sequence: 0,
        hash: 'abc123def456',
        createdAt: new Date(),
      };

      const result = chunkSchema.safeParse(validChunk);
      expect(result.success).toBe(true);
    });

    it('should reject empty text', () => {
      const invalidChunk = {
        id: 'chunk-1',
        bookId: 'book-1',
        text: '',
        tokenCount: 0,
        sequence: 0,
        hash: 'abc123',
        createdAt: new Date(),
      };

      const result = chunkSchema.safeParse(invalidChunk);
      expect(result.success).toBe(false);
    });

    it('should reject negative sequence', () => {
      const invalidChunk = {
        id: 'chunk-1',
        bookId: 'book-1',
        text: 'Valid text content',
        tokenCount: 100,
        sequence: -1,
        hash: 'abc123',
        createdAt: new Date(),
      };

      const result = chunkSchema.safeParse(invalidChunk);
      expect(result.success).toBe(false);
    });

    it('should accept chunk with embedding', () => {
      const chunkWithEmbedding = {
        id: 'chunk-1',
        bookId: 'book-1',
        text: 'Content with embedding',
        tokenCount: 100,
        sequence: 0,
        hash: 'abc123',
        embedding: [0.1, 0.2, 0.3, 0.4, 0.5],
        embeddingId: 'emb-1',
        neo4jNodeId: 'neo4j-123',
        createdAt: new Date(),
      };

      const result = chunkSchema.safeParse(chunkWithEmbedding);
      expect(result.success).toBe(true);
    });
  });

  describe('createChunkInputSchema', () => {
    it('should validate a valid chunk input', () => {
      const validInput = {
        bookId: 'book-1',
        chapter: 'Chapter 1',
        section: 'Section 1.1',
        pageStart: 10,
        pageEnd: 12,
        text: 'This is valid chunk text content.',
        tokenCount: 450,
        sequence: 0,
        hash: 'sha256-hash-here',
      };

      const result = createChunkInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject missing bookId', () => {
      const invalidInput = {
        text: 'Some text',
        tokenCount: 100,
        sequence: 0,
        hash: 'abc123',
      };

      const result = createChunkInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty bookId', () => {
      const invalidInput = {
        bookId: '',
        text: 'Some text',
        tokenCount: 100,
        sequence: 0,
        hash: 'abc123',
      };

      const result = createChunkInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject zero tokenCount', () => {
      const invalidInput = {
        bookId: 'book-1',
        text: 'Some text',
        tokenCount: 0,
        sequence: 0,
        hash: 'abc123',
      };

      const result = createChunkInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('validateTokenCount - Token Count Boundaries (300-800)', () => {
    it('should reject token count below minimum (299)', () => {
      const result = validateTokenCount.safeParse(299);
      expect(result.success).toBe(false);
    });

    it('should accept token count at minimum boundary (300)', () => {
      const result = validateTokenCount.safeParse(300);
      expect(result.success).toBe(true);
    });

    it('should accept token count in valid range (500)', () => {
      const result = validateTokenCount.safeParse(500);
      expect(result.success).toBe(true);
    });

    it('should accept token count at maximum boundary (800)', () => {
      const result = validateTokenCount.safeParse(800);
      expect(result.success).toBe(true);
    });

    it('should reject token count above maximum (801)', () => {
      const result = validateTokenCount.safeParse(801);
      expect(result.success).toBe(false);
    });

    it('should reject token count of 0', () => {
      const result = validateTokenCount.safeParse(0);
      expect(result.success).toBe(false);
    });

    it('should reject negative token count', () => {
      const result = validateTokenCount.safeParse(-100);
      expect(result.success).toBe(false);
    });

    it('should reject token count far above maximum (1000)', () => {
      const result = validateTokenCount.safeParse(1000);
      expect(result.success).toBe(false);
    });
  });
});