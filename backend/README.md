# RentEase Backend API

Production-ready backend for **RentEase** - A Temporary Resource Rental Platform built with Node.js, Express.js, PostgreSQL, and Prisma ORM.

## 🚀 Features

- ✅ **Clean Architecture** - Modular structure with controllers, services, routes
- ✅ **RESTful APIs** - Following REST naming conventions
- ✅ **JWT Authentication** - Secure token-based auth with refresh tokens
- ✅ **Role-based Access Control** - Owner and Renter roles
- ✅ **Input Validation** - Zod schemas for request validation
- ✅ **Security** - Helmet, CORS, Rate Limiting, bcrypt password hashing
- ✅ **Error Handling** - Centralized error handling middleware
- ✅ **Logging** - Winston logger with file and console outputs
- ✅ **Database** - PostgreSQL with Prisma ORM
- ✅ **TypeScript** - Full type safety

## 📁 Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   └── env.ts             # Environment configuration
│   ├── database/
│   │   └── prisma.ts          # Prisma client instance
│   ├── middleware/
│   │   ├── auth.ts            # JWT authentication & authorization
│   │   ├── errorHandler.ts    # Error handling utilities
│   │   └── validation.ts      # Zod validation schemas
│   ├── modules/
│   │   ├── auth/              # Authentication module
│   │   ├── user/              # User profile module
│   │   ├── item/              # Item management module
│   │   ├── search/            # Search & filtering module
│   │   ├── booking/           # Booking management module
│   │   ├── payment/           # Payment processing module
│   │   ├── review/            # Reviews & ratings module
│   │   └── dashboard/         # Dashboard analytics module
│   ├── utils/
│   │   └── logger.ts          # Winston logger configuration
│   └── app.ts                 # Express app entry point
├── .env.example               # Environment variables template
├── package.json
└── tsconfig.json
```

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Validation:** Zod
- **Security:** Helmet, CORS, Rate Limiting
- **Logging:** Winston, Morgan
- **Language:** TypeScript

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## 🔧 Installation

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/rentease?schema=public"
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   ```

4. **Set up database:**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   
   # (Optional) Open Prisma Studio to view database
   npm run db:studio
   ```

## 🚀 Running the Application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`)

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (Owner/Renter)
- `POST /api/auth/login` - Login and get JWT tokens
- `POST /api/auth/refresh-token` - Refresh access token

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Items (Owner only for create/update/delete)
- `POST /api/items` - Create new item
- `GET /api/items/:id` - Get item details
- `GET /api/items/my-items` - Get owner's items
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Search
- `GET /api/search/items` - Search items with filters
  - Query params: `keyword`, `category`, `minPrice`, `maxPrice`, `location`, `availableFrom`, `availableTo`, `page`, `limit`

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking details
- `GET /api/bookings/my-bookings` - Get user's bookings
- `PUT /api/bookings/:id/status` - Update booking status

### Payments
- `POST /api/payments/process` - Process payment (mock)
- `GET /api/payments/my-payments` - Get user's payments
- `GET /api/payments/receipt/:transactionId` - Get payment receipt

### Reviews
- `POST /api/reviews` - Create review (after completed booking)
- `GET /api/reviews/item/:itemId` - Get item reviews
- `PUT /api/reviews/:id` - Update own review
- `DELETE /api/reviews/:id` - Delete own review

### Dashboard
- `GET /api/dashboard/owner` - Owner dashboard (items, bookings, earnings)
- `GET /api/dashboard/renter` - Renter dashboard (booking history)

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## 📊 Database Schema

The application uses the following main entities:

- **Users** - Authentication and profile data
- **Items** - Rentable resources
- **Bookings** - Rental reservations
- **Payments** - Payment records (mock)
- **Reviews** - Item ratings and comments
- **Notifications** - User notifications

## 🛡️ Security Features

- **Password Hashing:** bcrypt with configurable salt rounds
- **JWT Tokens:** Access tokens + Refresh tokens
- **Rate Limiting:** Prevents brute force attacks
- **Helmet:** Sets security HTTP headers
- **CORS:** Configurable cross-origin resource sharing
- **Input Validation:** Zod schemas on all endpoints
- **SQL Injection Prevention:** Prisma parameterized queries

## 🧪 Testing

```bash
npm test
```

## 📝 Development Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript
npm start            # Start production server
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
npm run db:push      # Push schema to database
npm run lint         # Run ESLint
```

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | Access token expiry | `7d` |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `30d` |
| `BCRYPT_SALT_ROUNDS` | Bcrypt salt rounds | `12` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `CORS_ORIGIN` | Allowed origins | `http://localhost:5173` |

## 📄 License

MIT

## 👥 Contributors

Built with ❤️ for RentEase
