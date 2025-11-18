import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
} from './errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an app error with correct properties', () => {
      const error = new AppError(400, 'Bad request');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad request');
      expect(error.isOperational).toBe(true);
    });

    it('should allow setting operational flag', () => {
      const error = new AppError(500, 'Server error', false);

      expect(error.isOperational).toBe(false);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with 400 status', () => {
      const error = new ValidationError('Invalid input');

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with 404 status', () => {
      const error = new NotFoundError('User');

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('User not found');
    });
  });

  describe('UnauthorizedError', () => {
    it('should create unauthorized error with 401 status', () => {
      const error = new UnauthorizedError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Unauthorized');
    });

    it('should accept custom message', () => {
      const error = new UnauthorizedError('Invalid token');

      expect(error.message).toBe('Invalid token');
    });
  });
});
