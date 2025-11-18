# 🎨 Cocoon Chat Widget Platform

An embeddable AI chat widget platform that allows you to add intelligent chat functionality to any website with just a few lines of code.

**Status: Phase 2** - Production-ready with complete vertical slice, testing, and Docker support.

## Overview

Cocoon Chat is a full-stack, TypeScript-based platform for embedding AI-powered chat widgets on any website. It provides:

- **Backend API** for managing sites, sessions, and AI-powered conversations
- **Embeddable Widget** that can be dropped into any HTML page
- **Admin Dashboard** for site owners to manage their widgets and view analytics

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

### Core Entities

```
Site (website using the widget)
  ├─ id, ownerId, name, domain
  ├─ publicKey (for widget embedding)
  └─ secretKey (for admin operations)

ChatSession (individual conversation)
  ├─ id, sessionKey
  ├─ siteId (belongs to Site)
  └─ messages[]

ChatMessage (single message in conversation)
  ├─ id, role (user/assistant)
  ├─ content, createdAt
  └─ sessionId (belongs to ChatSession)
```

### Relationships
- One Site → Many ChatSessions
- One ChatSession → Many ChatMessages

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

## Demo Data

After running `npm run db:seed`, you'll have:

**Sites:**
- TechBlog Pro (ownerId: demo-owner-1)
- E-Commerce Store (ownerId: demo-owner-1)
- Support Portal (ownerId: demo-owner-2)

**Sessions:**
- Pre-seeded conversations with realistic chat messages

**Quick Demo:**
1. Go to http://localhost:3000/sites
2. Click "Create Site" or view existing demo sites
3. Use ownerId: `demo-owner-1` or `demo-owner-2`
4. View analytics to see pre-seeded data

## API Endpoints

### Widget Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/widget/init` | Initialize a new chat session |
| POST | `/api/widget/chat` | Send a chat message and get AI response |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/sites` | Create a new site |
| GET | `/api/admin/sites?ownerId={id}` | List all sites for an owner |
| GET | `/api/admin/sites/:siteId` | Get specific site details |
| PUT | `/api/admin/sites/:siteId` | Update a site |
| DELETE | `/api/admin/sites/:siteId` | Delete a site |
| GET | `/api/admin/sites/:siteId/analytics` | Get site analytics |
| GET | `/api/admin/sessions/:sessionId/messages` | Get session messages |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health status |

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

The project includes comprehensive tests for core functionality:

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
- ✅ Schema validation (Zod)
- ✅ Error handling classes
- ✅ Site CRUD operations
- ✅ Widget initialization
- ✅ Chat message flow

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
│   │   │   ├── admin.ts       # Admin endpoints
│   │   │   └── widget.ts      # Widget endpoints
│   │   ├── schemas/           # Zod validation schemas
│   │   ├── utils/             # Utilities & error handling
│   │   ├── db.ts              # Prisma client
│   │   ├── llm.ts             # AI integration
│   │   └── index.ts           # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Seed script
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
├── docker-compose.yml          # Multi-container setup
├── .env.example                # Environment template
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

## Future Extensions

Potential enhancements for Phase 3+:

### Short Term
- [ ] Add authentication/authorization for admin endpoints
- [ ] Implement rate limiting for widget endpoints
- [ ] Add message threading and conversation history
- [ ] Widget customization options (colors, position, text)
- [ ] Real-time message streaming with SSE or WebSockets

### Medium Term
- [ ] Multi-language support for widget
- [ ] Custom AI prompts per site
- [ ] Conversation handoff to human agents
- [ ] Advanced analytics (response time, satisfaction scores)
- [ ] Email notifications for site owners

### Long Term
- [ ] Multi-model support (switch between AI providers)
- [ ] Widget A/B testing
- [ ] Integration marketplace (Slack, Discord, etc.)
- [ ] White-label options
- [ ] Enterprise features (SSO, audit logs)

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
