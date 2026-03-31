# Database Anti-Patterns

## ❌ N+1 Queries
```typescript
// Bad: 1 query + N queries
const posts = await prisma.post.findMany()
for (const post of posts) {
  const author = await prisma.user.findUnique({
    where: { id: post.authorId }
  })  // N queries!
}

// Good: Include relations
const posts = await prisma.post.findMany({
  include: { author: true }
})  // 1-2 queries total
```

## ❌ No Indexes on Foreign Keys
```sql
-- Bad: Foreign key without index
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id)
);
-- JOINs will be slow!

-- Good: Always index foreign keys
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id)
);
CREATE INDEX idx_posts_user_id ON posts(user_id);
```

## ❌ Storing JSON When Relations Work
```sql
-- Bad: JSON blob for structured data
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  items JSONB  -- Hard to query, no referential integrity
);

-- Good: Proper relations
CREATE TABLE orders (
  id UUID PRIMARY KEY
);
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  quantity INT
);
```

## ❌ No Pagination
```typescript
// Bad: Fetch everything
const allUsers = await prisma.user.findMany()
// Memory explosion with millions of rows!

// Good: Always paginate
const users = await prisma.user.findMany({
  take: 20,
  skip: page * 20,
  cursor: { id: lastId }  // Or use cursor pagination
})
```

## ❌ Hardcoded Connection Strings
```typescript
// Bad
const db = new Database('postgres://user:password@localhost/mydb')

// Good: Environment variables
const db = new Database(process.env.DATABASE_URL)
```

## ❌ Raw SQL Without Parameterization
```typescript
// Bad: SQL injection vulnerability!
const user = await db.query(
  `SELECT * FROM users WHERE email = '${email}'`
)

// Good: Parameterized queries
const user = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
)

// Prisma (automatically parameterized)
const user = await prisma.user.findUnique({
  where: { email }
})
```

## ❌ No Transaction for Related Operations
```typescript
// Bad: Partial failure possible
await prisma.user.update({ ... })
await prisma.account.create({ ... })  // What if this fails?

// Good: Transaction
await prisma.$transaction([
  prisma.user.update({ ... }),
  prisma.account.create({ ... })
])
```

## ❌ Massive Tables Without Partitioning
```sql
-- Bad: Billions of rows in one table
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ,
  data JSONB
);

-- Good: Partition by time
CREATE TABLE events (
  id BIGSERIAL,
  created_at TIMESTAMPTZ,
  data JSONB
) PARTITION BY RANGE (created_at);

CREATE TABLE events_2024_01 PARTITION OF events
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

## ❌ VARCHAR Without Limits
```sql
-- Bad: No size constraints
CREATE TABLE users (
  email VARCHAR,  -- Could be 1GB!
  bio TEXT
);

-- Good: Reasonable limits
CREATE TABLE users (
  email VARCHAR(255) NOT NULL,
  bio TEXT CHECK (length(bio) <= 10000)
);
```

## ❌ Not Using Enums/Check Constraints
```sql
-- Bad: Any string allowed
CREATE TABLE orders (
  status VARCHAR(20)
);

-- Good: Constrain values
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'delivered');
CREATE TABLE orders (
  status order_status NOT NULL DEFAULT 'pending'
);

-- Or with check constraint
CREATE TABLE orders (
  status VARCHAR(20) CHECK (status IN ('pending', 'paid', 'shipped', 'delivered'))
);
```
