import { Redis } from 'ioredis';
import { getEnv } from '../config/env.js';

let redis: Redis | null = null;

export function getRedis(): Redis | null {
  const env = getEnv();

  if (!env.REDIS_URL) {
    return null;
  }

  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    });
  }

  return redis;
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
