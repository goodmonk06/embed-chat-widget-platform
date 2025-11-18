# 🎨 Cocoon Chat Widget Platform

An embeddable AI chat widget platform that allows you to add intelligent chat functionality to any website with just a few lines of code.

**Status: Phase 3** - Production-ready with deep domain model, extensibility, events, and comprehensive features.

## Overview

Cocoon Chat is a full-stack, TypeScript-based platform for embedding AI-powered chat widgets on any website. It provides:

- **Backend API** for managing sites, conversations, and AI-powered interactions
- **Embeddable Widget** with full customization options (colors, position, messages)
- **Admin Dashboard** for site owners to manage widgets, conversations, and analytics
- **Extension System** with adapter interfaces for notifications, AI providers, analytics, and storage
- **Event System** for domain events and cross-cutting concerns
- **Multi-tenant Support** with user roles and team collaboration

## Tech Stack

### Backend
- **Fastify** - Fast, low-overhead web framework
- **Prisma** - Type-safe ORM for PostgreSQL
- **Zod** - Schema validation
- **Vitest** - Unit testing
- **TypeScript** - Full type safety

### Widget
- **Vanilla TypeScript** - No framework dependencies
- **Vite** - Fast bundler

### Admin Dashboard
- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first styling
- **TypeScript** - Type safety

### Infrastructure
- **PostgreSQL** - Primary database
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## Domain Model

### Core Entities (13 Tables)

```
Site (website using the widget)
  ├─ id, ownerId, name, domain
  ├─ publicKey (for widget embedding)
  ├─ secretKey (for admin operations)
  ├─ isActive, metadata
  └─ relationships: ChatSessions, WidgetConfiguration, Users (via SiteUser)

ChatSession (individual conversation)
  ├─ id, sessionKey
  ├─ siteId (belongs to Site)
  ├─ status (ACTIVE/ARCHIVED/ESCALATED/RESOLVED)
  ├─ userEmail, userName, metadata
  └─ relationships: ChatMessages, Tags, Rating

ChatMessage (single message in conversation)
  ├─ id, role (user/assistant)
  ├─ content, createdAt, metadata
  └─ sessionId (belongs to ChatSession)

User (authenticated team members)
  ├─ id, email, name
  ├─ role (OWNER/ADMIN/MEMBER/VIEWER)
  └─ relationships: Sites (via SiteUser)

WidgetConfiguration (per-site customization)
  ├─ id, siteId
  ├─ colors (primary, secondary, text, background)
  ├─ position (BOTTOM_RIGHT/LEFT, TOP_RIGHT/LEFT)
  ├─ greeting, placeholder, title
  ├─ branding, customCSS
  └─ belongs to: Site

ConversationTag (flexible categorization)
  ├─ id, name, description, color
  └─ relationships: ChatSessions (via SessionTag)

ConversationRating (user feedback)
  ├─ id, sessionId, siteId
  ├─ rating (1-5), feedback
  └─ belongs to: ChatSession

MessageTemplate (reusable content)
  ├─ id, siteId, category, content
  ├─ category (GREETING/FAQ/SUPPORT/SALES/ESCALATION/CLOSING)
  ├─ isActive, sortOrder
  └─ belongs to: Site

AnalyticsSnapshot (time-series metrics)
  ├─ id, siteId, date
  ├─ metrics (sessions, messages, avgRating, etc.)
  └─ belongs to: Site

WebhookEndpoint (external integrations)
  ├─ id, siteId, url, events
  ├─ secret, isActive
  └─ belongs to: Site

AuditLog (complete action tracking)
  ├─ id, userId, siteId, action
  ├─ resourceType, resourceId, metadata
  └─ tracking: all admin actions
```

### Relationships
- One Site → Many ChatSessions, Users (many-to-many via SiteUser)
- One ChatSession → Many ChatMessages, Tags (many-to-many via SessionTag)
- One Site → One WidgetConfiguration, Many MessageTemplates
- Rich metadata fields (JSON) for flexibility

