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

// Widget Configuration schemas
export const createWidgetConfigSchema = z.object({
  siteId: z.string().min(1),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  position: z.enum(['BOTTOM_RIGHT', 'BOTTOM_LEFT', 'TOP_RIGHT', 'TOP_LEFT']).optional(),
  greetingMessage: z.string().max(200).optional(),
  placeholderText: z.string().max(100).optional(),
  headerText: z.string().max(100).optional(),
  borderRadius: z.number().min(0).max(50).optional(),
  showBranding: z.boolean().optional(),
  customCSS: z.string().optional(),
});

export const updateWidgetConfigSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  position: z.enum(['BOTTOM_RIGHT', 'BOTTOM_LEFT', 'TOP_RIGHT', 'TOP_LEFT']).optional(),
  greetingMessage: z.string().max(200).optional(),
  placeholderText: z.string().max(100).optional(),
  headerText: z.string().max(100).optional(),
  borderRadius: z.number().min(0).max(50).optional(),
  showBranding: z.boolean().optional(),
  customCSS: z.string().optional(),
});

// Conversation Management schemas
export const listConversationsSchema = z.object({
  siteId: z.string().min(1),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'ESCALATED', 'RESOLVED']).optional(),
  tagId: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const rateConversationSchema = z.object({
  rating: z.number().min(1).max(5),
  feedback: z.string().max(1000).optional(),
});

export const tagConversationSchema = z.object({
  tagIds: z.array(z.string()).min(1),
});

export const updateConversationStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'ARCHIVED', 'ESCALATED', 'RESOLVED']),
});

// Tag schemas
export const createTagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  description: z.string().max(200).optional(),
});

export const updateTagSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  description: z.string().max(200).optional(),
});

// Template schemas
export const createTemplateSchema = z.object({
  siteId: z.string().min(1),
  category: z.enum(['GREETING', 'FAQ', 'SUPPORT', 'SALES', 'ESCALATION', 'CLOSING']),
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(2000),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateTemplateSchema = z.object({
  category: z.enum(['GREETING', 'FAQ', 'SUPPORT', 'SALES', 'ESCALATION', 'CLOSING']).optional(),
  title: z.string().min(1).max(100).optional(),
  content: z.string().min(1).max(2000).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// Type exports
export type CreateSiteInput = z.infer<typeof createSiteSchema>;
export type UpdateSiteInput = z.infer<typeof updateSiteSchema>;
export type InitWidgetInput = z.infer<typeof initWidgetSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type CreateWidgetConfigInput = z.infer<typeof createWidgetConfigSchema>;
export type UpdateWidgetConfigInput = z.infer<typeof updateWidgetConfigSchema>;
export type ListConversationsInput = z.infer<typeof listConversationsSchema>;
export type RateConversationInput = z.infer<typeof rateConversationSchema>;
export type TagConversationInput = z.infer<typeof tagConversationSchema>;
export type UpdateConversationStatusInput = z.infer<typeof updateConversationStatusSchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
