/**
 * Chunking Types for TeacherHelper KB-Ingestion
 *
 * These types define the input/output structure for the chunking service,
 * which processes ParsedPDF output into token-bounded chunks (300-800 tokens).
 */

import type { ParsedPDF } from './pdf.types.js';
import type { ChunkingConfig, CreateChunkInput } from './book.types.js';

/**
 * Input for the chunking service
 */
export interface ChunkingInput {
  /** Book ID for associating chunks */
  bookId: string;
  /** Parsed PDF document to chunk */
  parsedPdf: ParsedPDF;
  /** Optional chunking configuration overrides */
  config?: Partial<ChunkingConfig>;
}

/**
 * Metadata for a single chunk
 */
export interface ChunkMetadata {
  /** Chapter heading if available */
  chapter?: string;
  /** Section heading if available */
  section?: string;
  /** Starting page number */
  pageStart?: number;
  /** Ending page number */
  pageEnd?: number;
  /** Heading context for this chunk */
  headingContext?: string;
}

/**
 * A single chunk of text with metadata
 */
export interface ChunkData {
  /** The text content of the chunk */
  text: string;
  /** Token count for this chunk */
  tokenCount: number;
  /** Sequential order within the document */
  sequence: number;
  /** SHA-256 hash of the text content */
  hash: string;
  /** Location and context metadata */
  metadata: ChunkMetadata;
}

/**
 * Statistics about the chunking process
 */
export interface ChunkingStats {
  /** Total chunks created */
  totalChunks: number;
  /** Average tokens per chunk */
  averageTokens: number;
  /** Minimum tokens in any chunk */
  minTokens: number;
  /** Maximum tokens in any chunk */
  maxTokens: number;
  /** Total tokens processed */
  totalTokens: number;
  /** Number of paragraphs processed */
  paragraphsProcessed: number;
  /** Number of sections processed */
  sectionsProcessed: number;
  /** Number of merges performed (small chunks combined) */
  mergeCount: number;
  /** Number of splits performed (large paragraphs split) */
  splitCount: number;
}

/**
 * Result of the chunking operation
 */
export interface ChunkingResult {
  /** Whether chunking was successful */
  success: boolean;
  /** Array of generated chunks */
  chunks: ChunkData[];
  /** Statistics about the chunking process */
  stats: ChunkingStats;
  /** Configuration used for chunking */
  config: ChunkingConfig;
  /** Error information if chunking failed */
  error?: ChunkingError;
}

/**
 * Error information for chunking failures
 */
export interface ChunkingError {
  /** Error code */
  code: ChunkingErrorCode;
  /** Human-readable error message */
  message: string;
  /** Additional details */
  details?: string;
}

/**
 * Error codes for chunking failures
 */
export type ChunkingErrorCode =
  | 'EMPTY_DOCUMENT'
  | 'NO_TEXT_CONTENT'
  | 'INVALID_CONFIG'
  | 'TOKENIZATION_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Options for splitting text
 */
export interface SplitOptions {
  /** Maximum tokens per segment */
  maxTokens: number;
  /** Overlap tokens between segments */
  overlapTokens: number;
  /** Whether to preserve sentence boundaries */
  preserveSentences: boolean;
}

/**
 * A text segment with position information
 */
export interface TextSegment {
  /** The text content */
  text: string;
  /** Token count */
  tokenCount: number;
  /** Original page number(s) */
  pageNumbers: number[];
  /** Section/heading context */
  headingContext?: string;
}

/**
 * Utility type for converting ChunkData to CreateChunkInput
 */
export type ChunkDataToInput = (chunk: ChunkData, bookId: string) => CreateChunkInput;
