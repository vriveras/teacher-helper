/**
 * Book and Chunk data models for TeacherHelper KB-Ingestion
 *
 * These types support the book upload -> chunk -> index pipeline.
 * Chunk sizes are optimized for 300-800 tokens as per project requirements.
 */

/**
 * Processing status for books in the ingestion pipeline
 */
export type BookStatus =
  | 'PENDING' // Uploaded, waiting for processing
  | 'PROCESSING' // Currently being processed (parsing, chunking)
  | 'CHUNKED' // Text extraction and chunking complete
  | 'INDEXING' // Generating embeddings and indexing
  | 'READY' // Fully processed and searchable
  | 'ERROR'; // Processing failed

/**
 * License policy for book content usage
 */
export interface LicensePolicy {
  /** Maximum characters allowed in a single excerpt */
  maxExcerptLength: number;
  /** Whether watermarks should be applied to excerpts */
  allowWatermark: boolean;
  /** Whether to log usage of this book's content */
  usageLogging: boolean;
}

/**
 * Table of Contents entry with hierarchical structure
 */
export interface TableOfContentsEntry {
  id: string;
  title: string;
  /** Depth level in the TOC hierarchy (0 = chapter, 1 = section, etc.) */
  level: number;
  pageStart?: number;
  pageEnd?: number;
  children?: TableOfContentsEntry[];
}

/**
 * File metadata for uploaded books
 */
export interface BookFileMetadata {
  fileName: string;
  fileSize: number; // Size in bytes
  mimeType: string; // e.g., "application/pdf"
  storageKey: string; // S3 key or local file path
}

/**
 * Book represents an uploaded educational book/document
 */
export interface Book {
  id: string;
  title: string;
  edition?: string;
  subject: string;
  gradeBand: string;
  language: string;
  licensePolicy: LicensePolicy;
  toc?: TableOfContentsEntry[];

  // File metadata (present for uploaded books)
  fileMetadata?: BookFileMetadata;

  // Processing status
  status: BookStatus;
  totalPages?: number;
  processedAt?: Date;
  errorMessage?: string;

  // Ownership
  uploadedById?: string;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input type for creating a new book
 */
export interface CreateBookInput {
  title: string;
  edition?: string;
  subject: string;
  gradeBand: string;
  language?: string;
  licensePolicy: LicensePolicy;
  fileMetadata?: BookFileMetadata;
  uploadedById?: string;
}

/**
 * Input type for updating a book
 */
export interface UpdateBookInput {
  title?: string;
  edition?: string;
  subject?: string;
  gradeBand?: string;
  language?: string;
  licensePolicy?: LicensePolicy;
  toc?: TableOfContentsEntry[];
  status?: BookStatus;
  totalPages?: number;
  processedAt?: Date;
  errorMessage?: string;
}

/**
 * Chunk location metadata within a book
 */
export interface ChunkLocation {
  chapter?: string;
  section?: string;
  pageStart?: number;
  pageEnd?: number;
}

/**
 * Chunk represents a text segment from a book
 * Optimized for 300-800 tokens as per project requirements
 */
export interface Chunk {
  id: string;
  bookId: string;

  // Location metadata
  chapter?: string;
  section?: string;
  pageStart?: number;
  pageEnd?: number;

  // Content
  text: string;

  // Token management (300-800 tokens recommended)
  tokenCount: number;

  // Ordering within book
  sequence: number;

  // Deduplication
  hash: string; // SHA-256 hash of text content

  // Vector embedding (optional, populated after embedding generation)
  embedding?: number[];
  embeddingId?: string;

  // Neo4j reference for graph relationships
  neo4jNodeId?: string;

  createdAt: Date;
}

/**
 * Input type for creating a new chunk
 */
export interface CreateChunkInput {
  bookId: string;
  chapter?: string;
  section?: string;
  pageStart?: number;
  pageEnd?: number;
  text: string;
  tokenCount: number;
  sequence: number;
  hash: string;
}

/**
 * Chunk with its associated book (for API responses)
 */
export interface ChunkWithBook extends Chunk {
  book: Book;
}

/**
 * Chunk search result with relevance score
 */
export interface ChunkSearchResult {
  chunk: Chunk;
  score: number; // Relevance score (0-1)
  matchType: 'vector' | 'lexical' | 'hybrid';
}

/**
 * Configuration for chunk generation
 */
export interface ChunkingConfig {
  /** Minimum tokens per chunk (default: 300) */
  minTokens: number;
  /** Maximum tokens per chunk (default: 800) */
  maxTokens: number;
  /** Target tokens per chunk (default: 500) */
  targetTokens: number;
  /** Overlap tokens between chunks for context continuity */
  overlapTokens: number;
  /** Whether to respect section boundaries when chunking */
  respectSectionBoundaries: boolean;
}

/**
 * Default chunking configuration
 */
export const DEFAULT_CHUNKING_CONFIG: ChunkingConfig = {
  minTokens: 300,
  maxTokens: 800,
  targetTokens: 500,
  overlapTokens: 50,
  respectSectionBoundaries: true,
};

/**
 * Embedding metadata
 */
export interface Embedding {
  id: string;
  vector: number[];
  model: string; // Model used to generate embedding (e.g., "text-embedding-ada-002")
  createdAt: Date;
}

/**
 * Book ingestion progress tracking
 */
export interface BookIngestionProgress {
  bookId: string;
  status: BookStatus;
  totalPages: number;
  processedPages: number;
  totalChunks: number;
  embeddedChunks: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}
