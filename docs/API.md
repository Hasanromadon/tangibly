# API Documentation

## Overview

This backend provides a complete authentication and user management API built with Next.js App Router, Prisma, and PostgreSQL.

## Base URL

```
http://localhost:3000/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication Routes

#### POST /api/auth/register

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt-token-here"
  }
}
```

#### POST /api/auth/login

Login with email and password.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    },
    "token": "jwt-token-here"
  }
}
```

#### POST /api/auth/logout

Logout and invalidate the current session.

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### GET /api/auth/me

Get current user information.

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### User Management Routes

#### GET /api/users

Get all users (Admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-id",
        "email": "user@example.com",
        "name": "John Doe",
        "role": "USER",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

#### GET /api/users/[id]

Get a specific user by ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "posts": [
        {
          "id": "post-id",
          "title": "Post Title",
          "published": true,
          "createdAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  }
}
```

#### PUT /api/users/[id]

Update a user (own profile or admin).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": {
      "id": "user-id",
      "email": "updated@example.com",
      "name": "Updated Name",
      "role": "USER"
    }
  }
}
```

#### DELETE /api/users/[id]

Delete a user (admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Post Management Routes

#### GET /api/posts

Get all published posts.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "post-id",
        "title": "Post Title",
        "content": "Post content...",
        "published": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "author": {
          "name": "Author Name",
          "email": "author@example.com"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

#### POST /api/posts

Create a new post (authenticated users).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "title": "New Post Title",
  "content": "Post content...",
  "published": true
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "post": {
      "id": "post-id",
      "title": "New Post Title",
      "content": "Post content...",
      "published": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "author": {
        "name": "Author Name"
      }
    }
  }
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate email, etc.)
- `500` - Internal Server Error

## Setup Instructions

1. **Database Setup:**

   ```bash
   # Copy environment variables
   cp .env.example .env.local

   # Edit .env.local with your database credentials
   # DATABASE_URL="postgresql://username:password@localhost:5432/tangibly_db"
   # JWT_SECRET="your-super-secret-key"
   ```

2. **Initialize Database:**

   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

## Default Users (After Seeding)

- **Admin:** admin@tangibly.com / admin123
- **User:** user@tangibly.com / user123

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control (USER, ADMIN)
- Request validation with Zod
- Protected routes middleware
- Session management
