// TeacherHelper Shared Package

// Types
export type { Book, TableOfContentsEntry, LicensePolicy, Chunk } from './types/book.types.js';

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

// Schemas
export {
  bookSchema,
  chunkSchema,
  licensePolicySchema,
  tocEntrySchema,
} from './schemas/book.schema.js';

export type { BookInput, ChunkInput } from './schemas/book.schema.js';

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
