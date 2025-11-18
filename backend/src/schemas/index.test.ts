import { describe, it, expect } from 'vitest';
import {
  createSiteSchema,
  updateSiteSchema,
  initWidgetSchema,
  chatMessageSchema,
} from './index';

describe('Schema Validation', () => {
  describe('createSiteSchema', () => {
    it('should validate correct site data', () => {
      const validData = {
        name: 'Test Site',
        domain: 'example.com',
        ownerId: 'user123',
      };

      const result = createSiteSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject empty name', () => {
      const invalidData = {
        name: '',
        domain: 'example.com',
        ownerId: 'user123',
      };

      const result = createSiteSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        name: 'Test Site',
      };

      const result = createSiteSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject name longer than 100 characters', () => {
      const invalidData = {
        name: 'x'.repeat(101),
        domain: 'example.com',
        ownerId: 'user123',
      };

      const result = createSiteSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateSiteSchema', () => {
    it('should validate partial updates', () => {
      const validData = {
        name: 'Updated Name',
      };

      const result = updateSiteSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should allow empty object (no updates)', () => {
      const result = updateSiteSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('initWidgetSchema', () => {
    it('should validate correct site key', () => {
      const validData = {
        siteKey: 'abc123def456',
      };

      const result = initWidgetSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty site key', () => {
      const invalidData = {
        siteKey: '',
      };

      const result = initWidgetSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('chatMessageSchema', () => {
    it('should validate correct chat message', () => {
      const validData = {
        sessionKey: 'session123',
        message: 'Hello, how can you help me?',
      };

      const result = chatMessageSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty message', () => {
      const invalidData = {
        sessionKey: 'session123',
        message: '',
      };

      const result = chatMessageSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject message longer than 5000 characters', () => {
      const invalidData = {
        sessionKey: 'session123',
        message: 'x'.repeat(5001),
      };

      const result = chatMessageSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
