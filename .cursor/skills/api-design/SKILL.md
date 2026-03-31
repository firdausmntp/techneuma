---
name: api-design
description: Expert API design with RESTful patterns, versioning, error handling, and documentation
---

# API Design Specialist

You are an expert in designing and building APIs. Apply these principles when creating APIs.

## Core Philosophy

- **Consistency** — Same patterns everywhere, predictable behavior
- **Clarity** — Self-documenting, obvious purpose
- **Flexibility** — Supports various clients, extensible
- **Resilience** — Graceful degradation, clear errors

## RESTful Design

### Resource Naming
```
# Nouns, not verbs (resources, not actions)
GET /users              ✅ Get all users
GET /users/123          ✅ Get user 123
POST /users             ✅ Create user
PUT /users/123          ✅ Replace user 123
PATCH /users/123        ✅ Update user 123
DELETE /users/123       ✅ Delete user 123

# Nested resources for relationships
GET /users/123/orders           ✅ User's orders
GET /users/123/orders/456       ✅ Specific order
POST /users/123/orders          ✅ Create order for user

# Avoid
GET /getUsers           ❌ Verb in URL
POST /createUser        ❌ Verb in URL
GET /user/list          ❌ Redundant
```

### Query Parameters
```
# Filtering
GET /products?category=electronics&price_min=100&price_max=500

# Sorting
GET /products?sort=price&order=asc
GET /products?sort=-created_at    # Minus for descending

# Pagination
GET /products?page=2&per_page=20
GET /products?cursor=abc123&limit=20  # Cursor-based

# Sparse fieldsets
GET /users/123?fields=id,name,email

# Including relations
GET /orders/123?include=user,products
```

### HTTP Methods & Status Codes
```
GET    → 200 OK (with data) or 404 Not Found
POST   → 201 Created (with Location header) or 400 Bad Request
PUT    → 200 OK or 204 No Content
PATCH  → 200 OK (with updated resource)
DELETE → 204 No Content or 404 Not Found

# Error responses
400 Bad Request     → Invalid input
401 Unauthorized    → No/invalid authentication
403 Forbidden       → Authenticated but not authorized
404 Not Found       → Resource doesn't exist
409 Conflict        → State conflict (e.g., duplicate)
422 Unprocessable   → Validation failed
429 Too Many Req.   → Rate limited
500 Internal Error  → Server error
503 Unavailable     → Service temporarily down
```

## Request/Response Design

### Consistent Response Structure
```json
// Success response
{
  "data": {
    "id": "123",
    "type": "user",
    "attributes": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "meta": {
    "request_id": "req_abc123"
  }
}

// Collection response
{
  "data": [
    { "id": "1", "name": "Product A" },
    { "id": "2", "name": "Product B" }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "per_page": 20,
    "total_pages": 5
  },
  "links": {
    "self": "/products?page=1",
    "next": "/products?page=2",
    "last": "/products?page=5"
  }
}

// Error response
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "code": "invalid_format",
        "message": "Must be a valid email address"
      }
    ]
  },
  "meta": {
    "request_id": "req_abc123"
  }
}
```

### Request Validation
```typescript
// Validate early, fail fast
import { z } from 'zod'

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  role: z.enum(['user', 'admin']).default('user'),
  metadata: z.record(z.string()).optional(),
})

app.post('/users', async (req, res) => {
  const result = CreateUserSchema.safeParse(req.body)
  
  if (!result.success) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: result.error.errors.map(e => ({
          field: e.path.join('.'),
          code: e.code,
          message: e.message,
        })),
      },
    })
  }
  
  const user = await createUser(result.data)
  res.status(201).json({ data: user })
})
```

## Versioning

### URL Versioning (Recommended)
```
GET /v1/users
GET /v2/users

# Version in path - most explicit
# Easy to route, cache, deprecate
```

### Header Versioning
```
GET /users
Accept: application/vnd.myapi.v1+json

# Keeps URLs clean
# More complex to implement
```

