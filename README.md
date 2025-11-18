# 🎨 Cocoon Chat Widget Platform

An embeddable AI chat widget platform that allows you to add intelligent chat functionality to any website with just a few lines of code.

## ✨ Features

- **Easy Integration**: Embed on any website with a simple JavaScript snippet
- **AI-Powered**: Supports both OpenAI (GPT) and Anthropic (Claude) for intelligent responses
- **Session Management**: Maintains conversation context across messages
- **Beautiful UI**: Responsive, modern chat interface that works on all devices
- **Admin Dashboard**: Manage multiple sites, view analytics, and monitor conversations
- **Analytics**: Track sessions, messages, and user engagement
- **TypeScript**: Full type safety across the entire stack

## 🏗️ Architecture

This is a monorepo containing three main components:

```
embed-chat-widget-platform/
├── backend/          # Fastify API server (Node.js + TypeScript)
├── widget/           # Embeddable chat widget (Vanilla JS/TS + Vite)
├── admin/            # Admin dashboard (Next.js + React)
└── package.json      # Workspace configuration
```

### Tech Stack

- **Backend**: Fastify, Prisma, PostgreSQL, TypeScript
- **Widget**: Vanilla TypeScript, Vite
- **Admin**: Next.js 14, React, Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **AI**: OpenAI API or Anthropic API

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key OR Anthropic API key

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd embed-chat-widget-platform
npm install
```

### 2. Setup Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cocoon_chat?schema=public"

# Choose ONE AI provider:
OPENAI_API_KEY="sk-..."
# OR
ANTHROPIC_API_KEY="sk-ant-..."

# Backend
PORT=3001
NODE_ENV=development

# Admin UI
NEXT_PUBLIC_API_URL=http://localhost:3001

# JWT Secret (change in production)
JWT_SECRET="your-secret-key-change-in-production"
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

### 4. Build Everything

```bash
# Build all packages
npm run build

# Or build individually
npm run build:backend
npm run build:widget
npm run build:admin
```

### 5. Start Development Servers

**Option A: Start all services in separate terminals**

```bash
# Terminal 1: Backend API
npm run dev:backend

# Terminal 2: Admin Dashboard
npm run dev:admin

# Terminal 3: Widget Development
npm run dev:widget
```

**Option B: Production mode**

```bash
# Start backend in production
cd backend && npm start

# Start admin in production
cd admin && npm start
```

## 📖 Usage

### Admin Dashboard

1. Open the admin dashboard at `http://localhost:3000`
2. Click "Go to Dashboard"
3. Create a new site:
   - Enter your site name (e.g., "My Blog")
   - Enter your domain (e.g., "myblog.com")
   - Click "Create"
4. Copy the embed code provided

### Embedding the Widget

Add this code to your website, right before the closing `</body>` tag:

```html
<!-- Cocoon Chat Widget -->
<script src="http://localhost:3001/widget/cocoon-chat.js"></script>
<script>
  createCocoonChatWidget({
    siteKey: 'YOUR_SITE_PUBLIC_KEY_HERE',
    apiUrl: 'http://localhost:3001'
  });
</script>
```

Replace `YOUR_SITE_PUBLIC_KEY_HERE` with the public key from your admin dashboard.

### Example HTML Page

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
</head>
<body>
  <h1>Welcome to My Website</h1>
  <p>This is a demo page with an embedded chat widget.</p>

  <!-- Cocoon Chat Widget -->
  <script src="http://localhost:3001/widget/cocoon-chat.js"></script>
  <script>
    createCocoonChatWidget({
      siteKey: 'clxy123456789',
      apiUrl: 'http://localhost:3001'
    });
  </script>
</body>
</html>
```

## 🔧 API Endpoints

### Widget Endpoints

#### Initialize Session
```http
POST /api/widget/init
Content-Type: application/json

{
  "siteKey": "your-site-public-key"
}

Response:
{
  "sessionKey": "unique-session-key",
  "sessionId": "session-id"
}
```

#### Send Chat Message
```http
POST /api/widget/chat
Content-Type: application/json

