# RentEase Backend Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT APP                           │
│                   (React/Vue/Mobile)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                    HTTP/REST
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXPRESS.JS SERVER                         │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              MIDDLEWARE LAYER                         │ │
│  │                                                       │ │
│  │  Helmet → CORS → Rate Limit → Body Parser → Morgan   │ │
│  └───────────────────────────────────────────────────────┘ │
│                         │                                   │
│                         ▼                                   │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              ROUTE HANDLERS                           │ │
│  │                                                       │ │
│  │  /api/auth    /api/users    /api/items               │ │
│  │  /api/search  /api/bookings /api/payments            │ │
│  │  /api/reviews /api/dashboard                         │ │
│  └───────────────────────────────────────────────────────┘ │
│                         │                                   │
│                         ▼                                   │
│  ┌───────────────────────────────────────────────────────┐ │
│  │           AUTHENTICATION MIDDLEWARE                   │ │
│  │                                                       │ │
│  │  JWT Verification → User Lookup → Role Check         │ │
│  └───────────────────────────────────────────────────────┘ │
│                         │                                   │
│                         ▼                                   │
│  ┌───────────────────────────────────────────────────────┐ │
│  │            VALIDATION MIDDLEWARE                      │ │
│  │                                                       │ │
│  │  Zod Schema Validation (Request Body/Query/Params)   │ │
│  └───────────────────────────────────────────────────────┘ │
│                         │                                   │
│                         ▼                                   │
│  ┌───────────────────────────────────────────────────────┐ │
│  │             CONTROLLER LAYER                          │ │
│  │                                                       │ │
│  │  Extract Data → Call Service → Return Response       │ │
│  └───────────────────────────────────────────────────────┘ │
│                         │                                   │
│                         ▼                                   │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              SERVICE LAYER                            │ │
│  │                                                       │ │
│  │  Business Logic → Data Transformation → Validation   │ │
│  └───────────────────────────────────────────────────────┘ │
│                         │                                   │
│                         ▼                                   │
│  ┌───────────────────────────────────────────────────────┐ │
│  │            DATA ACCESS LAYER (Prisma)                 │ │
│  │                                                       │ │
│  │  Type-safe Queries → Migrations → Connection Pool    │ │
│  └───────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │
                    PostgreSQL
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE TABLES                          │
│                                                             │
│  ┌──────────┐  ┌────────┐  ┌─────────┐                    │
│  │  Users   │  │ Items  │  │Bookings │                    │
│  └──────────┘  └────────┘  └─────────┘                    │
│                                                             │
│  ┌──────────┐  ┌────────┐  ┌────────────┐                │
│  │ Payments │  │Reviews │  │Notifications│                │
│  └──────────┘  └────────┘  └────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

---

## Request Flow Diagram

```
Client Request
     │
     ▼
┌─────────────────┐
│  Security       │
│  (Helmet/CORS)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Rate Limiter   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Body Parser    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Logger         │
│  (Morgan)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Route Match    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Auth Check     │◄──── JWT Verification
│  (if required)  │     Role Authorization
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validation     │◄──── Zod Schemas
│  (Zod)          │     Input Sanitization
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Controller     │◄──── Extract Request Data
│                 │     Format Response
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Service        │◄──── Business Logic
│                 │     Data Processing
│                 │     Calculations
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Prisma ORM     │◄──── Database Queries
│                 │     Type-safe Operations
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  PostgreSQL     │
│  Database       │
└────────┬────────┘
         │
         ▼
     Response
     (JSON)
```

---

## Module Dependency Graph