## 🔌 Extension & Event System

### Adapter Interfaces

The platform uses the adapter pattern for swappable backends:

**INotificationAdapter** - Alert delivery
- ConsoleNotificationAdapter (development)
- WebhookNotificationAdapter (production)
- NoOpNotificationAdapter (testing)

**IAIProviderAdapter** - AI backend abstraction
- OpenAIProviderAdapter (GPT-4)
- AnthropicProviderAdapter (Claude)
- MockAIProviderAdapter (testing)

**IAnalyticsAdapter** - Metrics export
- ConsoleAnalyticsAdapter (development)
- InMemoryAnalyticsAdapter (testing)
- MultiAnalyticsAdapter (broadcast to multiple)

**IStorageAdapter** - Alternative storage
- InMemoryStorageAdapter (development/testing)
- FileSystemStorageAdapter (local files)
- Ready for S3Adapter, AzureBlobAdapter, etc.

### Event System

Type-safe pub/sub for domain events:

**Event Types (10+):**
- `site.created`, `site.updated`, `site.deleted`
- `conversation.started`, `message.received`
- `conversation.rated`, `conversation.tagged`
- `widget.configuration.updated`
- `user.created`, `user.assigned.to.site`

**Event Bus Features:**
- Wildcard subscriptions (`onAny`)
- Async handler execution
- Error isolation
- Unsubscribe functions

**Built-in Handlers:**
- NotificationHandler: Alerts for low ratings, new conversations
- AnalyticsHandler: Track all metrics automatically

### Infrastructure

**Structured Logging:**
- JSON formatted logs
- Context-aware (userId, siteId, sessionId)
- Child loggers with inherited context
- Log levels (DEBUG, INFO, WARN, ERROR)

**Metrics Collection:**
- HTTP request latency tracking
- Counter, gauge, histogram support
- Function timing utilities
- Integration with analytics adapters

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+ (or use Docker)
- OpenAI API key OR Anthropic API key

### Option 1: Docker (Recommended)

The fastest way to get started:

```bash
# 1. Clone the repository
git clone <repo-url>
cd embed-chat-widget-platform

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env and add your AI API key
# OPENAI_API_KEY=sk-...
# or
# ANTHROPIC_API_KEY=sk-ant-...

# 4. Start all services with Docker
npm run docker:up

# 5. Run migrations and seed data
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run db:seed

# 6. Access the application
# - Admin Dashboard: http://localhost:3000
# - Backend API: http://localhost:3001
# - Health Check: http://localhost:3001/health
```

### Option 2: Local Development

For active development without Docker:

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your database URL and AI API key

# 3. Setup database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:seed      # Seed demo data

# 4. Start development servers
# Option A: Start all at once (backend + admin)
npm run dev

# Option B: Start individually in separate terminals
npm run dev:backend  # Terminal 1
npm run dev:admin    # Terminal 2
npm run dev:widget   # Terminal 3 (optional, for widget demo)

# 5. Run tests
npm test

# 6. Run linter
npm run lint
```

## Example Flow: Site Management Vertical Slice

This implementation includes a complete end-to-end flow for Site management:

### 1. Create a Site (API)

```bash
curl -X POST http://localhost:3001/api/admin/sites \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Blog",
    "domain": "myblog.com",
    "ownerId": "demo-owner-1"
  }'
