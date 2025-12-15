import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OpenRouterService, getOpenRouterService, resetOpenRouterService } from '../../src/services/openrouter.service.js';
import { resetEnvCache } from '../../src/config/env.js';

// Mock OpenAI
vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: vi.fn(),
        },
      };
      static APIError = class APIError extends Error {
        status: number;
        constructor(status: number, message: string) {
          super(message);
          this.status = status;
        }
      };
    },
  };
});

describe('OpenRouterService', () => {
  beforeEach(() => {
    resetEnvCache();
    resetOpenRouterService();

    // Set minimum required env vars
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
    process.env.OPENROUTER_DEFAULT_MODEL = 'anthropic/claude-3.5-sonnet';
    process.env.OPENROUTER_TIMEOUT_MS = '60000';
    process.env.OPENROUTER_MAX_RETRIES = '3';
  });

  afterEach(() => {
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_TEST_MODE;
  });

  describe('initialization', () => {
    it('should throw when no API key and not in test mode', async () => {
      const service = getOpenRouterService();

      await expect(
        service.createCompletion({
          messages: [{ role: 'user', content: 'Hello' }],
        })
      ).rejects.toMatchObject({
        code: 'INVALID_API_KEY',
        retryable: false,
      });
    });

    it('should initialize with API key', () => {
      process.env.OPENROUTER_API_KEY = 'test-key';
      const service = getOpenRouterService();

      expect(service.isReady()).toBe(true);
      expect(service.getConfig().hasApiKey).toBe(true);
    });

    it('should initialize in test mode without API key', () => {
      process.env.OPENROUTER_TEST_MODE = 'true';
      const service = getOpenRouterService();

      expect(service.isReady()).toBe(true);
      expect(service.getConfig().testMode).toBe(true);
      expect(service.getConfig().hasApiKey).toBe(false);
    });

    it('should return singleton instance', () => {
      process.env.OPENROUTER_TEST_MODE = 'true';
      const service1 = getOpenRouterService();
      const service2 = getOpenRouterService();

      expect(service1).toBe(service2);
    });
  });

  describe('test mode', () => {
    beforeEach(() => {
      process.env.OPENROUTER_TEST_MODE = 'true';
    });

    it('should return mock response in test mode', async () => {
      const service = getOpenRouterService();

      const response = await service.createCompletion({
        messages: [{ role: 'user', content: 'Hello' }],
      });

      expect(response.id).toMatch(/^mock-/);
      expect(response.choices[0].message.content).toContain('[TEST MODE]');
      expect(response.telemetry.success).toBe(true);
    });

    it('should use specified model in test mode', async () => {
      const service = getOpenRouterService();

      const response = await service.createCompletion({
        model: 'anthropic/claude-3-haiku',
        messages: [{ role: 'user', content: 'Test' }],
      });

      expect(response.model).toBe('anthropic/claude-3-haiku');
      expect(response.telemetry.modelRequested).toBe('anthropic/claude-3-haiku');
    });

    it('should estimate tokens in test mode', async () => {
      const service = getOpenRouterService();

      const response = await service.createCompletion({
        messages: [{ role: 'user', content: 'This is a test message with some content' }],
      });

      expect(response.usage.promptTokens).toBeGreaterThan(0);
      expect(response.usage.completionTokens).toBe(20);
      expect(response.usage.totalTokens).toBe(response.usage.promptTokens + 20);
    });
  });

  describe('telemetry', () => {
    beforeEach(() => {
      process.env.OPENROUTER_TEST_MODE = 'true';
    });

    it('should capture telemetry data', async () => {
      const service = getOpenRouterService();

      const response = await service.createCompletion({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      const telemetry = response.telemetry;
      expect(telemetry.requestId).toBeDefined();
      expect(telemetry.timestamp).toBeInstanceOf(Date);
      expect(telemetry.modelRequested).toBe('anthropic/claude-3.5-sonnet');
      expect(telemetry.modelUsed).toBe('anthropic/claude-3.5-sonnet');
      expect(telemetry.latencyMs).toBeGreaterThanOrEqual(0);
      expect(telemetry.success).toBe(true);
      expect(telemetry.retryCount).toBe(0);
      expect(telemetry.fallbackUsed).toBe(false);
    });
  });

  describe('createCompletionByTaskType', () => {
    beforeEach(() => {
      process.env.OPENROUTER_TEST_MODE = 'true';
    });

    it('should use high-reasoning model for DGA tasks', async () => {
      const service = getOpenRouterService();

      const response = await service.createCompletionByTaskType(
        'high-reasoning',
        [{ role: 'user', content: 'Generate a quiz' }]
      );

      expect(response.model).toBe('anthropic/claude-3.5-sonnet');
    });

    it('should use fast model for QAA tasks', async () => {
      const service = getOpenRouterService();

      const response = await service.createCompletionByTaskType(
        'fast',
        [{ role: 'user', content: 'Score this quiz' }]
      );

      expect(response.model).toBe('anthropic/claude-3-haiku');
    });
  });

  describe('getConfig', () => {
    it('should return config without exposing API key', () => {
      process.env.OPENROUTER_API_KEY = 'secret-key';
      const service = getOpenRouterService();
      const config = service.getConfig();

      expect(config.hasApiKey).toBe(true);
      expect((config as any).apiKey).toBeUndefined();
      expect(config.baseURL).toBe('https://openrouter.ai/api/v1');
      expect(config.defaultModel).toBe('anthropic/claude-3.5-sonnet');
    });

    it('should show correct test mode status', () => {
      process.env.OPENROUTER_TEST_MODE = 'true';
      const service = getOpenRouterService();
      const config = service.getConfig();

      expect(config.testMode).toBe(true);
    });
  });
});
