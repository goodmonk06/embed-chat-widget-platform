/**
 * Domain Events
 * Type-safe event system for cross-cutting concerns
 */

export interface DomainEvent<T = any> {
  type: string;
  timestamp: Date;
  payload: T;
  metadata?: Record<string, any>;
}

// Site Events
export interface SiteCreatedPayload {
  siteId: string;
  ownerId: string;
  name: string;
  domain: string;
}

export interface SiteUpdatedPayload {
  siteId: string;
  changes: Record<string, any>;
}

export interface SiteDeletedPayload {
  siteId: string;
}

// Conversation Events
export interface ConversationStartedPayload {
  sessionId: string;
  siteId: string;
  sessionKey: string;
}

export interface MessageReceivedPayload {
  messageId: string;
  sessionId: string;
  siteId: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface ConversationRatedPayload {
  sessionId: string;
  siteId: string;
  rating: number;
  feedback?: string;
}

export interface ConversationTaggedPayload {
  sessionId: string;
  siteId: string;
  tagId: string;
  tagName: string;
}

// Widget Events
export interface WidgetConfigurationUpdatedPayload {
  siteId: string;
  configurationId: string;
  changes: Record<string, any>;
}

// User Events
export interface UserCreatedPayload {
  userId: string;
  email: string;
  name: string;
}

export interface UserAssignedToSitePayload {
  userId: string;
  siteId: string;
  role: string;
}

// Event Types (for type safety)
export type SiteCreatedEvent = DomainEvent<SiteCreatedPayload>;
export type SiteUpdatedEvent = DomainEvent<SiteUpdatedPayload>;
export type SiteDeletedEvent = DomainEvent<SiteDeletedPayload>;
export type ConversationStartedEvent = DomainEvent<ConversationStartedPayload>;
export type MessageReceivedEvent = DomainEvent<MessageReceivedPayload>;
export type ConversationRatedEvent = DomainEvent<ConversationRatedPayload>;
export type ConversationTaggedEvent = DomainEvent<ConversationTaggedPayload>;
export type WidgetConfigurationUpdatedEvent = DomainEvent<WidgetConfigurationUpdatedPayload>;
export type UserCreatedEvent = DomainEvent<UserCreatedPayload>;
export type UserAssignedToSiteEvent = DomainEvent<UserAssignedToSitePayload>;

// Union type of all events
export type AllDomainEvents =
  | SiteCreatedEvent
  | SiteUpdatedEvent
  | SiteDeletedEvent
  | ConversationStartedEvent
  | MessageReceivedEvent
  | ConversationRatedEvent
  | ConversationTaggedEvent
  | WidgetConfigurationUpdatedEvent
  | UserCreatedEvent
  | UserAssignedToSiteEvent;

// Event type constants
export const EventTypes = {
  SITE_CREATED: 'site.created',
  SITE_UPDATED: 'site.updated',
  SITE_DELETED: 'site.deleted',
  CONVERSATION_STARTED: 'conversation.started',
  MESSAGE_RECEIVED: 'message.received',
  CONVERSATION_RATED: 'conversation.rated',
  CONVERSATION_TAGGED: 'conversation.tagged',
  WIDGET_CONFIGURATION_UPDATED: 'widget.configuration.updated',
  USER_CREATED: 'user.created',
  USER_ASSIGNED_TO_SITE: 'user.assigned_to_site',
} as const;
