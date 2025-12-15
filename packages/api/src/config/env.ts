import { z } from 'zod';

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PORT: z.string().default('3001').transform(Number),
  API_HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Database
  DATABASE_URL: z.string().url(),

  // Neo4j
  NEO4J_URI: z.string().url().optional(),
  NEO4J_USER: z.string().optional(),
  NEO4J_PASSWORD: z.string().optional(),

  // Redis
  REDIS_URL: z.string().url().optional(),

  // OpenRouter (AI Gateway)
  OPENROUTER_API_KEY: z.string().min(1).optional(),
  OPENROUTER_BASE_URL: z.string().url().default('https://openrouter.ai/api/v1'),
  OPENROUTER_APP_NAME: z.string().optional(),
  OPENROUTER_DEFAULT_MODEL: z.string().default('anthropic/claude-3.5-sonnet'),
  OPENROUTER_TIMEOUT_MS: z.string().default('60000').transform(Number),
  OPENROUTER_MAX_RETRIES: z.string().default('3').transform(Number),
  OPENROUTER_TEST_MODE: z.string().optional().transform((v) => v === 'true'),

  // CORS
  CORS_ORIGIN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let envCache: Env | null = null;

export function getEnv(): Env {
  if (envCache) {
    return envCache;
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.format());
    throw new Error('Invalid environment variables');
  }

  envCache = parsed.data;
  return envCache;
}

export function resetEnvCache(): void {
  envCache = null;
}

/**
 * Check if OpenRouter is configured and ready for use
 * Returns true if API key is present or test mode is enabled
 */
export function isOpenRouterConfigured(): boolean {
  const env = getEnv();
  return Boolean(env.OPENROUTER_API_KEY) || Boolean(env.OPENROUTER_TEST_MODE);
}
