import { z } from 'zod';

export const itemTypeSchema = z.enum(['mcq', 'true_false', 'short_answer', 'matching', 'fill_in']);
export const difficultySchema = z.enum(['easy', 'medium', 'hard']);
export const bloomLevelSchema = z.enum([
  'remember',
  'understand',
  'apply',
  'analyze',
  'evaluate',
  'create',
]);
export const artifactStatusSchema = z.enum(['draft', 'reviewed', 'approved', 'exported']);

export const choiceSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  isCorrect: z.boolean(),
});

export const citationSchema = z.object({
  id: z.string(),
  chunkId: z.string(),
  bookId: z.string(),
  pageRange: z.string().optional(),
  excerptPreview: z.string(),
  relevanceScore: z.number().min(0).max(1),
});

export const quizItemSchema = z.object({
  id: z.string(),
  type: itemTypeSchema,
  stem: z.string().min(1),
  choices: z.array(choiceSchema).optional(),
  correctAnswer: z.string().min(1),
  rationale: z.string().min(1),
  rubric: z.string().optional(),
  citations: z.array(citationSchema),
  difficulty: difficultySchema,
  bloomLevel: bloomLevelSchema,
  tags: z.array(z.string()),
});

export const coverageEntrySchema = z.object({
  chapterId: z.string(),
  sectionId: z.string().optional(),
  itemCount: z.number().min(0),
});

export const blueprintSchema = z.object({
  totalItems: z.number().min(0),
  itemsByType: z.record(itemTypeSchema, z.number()),
  itemsByDifficulty: z.record(difficultySchema, z.number()),
  coverage: z.array(coverageEntrySchema),
});

export const quizSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string().min(1),
  items: z.array(quizItemSchema),
  blueprint: blueprintSchema,
  citations: z.array(citationSchema),
  status: artifactStatusSchema,
  version: z.number().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type QuizInput = z.infer<typeof quizSchema>;
export type QuizItemInput = z.infer<typeof quizItemSchema>;
export type BlueprintInput = z.infer<typeof blueprintSchema>;
