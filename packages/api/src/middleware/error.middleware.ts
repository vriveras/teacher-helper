import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const statusCode = error.statusCode || 500;

  request.log.error({
    error: {
      message: error.message,
      stack: error.stack,
      statusCode,
    },
    request: {
      method: request.method,
      url: request.url,
    },
  });

  await reply.status(statusCode).send({
    success: false,
    error: {
      code: error.code || 'INTERNAL_SERVER_ERROR',
      message:
        process.env.NODE_ENV === 'production'
          ? 'An error occurred processing your request'
          : error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
  });
}
