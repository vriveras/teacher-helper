/**
 * OpenRouter AI Gateway Type Definitions
 * 
 * These types support the OpenRouter client service which provides
 * a unified AI gateway for all LLM calls (DGA, SVA, QAA agents).
 */

/**
 * Configuration for the OpenRouter client
 */
export interface OpenRouterConfig {
  /** API key for OpenRouter authentication */
  apiKey: string;
  /** Base URL for OpenRouter API (default: https://openrouter.ai/api/v1) */
  baseURL: string;
  /** Application name for request tracking */
  appName?: string;
  /** Default model to use when not specified */
  defaultModel: string;
  /** Request timeout in milliseconds */
  timeoutMs: number;
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Enable test mode (mock responses, no real API calls) */
  testMode?: boolean;
}

/**
 * Configuration for a specific model or model category
 */
export interface ModelConfig {
  /** Primary model identifier (e.g., 'anthropic/claude-3.5-sonnet') */
  primary: string;
  /** Fallback models to try if primary fails */
  fallbacks?: string[];
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Temperature for response generation (0-2) */
  temperature?: number;
  /** Top-p sampling parameter */
  topP?: number;
}

/**
 * Message in a chat completion request
 */
export interface ChatMessage {
  /** Role of the message sender */
  role: 'system' | 'user' | 'assistant';
  /** Content of the message */
  content: string;
}

/**
 * Request for a chat completion
 */
export interface CompletionRequest {
  /** Model to use (optional override) */
  model?: string;
  /** Messages in the conversation */
  messages: ChatMessage[];
  /** Temperature for response generation */
  temperature?: number;
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Enable streaming response */
  stream?: boolean;
  /** Fallback models to try on failure */
  fallbackModels?: string[];
}

/**
 * Choice in a completion response
 */
export interface CompletionChoice {
  /** Index of the choice */
  index: number;
  /** Generated message */
  message: {
    role: string;
    content: string;
  };
  /** Reason for completion finish */
  finishReason: string | null;
}

/**
 * Token usage statistics
 */
export interface TokenUsage {
  /** Tokens used in the prompt */
  promptTokens: number;
  /** Tokens generated in the completion */
  completionTokens: number;
  /** Total tokens used */
  totalTokens: number;
}

/**
 * Response from a chat completion request
 */
export interface CompletionResponse {
  /** Unique response identifier */
  id: string;
  /** Model used for the completion */
  model: string;
  /** Generated choices */
  choices: CompletionChoice[];
  /** Token usage statistics */
  usage: TokenUsage;
  /** Telemetry data for monitoring */
  telemetry: TelemetryData;
}

/**
 * Error codes for OpenRouter errors
 */
export type OpenRouterErrorCode =
  | 'INVALID_API_KEY'
  | 'RATE_LIMIT_EXCEEDED'
  | 'MODEL_UNAVAILABLE'
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Error from OpenRouter API
 */
export interface OpenRouterError {
  /** Error code for programmatic handling */
  code: OpenRouterErrorCode;
  /** Human-readable error message */
  message: string;
  /** HTTP status code if applicable */
  statusCode?: number;
  /** Whether the error is retryable */
  retryable: boolean;
  /** Original error details */
  cause?: unknown;
}

/**
 * Telemetry data for monitoring and debugging
 */
export interface TelemetryData {
  /** Unique request identifier */
  requestId: string;
  /** Timestamp of the request */
  timestamp: Date;
  /** Model that was requested */
  modelRequested: string;
  /** Model that was actually used (may differ due to fallback) */
  modelUsed: string;
  /** Tokens used in the prompt */
  promptTokens: number;
  /** Tokens generated in the completion */
  completionTokens: number;
  /** Total tokens used */
  totalTokens: number;
  /** Total latency in milliseconds */
  latencyMs: number;
  /** Whether the request succeeded */
  success: boolean;
  /** Error message if request failed */
  error?: string;
  /** Number of retry attempts */
  retryCount?: number;
  /** Whether a fallback model was used */
  fallbackUsed?: boolean;
}

/**
 * Model task categories for routing
 */
export type ModelTaskType = 'high-reasoning' | 'fast' | 'embeddings';

/**
 * Model routing configuration map
 */
export type ModelRoutingConfig = Record<ModelTaskType, ModelConfig>;