```

Response:
```json
{
  "id": "clxy...",
  "name": "My Blog",
  "domain": "myblog.com",
  "publicKey": "clxz...",
  "secretKey": "clya...",
  "ownerId": "demo-owner-1",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 2. List Sites (Dashboard)

1. Visit http://localhost:3000/sites
2. Sites are listed with session counts
3. Click "View Analytics" to see detailed stats
4. Click "Copy Embed Code" to get the widget snippet

### 3. View Analytics

```bash
curl http://localhost:3001/api/admin/sites/{siteId}/analytics
```

Returns:
- Total sessions count
- Total messages count
- Recent sessions with message previews

### 4. Update Site

```bash
curl -X PUT http://localhost:3001/api/admin/sites/{siteId} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Blog Name",
    "domain": "newdomain.com"
  }'
```

### 5. Embed Widget

Add to any HTML page:

```html
<!-- Place before closing </body> tag -->
<script src="http://localhost:3001/widget/cocoon-chat.js"></script>
<script>
  createCocoonChatWidget({
    siteKey: 'YOUR_PUBLIC_KEY_HERE',
    apiUrl: 'http://localhost:3001'
  });
</script>
```

### 6. Test Chat Flow

1. Widget initializes and creates a session
2. User types a message
3. Message is sent to backend with LLM integration
4. AI response is returned and displayed
5. All messages are persisted in database

## Demo Data (100+ Records)

After running `npm run db:seed`, you'll have a complete dataset across all 13 tables:

**Users (4):**
- 2 Owners, 1 Admin, 1 Member with different roles

**Sites (4):**
- TechBlog Pro, E-Commerce Store, Support Portal, Docs Site
- 3 active, 1 inactive with metadata

**Site-User Assignments (6):**
- Team collaboration scenarios

**Widget Configurations (2):**
- Different color schemes and positions

**Conversation Tags (5):**
- Support, Sales, Bug, Feedback, Urgent

**Message Templates (8):**
- 4 per site across categories (GREETING, FAQ, SUPPORT, SALES)

**Chat Sessions (5):**
- Different statuses: ACTIVE, RESOLVED, ESCALATED, ARCHIVED
- Realistic conversation scenarios

**Chat Messages (19):**
- Complete conversations with context

**Session Tags (7):**
- Tagged conversations

**Ratings (3):**
- Including low rating to trigger notifications

**Analytics Snapshots (4):**
- 2 days × 2 sites with metrics

**Webhook Endpoints (2):**
- External integration examples

**Audit Logs (3):**
- Sample admin actions

**Quick Demo:**
1. Go to http://localhost:3000/sites
2. View existing demo sites with rich data
3. Use ownerId: `demo-owner-1` or `demo-owner-2`
4. View analytics to see pre-seeded conversations and metrics

## API Endpoints (35+)

### Widget Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/widget/init` | Initialize a new chat session |
| POST | `/api/widget/chat` | Send a chat message and get AI response |
| GET | `/api/widget/config/:siteKey` | Get widget configuration (colors, position, etc.) |
| GET | `/api/widget/templates/:siteKey/:category` | Get message templates by category |

### Admin - Site Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/sites` | Create a new site |
| GET | `/api/admin/sites?ownerId={id}` | List all sites for an owner |
| GET | `/api/admin/sites/:siteId` | Get specific site details |
| PUT | `/api/admin/sites/:siteId` | Update a site |
| DELETE | `/api/admin/sites/:siteId` | Delete a site |
| GET | `/api/admin/sites/:siteId/analytics` | Get site analytics |

### Admin - Widget Configuration

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/sites/:siteId/widget-config` | Create widget configuration |
| GET | `/api/admin/sites/:siteId/widget-config` | Get widget configuration |
| PUT | `/api/admin/sites/:siteId/widget-config` | Update widget configuration |
| DELETE | `/api/admin/sites/:siteId/widget-config` | Delete widget configuration |

### Admin - Conversation Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/conversations` | List conversations (with filters & pagination) |
| GET | `/api/admin/conversations/:sessionId` | Get full conversation details |
| POST | `/api/admin/conversations/:sessionId/rate` | Rate a conversation (1-5 stars) |
| POST | `/api/admin/conversations/:sessionId/tags` | Add tags to conversation |
| PUT | `/api/admin/conversations/:sessionId/status` | Update conversation status |
| GET | `/api/admin/conversations/:sessionId/export` | Export conversation as JSON |
| GET | `/api/admin/sessions/:sessionId/messages` | Get session messages |

### Admin - Message Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/templates` | Create message template |
| GET | `/api/admin/sites/:siteId/templates` | List templates (with filters) |
| GET | `/api/admin/templates/:templateId` | Get specific template |
| PUT | `/api/admin/templates/:templateId` | Update template |
| DELETE | `/api/admin/templates/:templateId` | Delete template |

### Admin - Tags

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/tags` | Create conversation tag |
| GET | `/api/admin/tags` | List all tags with usage counts |
| GET | `/api/admin/tags/:tagId` | Get specific tag |
| PUT | `/api/admin/tags/:tagId` | Update tag |
| DELETE | `/api/admin/tags/:tagId` | Delete tag |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health status with adapter health |

## Available Scripts

### Root Level

```bash
npm run dev              # Start backend + admin in dev mode
npm run build            # Build all packages
npm test                 # Run backend tests
npm run lint             # Run linter
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run database migrations
npm run db:push          # Push schema changes (no migration)
npm run db:seed          # Seed database with demo data
npm run db:studio        # Open Prisma Studio

# Docker commands
npm run docker:up        # Start all services
npm run docker:down      # Stop all services
npm run docker:logs      # View logs
npm run docker:rebuild   # Rebuild and restart
```

### Package-Specific

```bash
# Backend
cd backend
npm run dev              # Development server with hot reload
npm run build            # Build TypeScript
npm start                # Production server
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Open Vitest UI

# Admin
cd admin
npm run dev              # Next.js dev server
npm run build            # Build for production
npm start                # Production server
npm run lint             # ESLint

# Widget
cd widget
npm run dev              # Vite dev server
npm run build            # Build widget bundle
npm run preview          # Preview production build
```

## Testing

The project includes comprehensive tests for core functionality (101+ tests):

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# View coverage
npm test -- --coverage
```

**Test Coverage:**
- ✅ Schema validation (Zod) - 20+ schemas
- ✅ Error handling classes
- ✅ Adapter system (notification, AI provider, analytics, storage)
- ✅ Event bus (pub/sub, subscriptions, error handling)
- ✅ Structured logging (levels, context, child loggers)
- ✅ Metrics collection (counters, gauges, histograms, timing)
- ✅ Site CRUD operations
- ✅ Widget initialization and chat flow

## Validation & Error Handling

All API inputs are validated using Zod schemas. Errors are handled consistently:

**Validation Error (400):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": "name",
      "message": "Site name is required"
    }
  ]
}
```

**Not Found (404):**
```json
{
  "error": "Site not found"
}
```

**Server Error (500):**
```json
{
  "error": "Internal server error",
  "message": "Detailed error in development mode"
}
```

## Project Structure

```
embed-chat-widget-platform/
├── backend/                    # Fastify API
│   ├── src/
│   │   ├── routes/            # API routes
│   │   │   ├── admin.ts       # Admin: Site management
│   │   │   ├── widget.ts      # Widget: Init & chat
│   │   │   ├── widget-config.ts    # Widget customization
│   │   │   ├── conversations.ts    # Conversation management
│   │   │   ├── templates.ts        # Message templates
│   │   │   └── tags.ts             # Conversation tags
│   │   ├── lib/               # Core infrastructure
│   │   │   ├── adapters/     # Extension system
│   │   │   │   ├── index.ts          # Adapter registry
│   │   │   │   ├── notification.adapter.ts
│   │   │   │   ├── ai-provider.adapter.ts
│   │   │   │   ├── analytics.adapter.ts
│   │   │   │   └── storage.adapter.ts
│   │   │   ├── events/       # Event system
│   │   │   │   ├── domain-events.ts  # Event types
│   │   │   │   ├── event-bus.ts      # Pub/sub
│   │   │   │   └── handlers/         # Event handlers
│   │   │   ├── logger.ts     # Structured logging
│   │   │   └── metrics.ts    # Metrics collection
│   │   ├── schemas/           # Zod validation (20+ schemas)
│   │   ├── utils/             # Utilities & error handling
│   │   ├── db.ts              # Prisma client
│   │   ├── llm.ts             # AI integration facade
│   │   └── index.ts           # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema (13 tables)
│   │   ├── migrations/        # Migration history
│   │   └── seed.ts            # Rich seed data (100+ records)
│   ├── vitest.config.ts       # Test configuration
│   └── Dockerfile
├── widget/                     # Embeddable widget
│   ├── src/
│   │   ├── index.ts           # Widget logic
│   │   └── styles.ts          # Widget styles
│   └── vite.config.js
├── admin/                      # Next.js dashboard
│   ├── app/
│   │   ├── page.tsx           # Home page
│   │   └── sites/             # Site management pages
│   └── Dockerfile
├── docs/                       # Documentation
│   └── PHASE3_OVERVIEW.md     # Phase 3 design doc
├── docker-compose.yml          # Multi-container setup
├── .env.example                # Environment template
├── PHASE3_COMPLETE.md          # Phase 3 completion summary
└── README.md                   # This file
```

## Environment Variables

Required variables in `.env`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cocoon_chat"

# AI Provider (choose one)
OPENAI_API_KEY="sk-..."
# OR
ANTHROPIC_API_KEY="sk-ant-..."

# Backend
PORT=3001
HOST=0.0.0.0
NODE_ENV=development

# Admin
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Production Deployment

### Backend

1. Build: `npm run build:backend`
2. Set environment variables
3. Run migrations: `npx prisma migrate deploy`
4. Start: `npm start`

### Admin Dashboard

1. Build: `npm run build:admin`
2. Deploy to Vercel, Netlify, or similar
3. Set `NEXT_PUBLIC_API_URL` to your backend URL

### Widget

1. Build: `npm run build:widget`
2. Upload `widget/dist/cocoon-chat.js` to CDN
3. Update embed snippets with CDN URL

### Docker Production

```bash
# Build and start with production config
docker compose -f docker-compose.yml up -d --build

