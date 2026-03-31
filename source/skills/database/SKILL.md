---
name: database
description: Expert database design with schema patterns, queries, indexing, and migrations
---

# Database Design Specialist

You are an expert in database design and optimization. Apply these principles when working with databases.

## Core Philosophy

- **Normalize first, denormalize for performance** — Start clean, optimize later
- **Data integrity** — Constraints enforce business rules
- **Query patterns drive design** — Design for how you read, not just write
- **Plan for scale** — Index wisely, partition early

## Schema Design

### Naming Conventions
```sql
-- Tables: plural, snake_case
CREATE TABLE users (...)
CREATE TABLE order_items (...)
CREATE TABLE user_preferences (...)

-- Columns: singular, snake_case
CREATE TABLE users (
  id           BIGINT PRIMARY KEY,
  email        VARCHAR(255) NOT NULL,
  first_name   VARCHAR(100),
  last_name    VARCHAR(100),
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- Foreign keys: singular_table_id
CREATE TABLE orders (
  id         BIGINT PRIMARY KEY,
  user_id    BIGINT REFERENCES users(id),  -- FK naming
  status     VARCHAR(50)
);

-- Junction tables: alphabetical
CREATE TABLE product_tags (...)  -- not tags_products
CREATE TABLE order_products (...)
```

### Primary Keys
```sql
-- Auto-increment (simple, but reveals info)
id BIGSERIAL PRIMARY KEY

-- UUID (distributed-friendly, no info leak)
id UUID PRIMARY KEY DEFAULT gen_random_uuid()

-- Prefixed IDs (type-safe, debuggable)
-- Store as VARCHAR, generate in app: usr_abc123, ord_xyz789
id VARCHAR(30) PRIMARY KEY

-- Composite keys (for junction tables)
CREATE TABLE user_roles (
  user_id BIGINT REFERENCES users(id),
  role_id BIGINT REFERENCES roles(id),
  PRIMARY KEY (user_id, role_id)
);
```

### Constraints
```sql
CREATE TABLE products (
  id          BIGINT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  sku         VARCHAR(50) UNIQUE NOT NULL,
  price       DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  quantity    INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  status      VARCHAR(20) DEFAULT 'draft' 
              CHECK (status IN ('draft', 'active', 'archived')),
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Named constraints for better error messages
ALTER TABLE orders
ADD CONSTRAINT orders_total_positive CHECK (total >= 0);
```

### Relationships

```sql
-- One-to-Many: FK on the "many" side
CREATE TABLE posts (
  id BIGINT PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL
);

-- Many-to-Many: Junction table
CREATE TABLE post_tags (
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  BIGINT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- One-to-One: Unique FK or same PK
CREATE TABLE user_profiles (
  user_id   BIGINT PRIMARY KEY REFERENCES users(id),
  bio       TEXT,
  avatar_url VARCHAR(500)
);

-- Self-referencing (hierarchy)
CREATE TABLE categories (
  id        BIGINT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  parent_id BIGINT REFERENCES categories(id)
);
```

## Indexing

### When to Index
```sql
-- Index foreign keys (almost always)
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- Index frequently queried columns
CREATE INDEX idx_users_email ON users(email);

-- Index columns used in WHERE, ORDER BY, JOIN
CREATE INDEX idx_products_category_status ON products(category_id, status);

-- Partial indexes for specific queries
CREATE INDEX idx_orders_pending ON orders(created_at)
  WHERE status = 'pending';

-- Expression indexes
CREATE INDEX idx_users_email_lower ON users(LOWER(email));
```

### Composite Indexes
```sql
-- Order matters! Most selective first, or match query order
-- For: WHERE category_id = ? AND status = ? ORDER BY created_at
CREATE INDEX idx_products_cat_status_created 
  ON products(category_id, status, created_at);

-- This index supports:
-- - WHERE category_id = ?
-- - WHERE category_id = ? AND status = ?
-- - WHERE category_id = ? AND status = ? ORDER BY created_at

-- But NOT:
-- - WHERE status = ?  (first column not used)
-- - ORDER BY created_at (need category_id filter)
```

### Index Types
```sql
-- B-tree (default, most common)
CREATE INDEX idx_users_email ON users(email);

-- Hash (equality only, fast)
CREATE INDEX idx_users_id_hash ON users USING hash(id);

-- GIN (arrays, JSONB, full-text)
CREATE INDEX idx_products_tags ON products USING gin(tags);
CREATE INDEX idx_posts_search ON posts USING gin(to_tsvector('english', title || ' ' || body));

-- GiST (geometric, ranges)
CREATE INDEX idx_events_period ON events USING gist(tsrange(start_at, end_at));
```

## Query Optimization

### Use EXPLAIN
```sql
EXPLAIN ANALYZE 
SELECT * FROM orders 
WHERE user_id = 123 AND status = 'pending';

-- Look for:
-- - Seq Scan (full table scan - usually bad)
-- - Index Scan (good)
-- - actual time (execution time)
-- - rows (returned vs. estimated)
```

### Efficient Queries
```sql
-- ✅ Select only needed columns
SELECT id, name, email FROM users WHERE id = 123;

-- ❌ Select all (avoid unless necessary)
SELECT * FROM users WHERE id = 123;

-- ✅ Use LIMIT with pagination
SELECT * FROM products ORDER BY created_at DESC LIMIT 20 OFFSET 40;

-- ✅ Cursor-based pagination (better for large datasets)
SELECT * FROM products 
WHERE created_at < '2024-01-01' 
ORDER BY created_at DESC 
LIMIT 20;

-- ✅ Batch inserts
INSERT INTO logs (message, level) VALUES
  ('msg1', 'info'),
  ('msg2', 'warn'),
  ('msg3', 'error');

-- ✅ Use EXISTS instead of COUNT for existence checks
SELECT EXISTS(SELECT 1 FROM users WHERE email = 'test@example.com');
-- vs
SELECT COUNT(*) > 0 FROM users WHERE email = 'test@example.com';  -- slower
```

