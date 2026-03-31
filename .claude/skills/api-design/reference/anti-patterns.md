# API Design Anti-Patterns

## ❌ Verbs in URLs
```
# Bad
GET  /api/getUsers
POST /api/createUser
POST /api/deleteUser/123

# Good
GET    /api/users
POST   /api/users
DELETE /api/users/123
```

## ❌ Inconsistent Naming
```
# Bad: Mixed conventions
/api/users          # plural
/api/product        # singular
/api/order-items    # kebab-case
/api/userProfiles   # camelCase

# Good: Consistent plural, kebab-case
/api/users
/api/products
/api/order-items
/api/user-profiles
```

## ❌ Exposing Internal IDs
```json
// Bad: Database IDs
{ "id": 12345, "userId": 67890 }

// Good: Use UUIDs or public identifiers
{ "id": "usr_abc123", "userId": "usr_xyz789" }
```

## ❌ Flat Error Messages
```json
// Bad
{ "error": "Something went wrong" }
{ "message": "Invalid request" }

// Good
{
  "error": {
    "code": "INVALID_EMAIL",
    "message": "Email address is not valid",
    "field": "email",
    "docs": "https://api.example.com/errors#INVALID_EMAIL"
  }
}
```

## ❌ Ignoring HTTP Methods
```
# Bad: POST for everything
POST /api/users/get
POST /api/users/delete
POST /api/users/update

# Good: Use proper HTTP methods
GET    /api/users
DELETE /api/users/123
PATCH  /api/users/123
```

## ❌ No Pagination
```json
// Bad: Return ALL items
GET /api/products
{ "products": [...thousands of items...] }

// Good: Paginate by default
GET /api/products?page=1&limit=20
{
  "data": [...20 items...],
  "pagination": { "total": 5000, "hasMore": true }
}
```

## ❌ Breaking Changes Without Versioning
```typescript
// Bad: Change response shape without warning
// v1: { "name": "John" }
// Later: { "fullName": "John Doe" }  // Breaks clients!

// Good: Version your API
// v1: { "name": "John" }
// v2: { "fullName": "John Doe", "name": "John" }  // Backward compatible
```

## ❌ Sensitive Data in URLs
```
# Bad: Tokens in URL (logged everywhere)
GET /api/users?token=secret123
GET /api/verify-email/user@email.com

# Good: Use headers/body
GET /api/users
Authorization: Bearer secret123

POST /api/verify-email
{ "email": "user@email.com" }
```

## ❌ Over-fetching / Under-fetching
```
# Bad: Always return everything
GET /api/users/123
{ "id": "123", "name": "John", "email": "...", 
  "address": {...}, "preferences": {...}, 
  "orderHistory": [...1000 orders...] }

# Good: Return essentials, allow expansion
GET /api/users/123
{ "id": "123", "name": "John", "email": "..." }

GET /api/users/123?include=address,preferences
{ "id": "123", "name": "John", "address": {...}, "preferences": {...} }
```

## ❌ No Request IDs
```
# Bad: Can't trace requests
500 Internal Server Error

# Good: Include request ID
{
  "error": { "message": "Something went wrong" },
  "meta": { "requestId": "req_abc123" }
}
# Now support can look up req_abc123 in logs
```

## ❌ Chatty APIs
```
# Bad: Multiple requests for one view
GET /api/user/123
GET /api/user/123/posts
GET /api/user/123/followers
GET /api/user/123/settings

# Good: Composite endpoint
GET /api/user/123/profile
{
  "user": {...},
  "recentPosts": [...],
  "followerCount": 100,
  "settings": {...}
}
```
