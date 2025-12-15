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