```
                    ┌─────────────┐
                    │   Config    │
                    │  (env.ts)   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Database │ │  Utils   │ │Middleware│
        │ (Prisma) │ │(Logger)  │ │          │
        └────┬─────┘ └──────────┘ └────┬─────┘
             │                          │
             │                          │
             ▼                          ▼
        ┌─────────────────────────────────────┐
        │           MODULE LAYER              │
        │                                     │
        │  ┌─────────┐      ┌──────────┐    │
        │  │  Auth   │─────►│  User    │    │
        │  └─────────┘      └──────────┘    │
        │       │                            │
        │       ▼                            │
        │  ┌─────────┐      ┌──────────┐    │
        │  │  Item   │─────►│  Search  │    │
        │  └─────────┘      └──────────┘    │
        │       │                            │
        │       ▼                            │
        │  ┌─────────┐      ┌──────────┐    │
        │  │ Booking │─────►│ Payment  │    │
        │  └─────────┘      └──────────┘    │
        │       │                            │
        │       ▼                            │
        │  ┌─────────┐      ┌──────────┐    │
        │  │ Review  │      │Dashboard │    │
        │  └─────────┘      └──────────┘    │
        └─────────────────────────────────────┘
```

---

## Database Entity Relationship

```
┌─────────────┐
│    User     │
│─────────────│
│ id (PK)     │
│ email       │
│ password    │
│ name        │
│ role        │
│ phone       │
│ location    │
└──────┬──────┘
       │
       ├───┬───────────────────────────────────┐
       │   │                                   │
       │   │                                   │
       ▼   ▼                                   ▼
┌────────────┐  ┌──────────────┐  ┌─────────────────┐
│    Item    │  │   Booking    │  │    Payment      │
│────────────│  │──────────────│  │─────────────────│
│ id (PK)    │  │ id (PK)      │  │ id (PK)         │
│ owner_id   │◄─│ item_id (FK) │  │ booking_id (FK) │
│ name       │  │ renter_id    │◄─│ payer_id (FK)   │
│ category   │  │ owner_id     │  │ amount          │
│ price/day  │  │ start_date   │  │ status          │
│ condition  │  │ end_date     │  │ transaction_id  │
└──────┬─────┘  │ status       │  └─────────────────┘
       │        │ total_price  │
       │        └──────┬───────┘
       │               │
       ▼               ▼
┌────────────┐  ┌──────────────┐
│   Review   │  │ Notification │
│────────────│  │──────────────│
│ id (PK)    │  │ id (PK)      │
│ item_id    │  │ user_id (FK) │
│ reviewer_id│  │ title        │
│ rating     │  │ message      │
│ comment    │  │ is_read      │
└────────────┘  └──────────────┘
```

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                    REGISTER FLOW                        │
│                                                         │
│  Client                 Server               Database  │
│    │                     │                     │       │
│    │──POST /register───►│                     │       │
│    │   {email, pass}    │                     │       │
│    │                     │──Validate Data─────►│       │
│    │                     │                     │       │
│    │                     │──Hash Password      │       │
│    │                     │  (bcrypt)           │       │
│    │                     │                     │       │
│    │                     │──Create User───────►│       │
│    │                     │                     │       │
│    │                     │──Generate JWT       │       │
│    │                     │  Tokens             │       │
│    │                     │                     │       │
│    │◄──{user, tokens}───│                     │       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 AUTHENTICATED REQUEST                   │
│                                                         │
│  Client                 Server               Database  │
│    │                     │                     │       │
│    │──GET /items ───────►│                     │       │
│    │  Authorization:     │                     │       │
│    │  Bearer <token>     │                     │       │
│    │                     │                     │       │
│    │                     │──Extract Token      │       │
│    │                     │                     │       │
│    │                     │──Verify JWT         │       │
│    │                     │  (signature, exp)   │       │
│    │                     │                     │       │
│    │                     │──Find User──────────►│       │
│    │                     │                     │       │
│    │                     │──Check Role         │       │
│    │                     │  (if required)      │       │
│    │                     │                     │       │
│    │                     │──Process Request    │       │
│    │                     │                     │       │
│    │◄──{items}───────────│                     │       │
└─────────────────────────────────────────────────────────┘
```

---

## Booking Creation Flow

```
┌──────────────────────────────────────────────────────────┐
│                   BOOKING FLOW                           │
│                                                          │
│  1. Client sends booking request                         │
│     POST /api/bookings {itemId, startDate, endDate}     │
│                                                          │
│  2. Server validates request                             │
│     ✓ Date format                                        │
│     ✓ Start < End                                        │
│     ✓ Not in past                                        │
│                                                          │
│  3. Check item availability                              │
│     ✓ Item exists                                        │
│     ✓ Item is available                                  │
│     ✓ Within availability dates                          │
│                                                          │
│  4. Prevent double booking                               │
│     Query: Find overlapping bookings with status        │
│     PENDING or CONFIRMED                                 │
│                                                          │
│  5. Calculate total price                                │
│     days = (end - start) / (1000*60*60*24)              │
│     totalPrice = days × pricePerDay                      │
│                                                          │
│  6. Create booking                                       │
│     Status: PENDING                                      │
│                                                          │
│  7. Return booking details                               │
│                                                          │
│  8. Client processes payment                             │
│     POST /api/payments/process {bookingId}              │
│                                                          │
│  9. Update booking status                                │
│     PENDING → CONFIRMED                                  │
└──────────────────────────────────────────────────────────┘
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────┐
│                  SECURITY STACK                     │
│                                                     │
│  Layer 1: Network Security                         │
│  ├─ Rate Limiting (100 req/15min)                  │
│  └─ CORS (Configured origins)                      │
│                                                     │
│  Layer 2: HTTP Security                            │
│  └─ Helmet (Security headers)                      │
│     ├─ X-Frame-Options                             │
│     ├─ X-Content-Type-Options                      │
│     ├─ Strict-Transport-Security                   │
│     └─ X-XSS-Protection                            │
│                                                     │
│  Layer 3: Authentication                           │
│  ├─ JWT Access Token (7 days)                      │
│  ├─ JWT Refresh Token (30 days)                    │
│  └─ bcrypt Password Hashing (12 rounds)            │
│                                                     │
│  Layer 4: Authorization                            │
│  ├─ Role-based Access Control                      │
│  ├─ Resource Ownership Verification                │
│  └─ Status Transition Validation                   │
│                                                     │
│  Layer 5: Input Validation                         │
│  ├─ Zod Schema Validation                          │
│  ├─ Type Checking (TypeScript)                     │
│  └─ Data Sanitization                              │
│                                                     │
│  Layer 6: Database Security                        │
│  ├─ Parameterized Queries (Prisma)                 │
│  ├─ SQL Injection Prevention                       │
│  └─ Row Level Security (if needed)                 │
│                                                     │
│  Layer 7: Error Handling                           │
│  ├─ No Stack Traces in Production                  │
│  ├─ Centralized Error Middleware                   │
│  └─ Logging (Winston)                              │
└─────────────────────────────────────────────────────┘
```

---

## Deployment Architecture (Future)

```
┌──────────────────────────────────────────────────────┐
│                  PRODUCTION SETUP                    │
│                                                      │
│  Client (React App)                                 │
│       │                                              │
│       ▼                                              │
│  ┌────────────┐                                     │
│  │   CDN /    │                                     │
│  │   Static   │                                     │
│  └────────────┘                                     │
│                                                      │
│  API Server (Node.js + Express)                     │
│       │                                              │
│       ├──► Load Balancer                            │
│       │                                              │
│       ├──► Multiple Instances (PM2/Docker)          │
│       │                                              │
│       ▼                                              │
│  ┌────────────┐                                     │
│  │ PostgreSQL │◄─── Connection Pooling              │
│  │ Database   │                                     │
│  └────────────┘                                     │
│                                                      │
│  ┌────────────┐                                     │
│  │   Redis    │◄─── Cache Layer (Future)            │
│  │  (Cache)   │                                     │
│  └────────────┘                                     │
│                                                      │
│  ┌────────────┐                                     │
│  │   AWS S3   │◄─── File Storage (Future)           │
│  │  (Images)  │                                     │
│  └────────────┘                                     │
└──────────────────────────────────────────────────────┘
```

---

This architecture is **scalable, secure, and production-ready**! 🚀
