import { describe, it, expect } from 'vitest';
import {
  BLOOM_LEVELS,
  BLOOM_LABELS,
  BLOOM_DESCRIPTIONS,
  BLOOM_HIERARCHY,
} from '../../src/constants/bloom.js';

describe('Bloom Constants', () => {
  it('should define all six Bloom levels', () => {
    expect(BLOOM_LEVELS).toHaveLength(6);
    expect(BLOOM_LEVELS).toEqual([
      'remember',
      'understand',
      'apply',
      'analyze',
      'evaluate',
      'create',
    ]);
  });

  it('should have labels for all levels', () => {
    BLOOM_LEVELS.forEach((level) => {
      expect(BLOOM_LABELS[level]).toBeDefined();
      expect(typeof BLOOM_LABELS[level]).toBe('string');
    });
  });

  it('should have descriptions for all levels', () => {
    BLOOM_LEVELS.forEach((level) => {
      expect(BLOOM_DESCRIPTIONS[level]).toBeDefined();
      expect(typeof BLOOM_DESCRIPTIONS[level]).toBe('string');
    });
  });

  it('should have hierarchy values from 1 to 6', () => {
    expect(BLOOM_HIERARCHY.remember).toBe(1);
    expect(BLOOM_HIERARCHY.understand).toBe(2);
    expect(BLOOM_HIERARCHY.apply).toBe(3);
    expect(BLOOM_HIERARCHY.analyze).toBe(4);
    expect(BLOOM_HIERARCHY.evaluate).toBe(5);
    expect(BLOOM_HIERARCHY.create).toBe(6);
  });
});