### N+1 Query Prevention
```sql
-- ❌ N+1 problem (1 query + N queries)
-- App code:
-- users = SELECT * FROM users
-- for each user:
--   posts = SELECT * FROM posts WHERE user_id = user.id

-- ✅ JOIN (single query)
SELECT u.*, p.* 
FROM users u 
LEFT JOIN posts p ON p.user_id = u.id
WHERE u.id IN (1, 2, 3);

-- ✅ Or batch with IN
SELECT * FROM posts WHERE user_id IN (1, 2, 3);
```

## Migrations

### Safe Migration Practices
```sql
-- ✅ Add column (safe)
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- ✅ Add nullable column with default
ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active';

-- ⚠️ Adding NOT NULL requires backfill first
-- Step 1: Add nullable
ALTER TABLE users ADD COLUMN verified_at TIMESTAMP;
-- Step 2: Backfill
UPDATE users SET verified_at = created_at WHERE verified_at IS NULL;
-- Step 3: Add constraint
ALTER TABLE users ALTER COLUMN verified_at SET NOT NULL;

-- ✅ Create index concurrently (doesn't lock)
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- ❌ Dangerous: Renaming column (breaks app)
ALTER TABLE users RENAME COLUMN name TO full_name;  -- Deploy app first!
```

### Migration File Structure
```sql
-- migrations/20240115_001_add_user_phone.sql

-- Up
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
CREATE INDEX idx_users_phone ON users(phone);

-- Down
DROP INDEX idx_users_phone;
ALTER TABLE users DROP COLUMN phone;
```

## Data Types

### Choosing Types
```sql
-- IDs
BIGINT                -- Auto-increment, 8 bytes
UUID                  -- 16 bytes, distributed-friendly
VARCHAR(30)           -- Prefixed IDs (usr_abc123)

-- Text
VARCHAR(n)            -- Known max length
TEXT                  -- Unlimited (use for content)
CHAR(n)               -- Fixed length (country codes)

-- Numbers
INTEGER               -- -2B to 2B
BIGINT                -- Large numbers
DECIMAL(p,s)          -- Exact (money: DECIMAL(10,2))
NUMERIC               -- Alias for DECIMAL

-- Dates/Times
TIMESTAMP             -- Date + time
TIMESTAMPTZ           -- With timezone (preferred!)
DATE                  -- Date only
TIME                  -- Time only
INTERVAL              -- Duration

-- Boolean
BOOLEAN               -- true/false/null

-- JSON
JSONB                 -- Binary JSON (indexable, preferred)
JSON                  -- Text JSON (preserves order)

-- Arrays
INTEGER[]             -- Array of integers
TEXT[]                -- Array of text
```

## Common Patterns

### Soft Deletes
```sql
CREATE TABLE posts (
  id BIGINT PRIMARY KEY,
  title TEXT NOT NULL,
  deleted_at TIMESTAMP,  -- NULL = not deleted
  -- ...
);

-- Query active posts
SELECT * FROM posts WHERE deleted_at IS NULL;

-- Index for active records
CREATE INDEX idx_posts_active ON posts(id) WHERE deleted_at IS NULL;
```

### Audit Trail
```sql
CREATE TABLE audit_logs (
  id          BIGSERIAL PRIMARY KEY,
  table_name  VARCHAR(50) NOT NULL,
  record_id   BIGINT NOT NULL,
  action      VARCHAR(20) NOT NULL,  -- INSERT, UPDATE, DELETE
  old_data    JSONB,
  new_data    JSONB,
  user_id     BIGINT,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
```

### Optimistic Locking
```sql
CREATE TABLE documents (
  id          BIGINT PRIMARY KEY,
  content     TEXT,
  version     INTEGER NOT NULL DEFAULT 1,
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- Update with version check
UPDATE documents 
SET content = 'new content', version = version + 1, updated_at = NOW()
WHERE id = 123 AND version = 5;  -- Expected version

-- If 0 rows affected → conflict!
```

### Full-Text Search
```sql
-- Add search vector column
ALTER TABLE posts ADD COLUMN search_vector tsvector;

-- Populate it
UPDATE posts SET search_vector = 
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''));

-- Index it
CREATE INDEX idx_posts_search ON posts USING gin(search_vector);

-- Search
SELECT * FROM posts 
WHERE search_vector @@ to_tsquery('english', 'database & design');
```

## Anti-Patterns

### ❌ No Foreign Keys
```sql
-- Bad: No referential integrity
CREATE TABLE orders (
  user_id BIGINT  -- What if user is deleted?
);

-- Good: Enforce relationships
CREATE TABLE orders (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);
```

### ❌ Storing Calculated Values
```sql
-- Bad: Redundant, can get out of sync
CREATE TABLE orders (
  subtotal DECIMAL(10,2),
  tax DECIMAL(10,2),
  total DECIMAL(10,2)  -- = subtotal + tax
);

-- Good: Calculate when needed, or use generated column
CREATE TABLE orders (
  subtotal DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,4) NOT NULL,
  total DECIMAL(10,2) GENERATED ALWAYS AS (subtotal * (1 + tax_rate)) STORED
);
```

### ❌ EAV (Entity-Attribute-Value)
```sql
-- Bad: Impossible to query efficiently
CREATE TABLE user_attributes (
  user_id BIGINT,
  attribute_name VARCHAR(50),
  attribute_value TEXT
);

-- Good: Proper columns or JSONB
CREATE TABLE users (
  id BIGINT PRIMARY KEY,
  metadata JSONB DEFAULT '{}'
);
```
