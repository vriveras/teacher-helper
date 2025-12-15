// TeacherHelper Shared Types

// Book KB Types
export interface Book {
  id: string;
  title: string;
  edition?: string;
  subject: string;
  gradeBand: string;
  language: string;
  licensePolicy: LicensePolicy;
  toc: TableOfContentsEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TableOfContentsEntry {
  id: string;
  title: string;
  level: number;
  pageStart?: number;
  pageEnd?: number;
  children?: TableOfContentsEntry[];
}

export interface LicensePolicy {
  maxExcerptLength: number;
  allowWatermark: boolean;
  usageLogging: boolean;
}

export interface Chunk {
  id: string;
  bookId: string;
  chapter?: string;
  section?: string;
  pageStart?: number;
  pageEnd?: number;
  text: string;
  embedding?: number[];
  hash: string;
  createdAt: Date;
}

// Artifact Types
export interface Quiz {
  id: string;
  projectId: string;
  title: string;
  items: QuizItem[];
  blueprint: Blueprint;
  citations: Citation[];
  status: ArtifactStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizItem {
  id: string;
  type: ItemType;
  stem: string;
  choices?: Choice[];
  correctAnswer: string;
  rationale: string;
  rubric?: string;
  citations: Citation[];
  difficulty: Difficulty;
  bloomLevel: BloomLevel;
  tags: string[];
}

export interface Choice {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Blueprint {
  totalItems: number;
  itemsByType: Record<ItemType, number>;
  itemsByDifficulty: Record<Difficulty, number>;
  coverage: CoverageEntry[];
}

export interface CoverageEntry {
  chapterId: string;
  sectionId?: string;
  itemCount: number;
}

export interface Citation {
  id: string;
  chunkId: string;
  bookId: string;
  pageRange?: string;
  excerptPreview: string;
  relevanceScore: number;
}

export type ItemType = 'mcq' | 'true_false' | 'short_answer' | 'matching' | 'fill_in';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type BloomLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
export type ArtifactStatus = 'draft' | 'reviewed' | 'approved' | 'exported';

// Agent Types
export interface VerificationReport {
  artifactId: string;
  runId: string;
  verdict: 'pass' | 'fail' | 'warning';
  issues: VerificationIssue[];
  timestamp: Date;
}

export interface VerificationIssue {
  id: string;
  type: 'unsupported_claim' | 'missing_citation' | 'citation_drift' | 'invalid_mcq';
  severity: 'blocking' | 'warning';
  message: string;
  artifactPointer: string;
  suggestion?: string;
}

export interface QAReport {
  artifactId: string;
  runId: string;
  scores: QAScores;
  issues: QAIssue[];
  recommendations: string[];
  timestamp: Date;
}

export interface QAScores {
  grounding: number; // 0-100
  mcqValidity: number; // 0-100
  clarity?: number; // 0-100
  coverage?: number; // 0-100
  overall: number; // 0-100
}

export interface QAIssue {
  id: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  artifactPointer: string;
}

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
