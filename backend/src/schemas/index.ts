import { z } from 'zod';

// Site schemas
export const createSiteSchema = z.object({
  name: z.string().min(1, 'Site name is required').max(100),
  domain: z.string().min(1, 'Domain is required').max(255),
  ownerId: z.string().min(1, 'Owner ID is required'),
});

export const updateSiteSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  domain: z.string().min(1).max(255).optional(),
});

export const siteIdParamSchema = z.object({
  siteId: z.string().min(1),
});

export const ownerIdQuerySchema = z.object({
  ownerId: z.string().min(1),
});

// Widget schemas
export const initWidgetSchema = z.object({
  siteKey: z.string().min(1, 'Site key is required'),
});

export const chatMessageSchema = z.object({
  sessionKey: z.string().min(1, 'Session key is required'),
  message: z.string().min(1, 'Message is required').max(5000),
});

export const sessionIdParamSchema = z.object({
  sessionId: z.string().min(1),
});

// Type exports
export type CreateSiteInput = z.infer<typeof createSiteSchema>;
export type UpdateSiteInput = z.infer<typeof updateSiteSchema>;
export type InitWidgetInput = z.infer<typeof initWidgetSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
