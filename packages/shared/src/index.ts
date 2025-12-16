// TeacherHelper Shared Package

// Types
export type {
  Book,
  Chunk,
  TableOfContentsEntry,
  LicensePolicy,
  BookStatus,
  BookFileMetadata,
  CreateBookInput,
  UpdateBookInput,
  ChunkLocation,
  CreateChunkInput,
  ChunkWithBook,
  ChunkSearchResult,
  ChunkingConfig,
  Embedding,
  BookIngestionProgress,
} from './types/book.types.js';

export { DEFAULT_CHUNKING_CONFIG } from './types/book.types.js';

export type {
  Quiz,
  QuizItem,
  Choice,
  Blueprint,
  CoverageEntry,
  Citation,
  ItemType,
  Difficulty,
  BloomLevel,
  ArtifactStatus,
} from './types/quiz.types.js';

export type {
  VerificationReport,
  VerificationIssue,
  QAReport,
  QAScores,
  QAIssue,
} from './types/agent.types.js';

export type { ApiResponse, ApiError, DeepPartial } from './types/api.types.js';

// PDF Parser Types
export type {
  PDFMetadata,
  PDFPage,
  PDFHeading,
  PDFSection,
  ParsedPDF,
  PDFParserOptions,
  PDFParseResult,
  PDFParseError,
  PDFErrorCode,
} from './types/pdf.types.js';

export { DEFAULT_PDF_PARSER_OPTIONS } from './types/pdf.types.js';

// Schemas
export {
  bookSchema,
  chunkSchema,
  licensePolicySchema,
  tocEntrySchema,
  bookStatusSchema,
  bookFileMetadataSchema,
  createBookInputSchema,
  updateBookInputSchema,
  chunkLocationSchema,
  createChunkInputSchema,
  validateTokenCount,
  chunkingConfigSchema,
  chunkSearchResultSchema,
  embeddingSchema,
  bookIngestionProgressSchema,
} from './schemas/book.schema.js';

export type {
  BookInput,
  ChunkInput,
  CreateChunkInput as ChunkCreateInput,
  ChunkingConfig as ChunkingConfigInput,
  BookStatus as BookStatusType,
} from './schemas/book.schema.js';

export {
  quizSchema,
  quizItemSchema,
  blueprintSchema,
  citationSchema,
  choiceSchema,
  itemTypeSchema,
  difficultySchema,
  bloomLevelSchema,
  artifactStatusSchema,
} from './schemas/quiz.schema.js';

export type { QuizInput, QuizItemInput, BlueprintInput } from './schemas/quiz.schema.js';

// Constants
export {
  DIFFICULTY_LEVELS,
  DIFFICULTY_LABELS,
  DIFFICULTY_DESCRIPTIONS,
} from './constants/difficulty.js';

export {
  BLOOM_LEVELS,
  BLOOM_LABELS,
  BLOOM_DESCRIPTIONS,
  BLOOM_HIERARCHY,
} from './constants/bloom.js';
