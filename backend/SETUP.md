# 🚀 RentEase Backend - Complete Setup Instructions

## Quick Start (5 Minutes)

### Prerequisites Check
```bash
# Check Node.js version (need v18+)
node --version

# Check npm version
npm --version

# Check if PostgreSQL is installed
psql --version
```

---

## Option 1: Quick Setup (If you have PostgreSQL)

```bash
# 1. Navigate to backend folder
cd backend

# 2. Install all dependencies
npm install

# 3. Create PostgreSQL database
psql -U postgres
CREATE DATABASE rentease;
\q

# 4. Initialize database with Prisma
npm run db:generate
npm run db:migrate

# 5. Start development server
npm run dev

# ✅ Server running at http://localhost:3000
```

---

## Option 2: Detailed Setup (Step-by-Step)

### Step 1: Install PostgreSQL

#### Windows
1. Download installer: https://www.postgresql.org/download/windows/
2. Run the installer
3. During installation:
   - Set password for `postgres` user (remember this!)
   - Keep default port: `5432`
4. Add PostgreSQL to PATH:
   ```
   C:\Program Files\PostgreSQL\16\bin
   ```

#### Mac
```bash
brew install postgresql@16
brew services start postgresql@16
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Step 2: Create Database

#### Using psql (Command Line)
```bash
# Windows
psql -U postgres

# Mac/Linux
sudo -u postgres psql

# Then in psql prompt:
CREATE DATABASE rentease;
\l  -- Verify database created
\q  -- Exit
```

#### Using pgAdmin (GUI)
1. Open pgAdmin
2. Connect to PostgreSQL server
3. Right-click "Databases" → "Create" → "Database"
4. Name: `rentease`
5. Click "Save"

### Step 3: Configure Environment

The `.env` file is already created. Update if needed:

```env
# Update this line with your PostgreSQL credentials
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/rentease?schema=public"
```

**Connection String Format:**
```
postgresql://[username]:[password]@[host]:[port]/[database]?schema=public
```

### Step 4: Install Dependencies

```bash
cd backend
npm install
```

This will install:
- Express.js (web framework)
- Prisma (ORM)
- JWT libraries
- bcrypt (password hashing)
- Zod (validation)
- Winston (logging)
- And more...

### Step 5: Initialize Database

```bash
# Generate Prisma Client (TypeScript types)
npm run db:generate

# Run migrations (create tables)
npm run db:migrate

# You should see output like:
# Your database is now in sync with your Prisma schema
```

### Step 6: Verify Database

```bash
# Open Prisma Studio (Database GUI)
npm run db:studio

# Opens at http://localhost:5555
# You should see all tables: User, Item, Booking, etc.
```

### Step 7: Start Server

```bash
# Development mode (with auto-reload)
npm run dev

# You should see:
# 🚀 RentEase API server running on port 3000
# 📝 Environment: development
# 🔗 API Base URL: http://localhost:3000
```

### Step 8: Test API

#### Health Check
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "message": "RentEase API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

#### Register a Test User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"Test123456\",\"name\":\"Test User\",\"role\":\"OWNER\"}"
```

Expected: User object with JWT tokens

---

## Common Issues & Solutions

### Issue 1: "psql: command not found"

**Windows:**
```bash
# Add to PATH
setx PATH "%PATH%;C:\Program Files\PostgreSQL\16\bin"
# Restart terminal
```

**Mac:**
```bash
brew link postgresql@16
```

### Issue 2: "Database connection failed"

**Check PostgreSQL is running:**
```bash
# Windows
pg_ctl status

# Mac
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql
```

**Verify DATABASE_URL:**
```bash
# Test connection
psql -U postgres -d rentease
```

### Issue 3: "Port 3000 already in use"

**Option A: Kill the process**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

**Option B: Change port**
Edit `.env`:
```env
PORT=3001
```

### Issue 4: "Module not found" errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Issue 5: Migration errors

```bash
# Reset database (WARNING: Deletes all data!)
npx prisma migrate reset

# Or push schema directly
npm run db:push
```

---

## Development Workflow

### Daily Development
```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: View database
npm run db:studio
```

### After Schema Changes
```bash
# 1. Edit prisma/schema.prisma

# 2. Generate migration
npx prisma migrate dev --name describe_your_change

# 3. Regenerate client
npm run db:generate
```

### Testing APIs

**Using curl:**
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d @register.json

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d @login.json

# Create item (with token)
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d @item.json
```

**Using Postman/Insomnia:**
1. Import endpoints from `API_DOCUMENTATION.md`
2. Set base URL: `http://localhost:3000/api`
3. For protected routes, add header:
   ```
   Authorization: Bearer <your_token>
   ```

---

## Production Deployment

### Build for Production
```bash
# Compile TypeScript
npm run build

# Start production server
npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/rentease
JWT_SECRET=<strong-random-string>
JWT_REFRESH_SECRET=<strong-random-string>
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=error
```

### Generate Strong Secrets
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or use online generator
# https://generate-secret.vercel.app/64
```

---

## Useful Commands Reference

```bash
# Development
npm run dev              # Start dev server with hot reload

# Database
npm run db:generate      # Generate Prisma Client
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio
npm run db:push          # Push schema to DB (dev only)
npm run db:seed          # Seed database (if seed file exists)

# Production
npm run build            # Compile TypeScript
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm test                 # Run tests
```

---

## Next Steps

✅ Server is running? Great!

1. **Read the docs:**
   - [README.md](./README.md) - Full overview
   - [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - All endpoints
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - System design

2. **Test the APIs:**
   - Register a user
   - Create items
   - Make bookings
   - Process payments

3. **Connect frontend:**
   - Update frontend API base URL
   - Use JWT tokens for auth
   - Start building features!

---

## Support & Resources

- **Prisma Docs:** https://www.prisma.io/docs
- **Express Docs:** https://expressjs.com/
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **JWT.io:** https://jwt.io/

---

## 🎉 You're All Set!

Your RentEase backend is now ready for development!

**Server:** http://localhost:3000  
**Database GUI:** http://localhost:5555  
**API Docs:** See `API_DOCUMENTATION.md`

Happy coding! 🚀
