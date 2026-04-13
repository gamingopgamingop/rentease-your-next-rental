# Quick Start Guide

Get your RentEase backend up and running in minutes!

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/) (v14+)

## Step-by-Step Setup

### 1. Install PostgreSQL

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- During installation, remember your postgres password

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE rentease;

# Exit
\q
```

### 3. Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Environment is already configured in .env file
# If you need to change database credentials, edit .env
```

### 4. Initialize Database

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate
```

### 5. Start the Server

```bash
# Development mode (with hot reload)
npm run dev
```

Server will start at: `http://localhost:3000`

### 6. Test the API

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Register a User:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "name": "Test User",
    "role": "OWNER"
  }'
```

## Optional: View Database

```bash
# Open Prisma Studio (Database GUI)
npm run db:studio
```

Opens at: `http://localhost:5555`

## Common Issues

### "Database connection failed"
- Check if PostgreSQL is running
- Verify DATABASE_URL in .env file
- Ensure database 'rentease' exists

### "Port 3000 already in use"
- Change PORT in .env file
- Or kill the process using port 3000

### "Module not found" errors
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then reinstall

## Next Steps

1. Read [API Documentation](./API_DOCUMENTATION.md) for all endpoints
2. Check [README](./README.md) for detailed information
3. Start building your frontend!

## Development Workflow

```bash
# Start development server
npm run dev

# In another terminal, open Prisma Studio
npm run db:studio

# Make changes to schema.prisma
# Then run:
npm run db:migrate
npm run db:generate
```

## Testing with Postman/Insomnia

1. Import the API endpoints from [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
2. Set base URL to `http://localhost:3000/api`
3. For protected routes, add header: `Authorization: Bearer <token>`

Happy coding! 🚀
