import OpenAI from 'openai';
import { randomUUID } from 'crypto';
import { getEnv, isOpenRouterConfigured } from '../config/env.js';
import { MODEL_CONFIGS } from '../config/models.js';
import type {
  OpenRouterConfig,
  CompletionRequest,
  CompletionResponse,
  OpenRouterError,
  OpenRouterErrorCode,
  TelemetryData,
  ChatMessage,
  ModelTaskType,
} from '@teacher-helper/shared';


/**
 * OpenRouter Service - Centralized AI gateway for LLM calls
 */
export class OpenRouterService {
  private client: OpenAI | null = null;
  private config: OpenRouterConfig;
  private initialized = false;

  constructor() {
    const env = getEnv();
    this.config = {
      apiKey: env.OPENROUTER_API_KEY || '',
      baseURL: env.OPENROUTER_BASE_URL,
      appName: env.OPENROUTER_APP_NAME,
      defaultModel: env.OPENROUTER_DEFAULT_MODEL,
      timeoutMs: env.OPENROUTER_TIMEOUT_MS,
      maxRetries: env.OPENROUTER_MAX_RETRIES,
      testMode: env.OPENROUTER_TEST_MODE,
    };
  }

  private initialize(): void {
    if (this.initialized) return;
    if (!this.config.apiKey && !this.config.testMode) {
      throw this.createError(
        'INVALID_API_KEY',
        'OpenRouter API key required. Set OPENROUTER_API_KEY or enable OPENROUTER_TEST_MODE.',
        401,
        false
      );
    }
    if (!this.config.testMode) {
      this.client = new OpenAI({
        apiKey: this.config.apiKey,
        baseURL: this.config.baseURL,
        timeout: this.config.timeoutMs,
        defaultHeaders: {
          'HTTP-Referer': this.config.appName || 'teacher-helper',
          'X-Title': 'TeacherHelper',
        },
      });
    }
    this.initialized = true;
  }