### Evolution Strategy
```typescript
// 1. Add fields freely (non-breaking)
// v1 response
{ "name": "John" }

// v1 response (evolved)
{ "name": "John", "avatar_url": "..." }  // New field added

// 2. Never remove or rename (breaking change)
// ❌ Don't do this in same version
{ "full_name": "John" }  // Renamed from 'name'

// 3. Use new version for breaking changes
// v2 response
{ "full_name": "John", "display_name": "John D." }
```

## Authentication & Authorization

### Token-Based Auth
```typescript
// JWT in Authorization header
// Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

app.use('/api', (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    })
  }
  
  try {
    req.user = verifyToken(token)
    next()
  } catch {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token is invalid or expired',
      },
    })
  }
})
```

### Scoped Permissions
```typescript
// Check specific permissions
function requirePermission(permission: string) {
  return (req, res, next) => {
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `Missing permission: ${permission}`,
        },
      })
    }
    next()
  }
}

app.delete('/users/:id', 
  requirePermission('users:delete'),
  deleteUserHandler
)
```

## Rate Limiting

```typescript
// Rate limit headers
res.set({
  'X-RateLimit-Limit': '1000',
  'X-RateLimit-Remaining': '999',
  'X-RateLimit-Reset': '1640000000',
})

// 429 response
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests",
    "retry_after": 60
  }
}
```

## Pagination

### Offset Pagination
```typescript
// Simple but has issues with large datasets
GET /posts?page=5&per_page=20

{
  "data": [...],
  "meta": {
    "total": 1000,
    "page": 5,
    "per_page": 20,
    "total_pages": 50
  }
}
```

### Cursor Pagination (Preferred)
```typescript
// Better for large, frequently updated datasets
GET /posts?cursor=eyJpZCI6MTAwfQ&limit=20

{
  "data": [...],
  "meta": {
    "has_more": true,
    "next_cursor": "eyJpZCI6MTIwfQ"
  }
}

// Cursor encodes position (e.g., base64 of { "id": 100 })
// More stable when data changes
```

## Error Handling

### Structured Errors
```typescript
class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any[]
  ) {
    super(message)
  }
}

// Usage
throw new APIError(404, 'NOT_FOUND', 'User not found')
throw new APIError(422, 'VALIDATION_ERROR', 'Invalid input', [
  { field: 'email', message: 'Required' },
])

// Global error handler
app.use((err, req, res, next) => {
  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
      meta: { request_id: req.id },
    })
  }
  
  // Log unexpected errors
  console.error(err)
  
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
    meta: { request_id: req.id },
  })
})
```

## Documentation (OpenAPI)

```yaml
openapi: 3.0.3
info:
  title: My API
  version: 1.0.0
  
paths:
  /users:
    get:
      summary: List users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserList'
    
    post:
      summary: Create user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUser'
      responses:
        '201':
          description: Created
        '422':
          description: Validation error
          
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        email:
          type: string
          format: email
        name:
          type: string
```

## Anti-Patterns to Avoid

### ❌ Verbs in URLs
```
POST /createUser     ❌
GET /getUserById     ❌
POST /deleteUser     ❌

POST /users          ✅
GET /users/:id       ✅
DELETE /users/:id    ✅
```

### ❌ Inconsistent Naming
```
GET /users           ❌ plural
GET /product         ❌ singular
GET /order-items     ❌ kebab-case

GET /users           ✅
GET /products        ✅
GET /order_items     ✅ or /orderItems
```

### ❌ Exposing Internal IDs
```json
// Bad: Auto-increment IDs reveal info
{ "id": 1234567 }

// Good: UUIDs or opaque IDs
{ "id": "usr_a1b2c3d4" }
```

### ❌ Returning Bare Arrays
```json
// Bad: Can't add metadata later
[{ "id": 1 }, { "id": 2 }]

// Good: Wrapped with envelope
{
  "data": [{ "id": 1 }, { "id": 2 }],
  "meta": {}
}
```