import { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

export function handleError(error: unknown, request: FastifyRequest, reply: FastifyReply) {
  // Log error
  request.log.error(error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return reply.code(400).send({
      error: 'Validation failed',
      details: error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return reply.code(409).send({
        error: 'Resource already exists',
        message: 'A record with this unique value already exists',
      });
    }
    if (error.code === 'P2025') {
      return reply.code(404).send({
        error: 'Not found',
        message: 'The requested resource was not found',
      });
    }
  }

  // Custom app errors
  if (error instanceof AppError) {
    return reply.code(error.statusCode).send({
      error: error.message,
    });
  }

  // Default error
  return reply.code(500).send({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development'
      ? (error as Error).message
      : 'An unexpected error occurred',
  });
}
