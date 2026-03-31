# Database Examples - Good Patterns

## ✅ Good: Schema Design
```sql
-- Use appropriate data types
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Soft deletes
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  deleted_at TIMESTAMPTZ NULL,  -- NULL = not deleted
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_posts_user_id ON posts(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

## ✅ Good: Query Optimization
```sql
-- Use EXPLAIN ANALYZE to understand queries
EXPLAIN ANALYZE
SELECT p.*, u.name as author_name
FROM posts p
JOIN users u ON p.user_id = u.id
WHERE p.deleted_at IS NULL
ORDER BY p.created_at DESC
LIMIT 20;

-- Avoid SELECT *
SELECT id, title, created_at FROM posts LIMIT 20;

-- Use covering indexes
CREATE INDEX idx_posts_covering ON posts(user_id, created_at) 
INCLUDE (title) WHERE deleted_at IS NULL;
```

## ✅ Good: Prisma Schema
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
}

model Post {
  id        String    @id @default(uuid())
  title     String
  content   String?
  published Boolean   @default(false)
  author    User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId  String
  tags      Tag[]
  createdAt DateTime  @default(now())
  deletedAt DateTime?

  @@index([authorId])
  @@index([createdAt(sort: Desc)])
}

model Tag {
  id    String @id @default(uuid())
  name  String @unique
  posts Post[]
}
```

## ✅ Good: Transactions
```typescript
// Prisma interactive transaction
await prisma.$transaction(async (tx) => {
  const user = await tx.user.update({
    where: { id: userId },
    data: { balance: { decrement: amount } }
  })
  
  if (user.balance < 0) {
    throw new Error('Insufficient balance')
  }
  
  await tx.transaction.create({
    data: { userId, amount, type: 'debit' }
  })
})

// Drizzle transaction
await db.transaction(async (tx) => {
  await tx.update(accounts)
    .set({ balance: sql`balance - ${amount}` })
    .where(eq(accounts.id, fromId))
  
  await tx.update(accounts)
    .set({ balance: sql`balance + ${amount}` })
    .where(eq(accounts.id, toId))
})
```

## ✅ Good: Connection Pooling
```typescript
// Prisma with connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=10&pool_timeout=30'
    }
  }
})

// For serverless, use Prisma Accelerate or PgBouncer
const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.PRISMA_ACCELERATE_URL }
  }
})
```

## ✅ Good: Migrations
```sql
-- migrations/001_create_users.sql
-- Up
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Down
DROP TABLE users;

---

-- migrations/002_add_user_name.sql
-- Up
ALTER TABLE users ADD COLUMN name VARCHAR(100);
UPDATE users SET name = split_part(email, '@', 1);
ALTER TABLE users ALTER COLUMN name SET NOT NULL;

-- Down
ALTER TABLE users DROP COLUMN name;
```

## ✅ Good: Batch Operations
```typescript
// Batch inserts
await prisma.user.createMany({
  data: users,
  skipDuplicates: true
})

// Batch updates with raw SQL
await prisma.$executeRaw`
  UPDATE products
  SET price = price * 1.1
  WHERE category = ${category}
`

// Bulk upsert
await prisma.user.upsert({
  where: { email: user.email },
  update: { name: user.name },
  create: user
})
```

## DON'T (Not Good)

### Bad Request Example

```text
Run /database and make it better.
```

Why this is not good:
- Too vague, no clear scope or success criteria.
- Missing constraints, so the result may break expectations.
- No validation steps, so quality cannot be trusted.

### Better Alternative

```text
Run /database on a specific area, list constraints, and include tests or verification checks.
```