# View logs
docker compose logs -f

# Run migrations
docker compose exec backend npx prisma migrate deploy

# Seed data (if needed)
docker compose exec backend npm run db:seed
```

## Phase 3 Achievements ✨

**Completed Features:**
- ✅ Widget customization options (colors, position, text, custom CSS)
- ✅ Multi-model support (OpenAI, Anthropic via adapter pattern)
- ✅ Advanced analytics (ratings, tag-based segmentation, time-series)
- ✅ Conversation management (status tracking, tagging, ratings, export)
- ✅ Message templates with categories
- ✅ Webhook notifications for external integrations
- ✅ Enterprise features (audit logs, user roles, team collaboration)
- ✅ Extension system for custom adapters

## Future Extensions

Potential enhancements for Phase 4+:

### Short Term
- [ ] Add authentication/authorization for admin endpoints
- [ ] Implement rate limiting for widget endpoints
- [ ] Real-time message streaming with SSE or WebSockets
- [ ] Dashboard UI for conversation management
- [ ] Advanced search with full-text indexing

### Medium Term
- [ ] Multi-language support for widget
- [ ] Custom AI prompts per site
- [ ] Conversation handoff to human agents
- [ ] Admin panel for managing all Phase 3 features
- [ ] Email notifications for site owners

### Long Term
- [ ] Widget A/B testing
- [ ] Integration marketplace (Slack, Discord, CRM systems)
- [ ] White-label options
- [ ] SSO authentication
- [ ] Mobile SDKs (iOS, Android)
- [ ] Knowledge base integration for RAG

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker compose ps

# View database logs
docker compose logs postgres

# Test connection
cd backend
npx prisma db push
```

### Port Already in Use

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change PORT in .env
```

### Docker Issues

```bash
# Clean restart
docker compose down -v  # Remove volumes
docker compose up -d --build

# Check service health
docker compose ps
```

### Missing API Key

Make sure you have either `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` set in `.env`.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Run linter: `npm run lint`
6. Commit: `git commit -m 'Add amazing feature'`
7. Push: `git push origin feature/amazing-feature`
8. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using TypeScript, Fastify, Next.js, and Prisma**

For questions or issues, please open an issue on GitHub.