{
  "sessionKey": "unique-session-key",
  "message": "Hello, how can you help me?"
}

Response:
{
  "message": "AI response here",
  "messageId": "message-id",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Admin Endpoints

#### Create Site
```http
POST /api/admin/sites
Content-Type: application/json

{
  "name": "My Site",
  "domain": "example.com",
  "ownerId": "user-id"
}
```

#### List Sites
```http
GET /api/admin/sites?ownerId=user-id
```

#### Get Site Analytics
```http
GET /api/admin/sites/{siteId}/analytics
```

## 📊 Database Schema

```prisma
model Site {
  id          String        @id @default(cuid())
  ownerId     String
  name        String
  domain      String
  publicKey   String        @unique
  secretKey   String        @unique
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  sessions    ChatSession[]
}

model ChatSession {
  id          String        @id @default(cuid())
  siteId      String
  sessionKey  String        @unique
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  site        Site          @relation(...)
  messages    ChatMessage[]
}

model ChatMessage {
  id          String      @id @default(cuid())
  sessionId   String
  role        String      // 'user' or 'assistant'
  content     String      @db.Text
  createdAt   DateTime    @default(now())
  session     ChatSession @relation(...)
}
```

## 🎨 Widget Customization

The widget uses CSS classes that you can override in your website:

```css
/* Customize bubble color */
.cocoon-chat-bubble {
  background: linear-gradient(135deg, #your-color-1, #your-color-2) !important;
}

/* Customize panel size */
.cocoon-chat-panel {
  width: 400px !important;
  height: 650px !important;
}

/* Customize header */
.cocoon-chat-header {
  background: linear-gradient(135deg, #your-color-1, #your-color-2) !important;
}
```

## 🔒 Security Considerations

### Production Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Use environment-specific database credentials
- [ ] Enable HTTPS for all endpoints
- [ ] Implement proper authentication for admin endpoints
- [ ] Set up rate limiting on API endpoints
- [ ] Add CORS restrictions based on allowed domains
- [ ] Rotate API keys regularly
- [ ] Monitor API usage and costs
- [ ] Implement input validation and sanitization
- [ ] Set up error tracking (e.g., Sentry)

### CORS Configuration

The backend currently allows all origins for widget embedding. For production, consider restricting by domain:

```typescript
// backend/src/index.ts
await fastify.register(cors, {
  origin: (origin, cb) => {
    // Verify origin against allowed domains in database
    // Allow requests from registered site domains only
    cb(null, true)
  },
  credentials: true,
});
```

## 📦 Production Deployment

### Backend Deployment

1. Build the backend:
   ```bash
   cd backend
   npm run build
   ```

2. Set environment variables in your hosting platform

3. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```

4. Start the server:
   ```bash
   npm start
   ```

### Widget Deployment

1. Build the widget:
   ```bash
   cd widget
   npm run build
   ```

2. Upload `dist/cocoon-chat.js` to your CDN

3. Update embed snippets to use CDN URL:
   ```html
   <script src="https://cdn.yourdomain.com/cocoon-chat.js"></script>
   ```

### Admin Dashboard Deployment

1. Build the admin app:
   ```bash
   cd admin
   npm run build
   ```

2. Deploy to Vercel, Netlify, or your preferred hosting platform

## 🧪 Testing the Widget

A demo page is included in the widget package:

```bash
cd widget
npm run dev
```

Open `http://localhost:5173` to test the widget locally.

## 📝 Development Scripts

```bash
# Install all dependencies
npm install

# Development mode (all services)
npm run dev:backend    # Start backend API
npm run dev:widget     # Start widget dev server
npm run dev:admin      # Start admin dashboard

# Build for production
npm run build          # Build all packages
npm run build:backend  # Build backend only
npm run build:widget   # Build widget only
npm run build:admin    # Build admin only

# Database operations
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Built with [Fastify](https://www.fastify.io/)
- UI powered by [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/)
- Database management with [Prisma](https://www.prisma.io/)
- AI capabilities from [OpenAI](https://openai.com/) and [Anthropic](https://www.anthropic.com/)

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

Made with ❤️ by the Cocoon Chat team
