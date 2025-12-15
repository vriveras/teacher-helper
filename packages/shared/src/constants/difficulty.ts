import type { Difficulty } from '../types/quiz.types.js';

export const DIFFICULTY_LEVELS: readonly Difficulty[] = ['easy', 'medium', 'hard'] as const;

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  easy: 'Basic recall and comprehension',
  medium: 'Application and analysis',
  hard: 'Evaluation and synthesis',
};
