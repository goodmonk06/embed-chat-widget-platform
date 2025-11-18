# Setup Guide

This guide will help you get the Cocoon Chat Widget Platform up and running on your local machine.

## Step-by-Step Setup

### 1. Install Dependencies

From the root directory:

```bash
npm install
```

This will install dependencies for all workspaces (backend, widget, admin).

### 2. Setup PostgreSQL Database

You need a PostgreSQL database. You can either:

**Option A: Use a local PostgreSQL installation**

```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb cocoon_chat
```

**Option B: Use Docker**

```bash
docker run --name cocoon-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=cocoon_chat \
  -p 5432:5432 \
  -d postgres:15
```

**Option C: Use a cloud provider**

- [Supabase](https://supabase.com/) (Free tier available)
- [Neon](https://neon.tech/) (Free tier available)
- [Railway](https://railway.app/) (Free tier available)

### 3. Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your settings
nano .env  # or use your preferred editor
```

Required variables:
- `DATABASE_URL`: Your PostgreSQL connection string
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`: Your AI provider API key

### 4. Initialize Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view your database
cd backend && npm run prisma:studio
```

### 5. Build All Packages

```bash
npm run build
```

This builds:
- Backend TypeScript code
- Widget JavaScript bundle
- Admin Next.js application

### 6. Start Development Servers

**Option 1: Manual start (recommended for development)**

Open 3 terminal windows:

```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Admin Dashboard
npm run dev:admin

# Terminal 3: Widget (for testing)
npm run dev:widget
```

**Option 2: Production mode**

```bash
# Start backend
cd backend && npm start &

# Start admin
cd admin && npm start &
```

### 7. Verify Installation

1. Backend health check: http://localhost:3001/health
2. Admin dashboard: http://localhost:3000
3. Widget demo: http://localhost:5173 (if running widget dev server)

### 8. Create Your First Site

1. Go to http://localhost:3000
2. Click "Go to Dashboard"
3. Click "+ Create Site"
4. Fill in:
   - Site Name: "My Test Site"
   - Domain: "localhost"
5. Click "Create"
6. Copy the public key
7. Test the widget using the demo page

## Troubleshooting

### Database Connection Issues

If you see `Error: Can't reach database server`:

1. Check PostgreSQL is running:
   ```bash
   # macOS
   brew services list

   # Docker
   docker ps
   ```

2. Verify DATABASE_URL in .env is correct

3. Test connection:
   ```bash
   cd backend
   npx prisma db push
   ```

### Port Already in Use

If port 3001 or 3000 is already in use:

```bash
# Find and kill the process
lsof -ti:3001 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

Or change the ports in .env and package.json scripts.

### Missing API Keys

If you see "No LLM API key provided":

1. Get an API key:
   - OpenAI: https://platform.openai.com/api-keys
   - Anthropic: https://console.anthropic.com/

2. Add to .env:
   ```
   OPENAI_API_KEY=sk-...
   ```

3. Restart the backend server

### Build Errors

If you encounter build errors:

```bash
# Clean install
rm -rf node_modules
rm -rf backend/node_modules
rm -rf widget/node_modules
rm -rf admin/node_modules

npm install

# Rebuild
npm run build
```

## Next Steps

Once everything is running:

1. Read the [README.md](README.md) for usage instructions
2. Explore the admin dashboard at http://localhost:3000
3. Test the widget on the demo page
4. Try embedding the widget on your own website
5. Check out the API endpoints documentation in README.md

## Development Tips

### Hot Reload

- Backend: Uses `tsx watch` for instant restart on file changes
- Widget: Vite provides instant HMR
- Admin: Next.js Fast Refresh for instant updates

### Database Changes

When you modify the Prisma schema:

```bash
# Create a migration
cd backend
npx prisma migrate dev --name your_migration_name

# Regenerate client
npx prisma generate
```

### Debugging

Enable debug logging:

```env
# In .env
NODE_ENV=development
LOG_LEVEL=debug
```

View logs in the backend terminal.

## Production Deployment

See the "Production Deployment" section in [README.md](README.md) for deployment instructions.
