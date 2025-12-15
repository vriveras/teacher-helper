import { z } from 'zod';

/**
 * Book status enum for processing pipeline
 */
export const bookStatusSchema = z.enum([
  'PENDING',
  'PROCESSING',
  'CHUNKED',
  'INDEXING',
  'READY',
  'ERROR',
]);

/**
 * License policy for book content usage
 */
export const licensePolicySchema = z.object({
  maxExcerptLength: z.number().min(0),
  allowWatermark: z.boolean(),
  usageLogging: z.boolean(),
});

/**
 * Table of Contents entry (recursive)
 */
export const tocEntrySchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string(),
    title: z.string(),
    level: z.number().min(0),
    pageStart: z.number().optional(),
    pageEnd: z.number().optional(),
    children: z.array(tocEntrySchema).optional(),
  })
);

/**
 * File metadata for uploaded books
 */
export const bookFileMetadataSchema = z.object({
  fileName: z.string().min(1),
  fileSize: z.number().min(0),
  mimeType: z.string().min(1),
  storageKey: z.string().min(1),
});

/**
 * Full book schema
 */
export const bookSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  edition: z.string().optional(),
  subject: z.string().min(1),
  gradeBand: z.string().min(1),
  language: z.string().min(1),
  licensePolicy: licensePolicySchema,
  toc: z.array(tocEntrySchema).optional(),
  fileMetadata: bookFileMetadataSchema.optional(),
  status: bookStatusSchema,
  totalPages: z.number().optional(),
  processedAt: z.date().optional(),
  errorMessage: z.string().optional(),
  uploadedById: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Schema for creating a new book
 */
export const createBookInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  edition: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  gradeBand: z.string().min(1, 'Grade band is required'),
  language: z.string().min(1).default('en'),
  licensePolicy: licensePolicySchema,
  fileMetadata: bookFileMetadataSchema.optional(),
  uploadedById: z.string().optional(),
});

/**
 * Schema for updating a book
 */
export const updateBookInputSchema = z.object({
  title: z.string().min(1).optional(),
  edition: z.string().optional(),
  subject: z.string().min(1).optional(),
  gradeBand: z.string().min(1).optional(),
  language: z.string().min(1).optional(),
  licensePolicy: licensePolicySchema.optional(),
  toc: z.array(tocEntrySchema).optional(),
  status: bookStatusSchema.optional(),
  totalPages: z.number().optional(),
  processedAt: z.date().optional(),
  errorMessage: z.string().optional(),
});

/**
 * Chunk location metadata
 */
export const chunkLocationSchema = z.object({
  chapter: z.string().optional(),
  section: z.string().optional(),
  pageStart: z.number().optional(),
  pageEnd: z.number().optional(),
});

/**
 * Full chunk schema
 */
export const chunkSchema = z.object({
  id: z.string(),
  bookId: z.string(),
  chapter: z.string().optional(),
  section: z.string().optional(),
  pageStart: z.number().optional(),
  pageEnd: z.number().optional(),
  text: z.string().min(1),
  tokenCount: z.number().min(1),
  sequence: z.number().min(0),
  hash: z.string().min(1),
  embedding: z.array(z.number()).optional(),
  embeddingId: z.string().optional(),
  neo4jNodeId: z.string().optional(),
  createdAt: z.date(),
});

/**
 * Schema for creating a new chunk
 */
export const createChunkInputSchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
  chapter: z.string().optional(),
  section: z.string().optional(),
  pageStart: z.number().optional(),
  pageEnd: z.number().optional(),
  text: z.string().min(1, 'Text content is required'),
  tokenCount: z.number().min(1, 'Token count must be at least 1'),
  sequence: z.number().min(0, 'Sequence must be non-negative'),
  hash: z.string().min(1, 'Hash is required'),
});

/**
 * Token count validation (300-800 tokens as per requirements)
 */
export const validateTokenCount = z
  .number()
  .min(300, 'Chunk must have at least 300 tokens')
  .max(800, 'Chunk cannot exceed 800 tokens');

/**
 * Chunking configuration schema
 */
export const chunkingConfigSchema = z
  .object({
    minTokens: z.number().min(1).default(300),
    maxTokens: z.number().min(1).default(800),
    targetTokens: z.number().min(1).default(500),
    overlapTokens: z.number().min(0).default(50),
    respectSectionBoundaries: z.boolean().default(true),
  })
  .refine(
    (data) => data.minTokens <= data.targetTokens && data.targetTokens <= data.maxTokens,
    'Token counts must satisfy: minTokens <= targetTokens <= maxTokens'
  );

/**
 * Chunk search result schema
 */
export const chunkSearchResultSchema = z.object({
  chunk: chunkSchema,
  score: z.number().min(0).max(1),
  matchType: z.enum(['vector', 'lexical', 'hybrid']),
});

/**
 * Embedding schema
 */
export const embeddingSchema = z.object({
  id: z.string(),
  vector: z.array(z.number()),
  model: z.string(),
  createdAt: z.date(),
});

/**
 * Book ingestion progress schema
 */
export const bookIngestionProgressSchema = z.object({
  bookId: z.string(),
  status: bookStatusSchema,
  totalPages: z.number(),
  processedPages: z.number(),
  totalChunks: z.number(),
  embeddedChunks: z.number(),
  startedAt: z.date(),
  completedAt: z.date().optional(),
  error: z.string().optional(),
});

// Type exports from schemas
export type BookInput = z.infer<typeof bookSchema>;
export type CreateBookInput = z.infer<typeof createBookInputSchema>;
export type UpdateBookInput = z.infer<typeof updateBookInputSchema>;
export type ChunkInput = z.infer<typeof chunkSchema>;
export type CreateChunkInput = z.infer<typeof createChunkInputSchema>;
export type ChunkingConfig = z.infer<typeof chunkingConfigSchema>;
export type BookStatus = z.infer<typeof bookStatusSchema>;
