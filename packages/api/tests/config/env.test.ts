import { describe, it, expect, beforeEach } from 'vitest';
import { getEnv, resetEnvCache } from '../../src/config/env.js';

describe('Environment Configuration', () => {
  beforeEach(() => {
    resetEnvCache();
  });

  it('should load environment variables', () => {
    const env = getEnv();

    expect(env).toBeDefined();
    expect(env.NODE_ENV).toBe('test');
    expect(env.API_PORT).toBe(3999);
    expect(env.LOG_LEVEL).toBe('error');
  });

  it('should validate DATABASE_URL is present', () => {
    const env = getEnv();
    expect(env.DATABASE_URL).toBeDefined();
    expect(env.DATABASE_URL).toContain('postgresql://');
  });

  it('should use default values for optional fields', () => {
    const env = getEnv();
    expect(env.API_HOST).toBe('0.0.0.0');
  });

  it('should cache environment after first load', () => {
    const env1 = getEnv();
    const env2 = getEnv();

    expect(env1).toBe(env2); // Same reference
  });

  it('should reset cache when resetEnvCache is called', () => {
    const env1 = getEnv();
    resetEnvCache();
    const env2 = getEnv();

    expect(env1).not.toBe(env2); // Different references
    expect(env1).toEqual(env2); // But same values
  });
});
