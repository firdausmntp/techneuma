# API Design Examples - Good Patterns

## ✅ Good: RESTful Resource Naming
```
# Resources are nouns, plural
GET    /api/users           # List users
POST   /api/users           # Create user
GET    /api/users/123       # Get user
PATCH  /api/users/123       # Update user
DELETE /api/users/123       # Delete user

# Nested resources
GET    /api/users/123/posts        # User's posts
POST   /api/users/123/posts        # Create post for user
GET    /api/posts/456/comments     # Post's comments

# Filtering, pagination, sorting
GET    /api/users?status=active&role=admin
GET    /api/posts?page=2&limit=20
GET    /api/products?sort=price:desc
```

## ✅ Good: Consistent Response Format
```typescript
// Success response
{
  "data": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2024-01-15T12:00:00Z"
  }
}

// List response with pagination
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasMore": true
  },
  "meta": {
    "requestId": "req_abc123"
  }
}

// Error response
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Invalid email format" },
      { "field": "password", "message": "Must be at least 8 characters" }
    ]
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2024-01-15T12:00:00Z"
  }
}
```

## ✅ Good: Proper HTTP Status Codes
```typescript
// Success
200 OK           // Successful GET, PATCH
201 Created      // Successful POST (with Location header)
204 No Content   // Successful DELETE

// Client errors
400 Bad Request  // Invalid input
401 Unauthorized // Not authenticated
403 Forbidden    // Authenticated but not authorized
404 Not Found    // Resource doesn't exist
409 Conflict     // Resource conflict (duplicate email, etc.)
422 Unprocessable Entity // Validation errors
429 Too Many Requests    // Rate limited

// Server errors
500 Internal Server Error // Unexpected error
503 Service Unavailable   // Maintenance, overload
```

## ✅ Good: Versioning Strategy
```typescript
// URL versioning (most common)
/api/v1/users
/api/v2/users

// Header versioning
GET /api/users
Accept: application/vnd.myapi.v1+json

// Query parameter
/api/users?version=1
```

## ✅ Good: Rate Limiting Headers
```typescript
// Response headers
X-RateLimit-Limit: 100        // Max requests per window
X-RateLimit-Remaining: 95     // Requests left
X-RateLimit-Reset: 1705320000 // Unix timestamp of reset
Retry-After: 60               // Seconds to wait (when rate limited)
```

## ✅ Good: OpenAPI/Swagger Documentation
```yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0

paths:
  /users:
    get:
      summary: List all users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'
                  pagination:
                    $ref: '#/components/schemas/Pagination'

components:
  schemas:
    User:
      type: object
      required:
        - id
        - email
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        name:
          type: string
```

## ✅ Good: HATEOAS Links
```json
{
  "data": {
    "id": "123",
    "name": "John Doe"
  },
  "links": {
    "self": "/api/users/123",
    "posts": "/api/users/123/posts",
    "followers": "/api/users/123/followers"
  }
}
```

## ✅ Good: Idempotency Keys
```typescript
// Client sends idempotency key
POST /api/payments
Idempotency-Key: unique-request-id-123

{
  "amount": 100,
  "currency": "USD"
}

// Server stores result, returns same response for duplicate requests
```

## DON'T (Not Good)

### Bad Request Example

```text
Run /api-design and make it better.
```

Why this is not good:
- Too vague, no clear scope or success criteria.
- Missing constraints, so the result may break expectations.
- No validation steps, so quality cannot be trusted.

### Better Alternative

```text
Run /api-design on a specific area, list constraints, and include tests or verification checks.
```
