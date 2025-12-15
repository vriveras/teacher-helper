import { beforeAll, afterAll, afterEach } from 'vitest';
import { resetEnvCache } from '../src/config/env.js';

beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
  process.env.API_PORT = '3999';
  process.env.LOG_LEVEL = 'error';

  console.log('Running API package tests');
});

afterEach(() => {
  // Reset environment cache after each test
  resetEnvCache();
});

afterAll(() => {
  // Global test teardown
});
