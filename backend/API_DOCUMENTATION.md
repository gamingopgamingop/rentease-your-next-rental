# RentEase API Documentation

Complete API documentation for the RentEase backend.

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected endpoints require a Bearer token:
```
Authorization: Bearer <access_token>
```

---

## 1. AUTH MODULE

### Register User
**POST** `/auth/register`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "name": "John Doe",
  "role": "OWNER",
  "phone": "+1234567890",
  "location": "New York, NY"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "OWNER",
      "phone": "+1234567890",
      "location": "New York, NY",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

### Login
**POST** `/auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response:** `200 OK`

### Refresh Token
**POST** `/auth/refresh-token`

**Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

---

## 2. USER MODULE

### Get Profile
**GET** `/users/profile`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "role": "OWNER",
    "location": "New York, NY",
    "avatarUrl": "https://...",
    "bio": "Sample bio",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update Profile
**PUT** `/users/profile`

**Body:** (all fields optional)
```json
{
  "name": "John Smith",
  "phone": "+9876543210",
  "location": "Los Angeles, CA",
  "avatarUrl": "https://...",
  "bio": "Updated bio"
}
```

---

## 3. ITEM MODULE

### Create Item (Owner only)
**POST** `/items`

**Body:**
```json
{
  "name": "Power Drill",
  "category": "TOOLS",
  "description": "High-quality power drill for rent",
  "condition": "NEW",
  "pricePerDay": 25.00,
  "location": "New York, NY",
  "imageUrl": "https://...",
  "availableFrom": "2024-01-01T00:00:00.000Z",
  "availableTo": "2024-12-31T00:00:00.000Z"
}
```

**Categories:** `TOOLS`, `ELECTRONICS`, `APPLIANCES`, `VEHICLES`, `SPORTS`, `FURNITURE`, `CLOTHING`, `OTHER`

**Conditions:** `NEW`, `LIKE_NEW`, `GOOD`, `FAIR`, `WORN`

### Get Item Details
**GET** `/items/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Item retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "Power Drill",
    "category": "TOOLS",
    "description": "High-quality power drill for rent",
    "condition": "NEW",
    "pricePerDay": "25.00",
    "location": "New York, NY",
    "imageUrl": "https://...",
    "isAvailable": true,
    "owner": {
      "id": "uuid",
      "name": "John Doe",
      "email": "owner@example.com",
      "location": "New York, NY"
    },
    "reviews": [...],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Owner's Items
**GET** `/items/my-items?page=1&limit=10`

### Update Item (Owner only)
**PUT** `/items/:id`

**Body:** (fields to update)
```json
{
  "name": "Updated Name",
  "pricePerDay": 30.00,
  "isAvailable": false
}
```

### Delete Item (Owner only)
**DELETE** `/items/:id`

---

## 4. SEARCH MODULE

### Search Items
**GET** `/search/items`

**Query Parameters:**
- `keyword` (optional) - Search in name and description
- `category` (optional) - Filter by category
- `minPrice` (optional) - Minimum price per day
- `maxPrice` (optional) - Maximum price per day
- `location` (optional) - Filter by location
- `availableFrom` (optional) - Start date (ISO 8601)
- `availableTo` (optional) - End date (ISO 8601)
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page

**Example:**
```
GET /search/items?keyword=drill&category=TOOLS&minPrice=10&maxPrice=50&location=New York&page=1&limit=10
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

## 5. BOOKING MODULE

### Create Booking
**POST** `/bookings`

**Body:**
```json
{
  "itemId": "uuid",
  "startDate": "2024-02-01T00:00:00.000Z",
  "endDate": "2024-02-07T00:00:00.000Z"
}
```

**Validation:**
- Start date must be before end date
- Start date cannot be in the past
- Item must be available
- No overlapping bookings allowed

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "uuid",
    "itemId": "uuid",
    "renterId": "uuid",
    "ownerId": "uuid",
    "startDate": "2024-02-01T00:00:00.000Z",
    "endDate": "2024-02-07T00:00:00.000Z",
    "totalPrice": "150.00",
    "status": "PENDING",
    "item": {
      "name": "Power Drill",
      "pricePerDay": "25.00"
    }
  }
}
```

### Get Booking Details
**GET** `/bookings/:id`

### Get User Bookings
**GET** `/bookings/my-bookings?page=1&limit=10`

### Update Booking Status
**PUT** `/bookings/:id/status`

**Body:**
```json
{
  "status": "CONFIRMED"
}
```

**Valid Status Transitions:**
- `PENDING` → `CONFIRMED` or `CANCELLED`
- `CONFIRMED` → `COMPLETED` or `CANCELLED`

**Statuses:** `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`

---

## 6. PAYMENT MODULE

### Process Payment
**POST** `/payments/process`

**Body:**
```json
{
  "bookingId": "uuid",
  "paymentMethod": "mock_card"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "id": "uuid",
    "bookingId": "uuid",
    "payerId": "uuid",
    "amount": "150.00",
    "paymentMethod": "mock_card",
    "status": "COMPLETED",
    "transactionId": "TXN-1704067200000-ABC123DEF456",
    "receiptUrl": "/api/payments/receipt/TXN-1704067200000-ABC123DEF456"
  }
}
```

### Get Payment Receipt
**GET** `/payments/receipt/:transactionId`

### Get User Payments
**GET** `/payments/my-payments?page=1&limit=10`

---

## 7. REVIEW MODULE

### Create Review
**POST** `/reviews`

**Requirements:** User must have a completed booking for the item

**Body:**
```json
{
  "itemId": "uuid",
  "rating": 5,
  "comment": "Excellent item, highly recommended!"
}
```

**Rating:** 1-5

**Response:** `201 Created`

### Get Item Reviews
**GET** `/reviews/item/:itemId?page=1&limit=10`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Reviews retrieved successfully",
  "data": [...],
  "averageRating": 4.5,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 20,
    "totalPages": 2
  }
}
```

### Update Review
**PUT** `/reviews/:id`

### Delete Review
**DELETE** `/reviews/:id`

---

## 8. DASHBOARD MODULE

### Owner Dashboard
**GET** `/dashboard/owner`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Owner dashboard retrieved successfully",
  "data": {
    "totalItems": 15,
    "recentBookings": [...],
    "totalEarnings": "2500.00",
    "bookingsByStatus": {
      "PENDING": 3,
      "CONFIRMED": 5,
      "COMPLETED": 20,
      "CANCELLED": 2
    }
  }
}
```

### Renter Dashboard
**GET** `/dashboard/renter`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Renter dashboard retrieved successfully",
  "data": {
    "activeBookings": [...],
    "completedBookings": [...],
    "totalSpent": "750.00"
  }
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "message": "Error message here",
  "errors": [] // Optional validation errors
}
```

### Common Status Codes
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., double booking)
- `422` - Unprocessable Entity
- `500` - Internal Server Error

### Validation Error Example
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

---

## Rate Limiting

- **Window:** 15 minutes (900,000 ms)
- **Max Requests:** 100 requests per window
- **Headers:** Rate limit info included in response headers

---

## Health Check

**GET** `/health`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "RentEase API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```
