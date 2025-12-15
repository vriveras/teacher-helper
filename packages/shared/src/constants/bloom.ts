import type { BloomLevel } from '../types/quiz.types.js';

export const BLOOM_LEVELS: readonly BloomLevel[] = [
  'remember',
  'understand',
  'apply',
  'analyze',
  'evaluate',
  'create',
] as const;

export const BLOOM_LABELS: Record<BloomLevel, string> = {
  remember: 'Remember',
  understand: 'Understand',
  apply: 'Apply',
  analyze: 'Analyze',
  evaluate: 'Evaluate',
  create: 'Create',
};

export const BLOOM_DESCRIPTIONS: Record<BloomLevel, string> = {
  remember: 'Recall facts and basic concepts',
  understand: 'Explain ideas or concepts',
  apply: 'Use information in new situations',
  analyze: 'Draw connections among ideas',
  evaluate: 'Justify a stand or decision',
  create: 'Produce new or original work',
};

export const BLOOM_HIERARCHY: Record<BloomLevel, number> = {
  remember: 1,
  understand: 2,
  apply: 3,
  analyze: 4,
  evaluate: 5,
  create: 6,
};
