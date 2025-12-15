import type { ModelRoutingConfig } from '@teacher-helper/shared';

/**
 * Model routing configuration for different task types.
 * 
 * These configurations determine which models are used for different
 * types of tasks in the TeacherHelper application.
 */
export const MODEL_CONFIGS: ModelRoutingConfig = {
  /**
   * High-reasoning tasks require sophisticated understanding and generation.
   * Used for: DGA (quiz generation), SVA (source verification)
   */
  'high-reasoning': {
    primary: 'anthropic/claude-3.5-sonnet',
    fallbacks: ['anthropic/claude-3-opus', 'openai/gpt-4-turbo'],
    maxTokens: 4096,
    temperature: 0.7,
  },

  /**
   * Fast tasks prioritize speed and cost over reasoning depth.
   * Used for: QAA (QA scoring), simple validation tasks
   */
  'fast': {
    primary: 'anthropic/claude-3-haiku',
    fallbacks: ['openai/gpt-3.5-turbo'],
    maxTokens: 2048,
    temperature: 0.3,
  },

  /**
   * Embedding tasks for vector search and similarity.
   * Used for: Knowledge base indexing, semantic search
   */
  'embeddings': {
    primary: 'openai/text-embedding-3-large',
    fallbacks: ['openai/text-embedding-ada-002'],
  },
} as const;

/**
 * Get model configuration by task type
 */
export function getModelConfig(taskType: keyof typeof MODEL_CONFIGS) {
  return MODEL_CONFIGS[taskType];
}

/**
 * Default model for general use
 */
export const DEFAULT_MODEL = MODEL_CONFIGS['high-reasoning'].primary;

/**
 * All available model IDs for reference
 */
export const AVAILABLE_MODELS = {
  // Anthropic Claude models
  CLAUDE_35_SONNET: 'anthropic/claude-3.5-sonnet',
  CLAUDE_3_OPUS: 'anthropic/claude-3-opus',
  CLAUDE_3_HAIKU: 'anthropic/claude-3-haiku',
  
  // OpenAI GPT models
  GPT_4_TURBO: 'openai/gpt-4-turbo',
  GPT_35_TURBO: 'openai/gpt-3.5-turbo',
  
  // Embedding models
  TEXT_EMBEDDING_3_LARGE: 'openai/text-embedding-3-large',
  TEXT_EMBEDDING_ADA_002: 'openai/text-embedding-ada-002',
} as const;
