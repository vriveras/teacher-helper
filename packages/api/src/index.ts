import { createApp } from './app.js';
import { getEnv } from './config/env.js';
import { disconnectPrisma, disconnectNeo4j, disconnectRedis } from './lib/index.js';

const start = async () => {
  try {
    const env = getEnv();
    const app = await createApp();

    await app.listen({ port: env.API_PORT, host: env.API_HOST });
    app.log.info(`TeacherHelper API running on http://${env.API_HOST}:${env.API_PORT}`);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

const shutdown = async () => {
  console.log('Shutting down...');

  try {
    await disconnectPrisma();
    await disconnectNeo4j();
    await disconnectRedis();
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
