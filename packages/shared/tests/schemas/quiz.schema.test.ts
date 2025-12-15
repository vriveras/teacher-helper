import { describe, it, expect } from 'vitest';
import {
  quizItemSchema,
  blueprintSchema,
  itemTypeSchema,
  difficultySchema,
  bloomLevelSchema,
} from '../../src/schemas/quiz.schema.js';

describe('Quiz Schemas', () => {
  describe('itemTypeSchema', () => {
    it('should validate valid item types', () => {
      const validTypes = ['mcq', 'true_false', 'short_answer', 'matching', 'fill_in'];

      validTypes.forEach((type) => {
        const result = itemTypeSchema.safeParse(type);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid item types', () => {
      const result = itemTypeSchema.safeParse('invalid_type');
      expect(result.success).toBe(false);
    });
  });

  describe('difficultySchema', () => {
    it('should validate valid difficulty levels', () => {
      const validLevels = ['easy', 'medium', 'hard'];

      validLevels.forEach((level) => {
        const result = difficultySchema.safeParse(level);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('bloomLevelSchema', () => {
    it('should validate valid Bloom levels', () => {
      const validLevels = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];

      validLevels.forEach((level) => {
        const result = bloomLevelSchema.safeParse(level);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('quizItemSchema', () => {
    it('should validate a complete quiz item', () => {
      const validItem = {
        id: 'item-1',
        type: 'mcq',
        stem: 'What is the capital of France?',
        choices: [
          { id: 'c1', text: 'London', isCorrect: false },
          { id: 'c2', text: 'Paris', isCorrect: true },
        ],
        correctAnswer: 'c2',
        rationale: 'Paris is the capital and largest city of France.',
        citations: [
          {
            id: 'cite-1',
            chunkId: 'chunk-1',
            bookId: 'book-1',
            excerptPreview: 'Paris is the capital...',
            relevanceScore: 0.95,
          },
        ],
        difficulty: 'easy',
        bloomLevel: 'remember',
        tags: ['geography', 'europe'],
      };

      const result = quizItemSchema.safeParse(validItem);
      expect(result.success).toBe(true);
    });
  });

  describe('blueprintSchema', () => {
    it('should validate a complete blueprint', () => {
      const validBlueprint = {
        totalItems: 10,
        itemsByType: {
          mcq: 8,
          true_false: 2,
          short_answer: 0,
          matching: 0,
          fill_in: 0,
        },
        itemsByDifficulty: {
          easy: 3,
          medium: 5,
          hard: 2,
        },
        coverage: [
          {
            chapterId: 'ch-1',
            sectionId: 'sec-1-1',
            itemCount: 5,
          },
        ],
      };

      const result = blueprintSchema.safeParse(validBlueprint);
      expect(result.success).toBe(true);
    });
  });
});