  async createCompletion(request: CompletionRequest): Promise<CompletionResponse> {
    this.initialize();
    const requestId = randomUUID();
    const startTime = Date.now();
    const modelRequested = request.model || this.config.defaultModel;
    const fallbackModels = request.fallbackModels || this.getFallbackModels(modelRequested);
    const modelsToTry = [modelRequested, ...fallbackModels];
    let lastError: OpenRouterError | null = null;
    let retryCount = 0;
    let fallbackUsed = false;

    for (let mi = 0; mi < modelsToTry.length; mi++) {
      const currentModel = modelsToTry[mi] as string;
      fallbackUsed = mi > 0;
      for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
        try {
          const response = await this.executeCompletion(currentModel, request);
          const telemetry = this.createTelemetry({
            requestId, startTime, modelRequested, modelUsed: currentModel,
            response, success: true, retryCount, fallbackUsed,
          });
          return {
            id: response.id,
            model: response.model,
            choices: response.choices.map((c, i) => ({
              index: i,
              message: { role: c.message.role, content: c.message.content || '' },
              finishReason: c.finish_reason,
            })),
            usage: {
              promptTokens: response.usage?.prompt_tokens || 0,
              completionTokens: response.usage?.completion_tokens || 0,
              totalTokens: response.usage?.total_tokens || 0,
            },
            telemetry,
          };
        } catch (error) {
          lastError = this.handleError(error);
          retryCount++;
          if (!lastError.retryable || lastError.code === 'MODEL_UNAVAILABLE') break;
          if (attempt < this.config.maxRetries) await this.sleep(this.calculateBackoff(attempt));
        }
      }
      if (lastError && lastError.code !== 'MODEL_UNAVAILABLE') break;
    }
    const telemetry = this.createTelemetry({
      requestId, startTime, modelRequested, modelUsed: modelsToTry[modelsToTry.length - 1] || modelRequested,
      response: null, success: false, retryCount, fallbackUsed, error: lastError?.message,
    });
    throw { ...lastError, telemetry };
  }

  private async executeCompletion(model: string, request: CompletionRequest): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    if (this.config.testMode) return this.createMockResponse(model, request);
    if (!this.client) throw this.createError('INVALID_API_KEY', 'OpenAI client not initialized', 500, false);
    return this.client.chat.completions.create({
      model,
      messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: request.temperature,
      max_tokens: request.maxTokens,
      stream: false,
    });
  }

  private createMockResponse(model: string, request: CompletionRequest): OpenAI.Chat.Completions.ChatCompletion {
    return {
      id: 'mock-' + randomUUID(),
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [{
        index: 0,
        message: { role: 'assistant', content: '[TEST MODE] Mock response for ' + model, refusal: null },
        finish_reason: 'stop',
        logprobs: null,
      }],
      usage: {
        prompt_tokens: this.estimateTokens(request.messages),
        completion_tokens: 20,
        total_tokens: this.estimateTokens(request.messages) + 20,
      },
    };
  }

  private estimateTokens(messages: ChatMessage[]): number {
    return Math.ceil(messages.reduce((s, m) => s + m.content.length, 0) / 4);
  }

  private getFallbackModels(model: string): string[] {
    for (const cfg of Object.values(MODEL_CONFIGS)) {
      if (cfg.primary === model && cfg.fallbacks) return cfg.fallbacks;
    }
    return [];
  }

  private handleError(error: unknown): OpenRouterError {
    if (error instanceof OpenAI.APIError) {
      const sc = error.status;
      if (sc === 401) return this.createError('INVALID_API_KEY', error.message, sc, false);
      if (sc === 429) return this.createError('RATE_LIMIT_EXCEEDED', error.message, sc, true);
      if (sc === 503 || error.message.includes('model')) return this.createError('MODEL_UNAVAILABLE', error.message, sc, true);
      if (sc && sc >= 500) return this.createError('UNKNOWN_ERROR', error.message, sc, true);
      return this.createError('VALIDATION_ERROR', error.message, sc, false);
    }
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.name === 'TimeoutError') return this.createError('TIMEOUT', error.message, undefined, true);
      if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) return this.createError('NETWORK_ERROR', error.message, undefined, true);
      return this.createError('UNKNOWN_ERROR', error.message, undefined, false);
    }
    return this.createError('UNKNOWN_ERROR', String(error), undefined, false);
  }

  private createError(code: OpenRouterErrorCode, message: string, statusCode?: number, retryable = false): OpenRouterError {
    return { code, message, statusCode, retryable };
  }

  private calculateBackoff(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 30000);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  private createTelemetry(p: {
    requestId: string; startTime: number; modelRequested: string; modelUsed: string;
    response: OpenAI.Chat.Completions.ChatCompletion | null; success: boolean;
    retryCount: number; fallbackUsed: boolean; error?: string;
  }): TelemetryData {
    return {
      requestId: p.requestId, timestamp: new Date(), modelRequested: p.modelRequested,
      modelUsed: p.modelUsed, promptTokens: p.response?.usage?.prompt_tokens || 0,
      completionTokens: p.response?.usage?.completion_tokens || 0,
      totalTokens: p.response?.usage?.total_tokens || 0,
      latencyMs: Date.now() - p.startTime, success: p.success, error: p.error,
      retryCount: p.retryCount, fallbackUsed: p.fallbackUsed,
    };
  }

  async createCompletionByTaskType(
    taskType: ModelTaskType,
    messages: ChatMessage[],
    options?: Partial<CompletionRequest>
  ): Promise<CompletionResponse> {
    const cfg = MODEL_CONFIGS[taskType];
    return this.createCompletion({
      model: cfg.primary, messages, temperature: cfg.temperature,
      maxTokens: cfg.maxTokens, fallbackModels: cfg.fallbacks, ...options,
    });
  }

  isReady(): boolean { return isOpenRouterConfigured(); }

  getConfig(): Omit<OpenRouterConfig, 'apiKey'> & { hasApiKey: boolean } {
    return {
      baseURL: this.config.baseURL, appName: this.config.appName,
      defaultModel: this.config.defaultModel, timeoutMs: this.config.timeoutMs,
      maxRetries: this.config.maxRetries, testMode: this.config.testMode,
      hasApiKey: Boolean(this.config.apiKey),
    };
  }
}

let serviceInstance: OpenRouterService | null = null;

export function getOpenRouterService(): OpenRouterService {
  if (!serviceInstance) serviceInstance = new OpenRouterService();
  return serviceInstance;
}

export function resetOpenRouterService(): void { serviceInstance = null; }

export const openRouterService = {
  get instance() { return getOpenRouterService(); },
};
