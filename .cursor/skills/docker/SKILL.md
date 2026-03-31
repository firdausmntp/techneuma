---
name: docker
description: Expert Docker and containerization patterns for development and production deployments
---

# Docker Specialist

You are an expert in Docker and containerization. Apply these principles for efficient, secure containers.

## Core Philosophy

- **Immutable infrastructure** — Build once, run anywhere
- **Layer optimization** — Minimize image size and build time
- **Security by default** — Non-root users, minimal base images
- **12-factor app** — Environment-based configuration

## Dockerfile Best Practices

### Multi-Stage Build (Node.js)
```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app

# Security: Non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only necessary files
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
```

### Python Application
```dockerfile
# Use specific version, not latest
FROM python:3.12-slim AS base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install dependencies first (cache layer)
FROM base AS deps
COPY requirements.txt .
RUN pip install -r requirements.txt

# Development stage
FROM deps AS development
COPY requirements-dev.txt .
RUN pip install -r requirements-dev.txt
COPY . .
CMD ["python", "-m", "pytest"]

# Production stage
FROM base AS production
COPY --from=deps /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin

# Security: Non-root user
RUN useradd --create-home --shell /bin/bash app
USER app

COPY --chown=app:app . .

EXPOSE 8000

CMD ["gunicorn", "app:app", "-b", "0.0.0.0:8000"]
```

### Go Application
```dockerfile
# Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build static binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/server ./cmd/server

# Production stage - scratch for minimal image
FROM scratch

# Import CA certificates for HTTPS
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Copy binary
COPY --from=builder /app/server /server

EXPOSE 8080

ENTRYPOINT ["/server"]
```

## Docker Compose

### Development Setup
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    volumes:
      - .:/app
      - /app/node_modules  # Exclude node_modules
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgres://user:pass@db:5432/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    command: npm run dev

  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: myapp
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d myapp"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI

volumes:
  postgres_data:
  redis_data:
```

### Production Setup
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    image: myregistry/myapp:${VERSION:-latest}
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - app
```

## Layer Optimization

### Order Instructions by Change Frequency
```dockerfile
# ❌ Bad: Any code change invalidates npm install cache
COPY . .
RUN npm install

# ✅ Good: Dependencies cached unless package.json changes
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
```

### Combine RUN Commands
```dockerfile
# ❌ Bad: Multiple layers
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get clean
RUN rm -rf /var/lib/apt/lists/*

# ✅ Good: Single layer, cleanup in same command
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

### Use .dockerignore
```
# .dockerignore
node_modules
npm-debug.log
.git
.gitignore
.env
.env.*
Dockerfile*
docker-compose*
README.md
.vscode
coverage
.nyc_output
*.test.js
*.spec.js
__tests__
```

## Health Checks

```dockerfile
# In Dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

```javascript
// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    checks: {}
  }
  
  // Database check
  try {
    await db.$queryRaw`SELECT 1`
    health.checks.database = 'ok'
  } catch (e) {
    health.checks.database = 'error'
    health.status = 'degraded'
  }
  
  // Redis check
  try {
    await redis.ping()
    health.checks.redis = 'ok'
  } catch (e) {
    health.checks.redis = 'error'
    health.status = 'degraded'
  }
  
  const statusCode = health.status === 'ok' ? 200 : 503
  res.status(statusCode).json(health)
})
```

## Security

### Non-Root User
```dockerfile
# Create user and group
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup appuser

# Set ownership
COPY --chown=appuser:appgroup . .

# Switch to non-root user
USER appuser
```

### Read-Only Filesystem
```yaml
# docker-compose.yml
services:
  app:
    read_only: true
    tmpfs:
      - /tmp
      - /var/run
```

### Security Scanning
```bash
# Scan image for vulnerabilities
docker scout cves myimage:latest

# Or use Trivy
trivy image myimage:latest
```

### Secrets Management
```yaml
# docker-compose.yml
services:
  app:
    secrets:
      - db_password
      - api_key

secrets:
  db_password:
    file: ./secrets/db_password.txt
  api_key:
    external: true  # From Docker Swarm secrets
```

```javascript
// Read secret in app
import { readFileSync } from 'fs'

const dbPassword = readFileSync('/run/secrets/db_password', 'utf8').trim()
```

## Networking

```yaml
version: '3.8'

services:
  frontend:
    networks:
      - frontend

  api:
    networks:
      - frontend
      - backend

  db:
    networks:
      - backend

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # No external access
```

## Volumes & Data Persistence

```yaml
services:
  db:
    volumes:
      # Named volume (managed by Docker)
      - postgres_data:/var/lib/postgresql/data
      
      # Bind mount (host path)
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
      
      # Anonymous volume (for build artifacts)
      - /app/node_modules

volumes:
  postgres_data:
    driver: local
```

## Environment Variables

```dockerfile
# Build-time variables
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine

# Runtime variables
ENV NODE_ENV=production \
    PORT=3000

# Don't hardcode secrets!
# ❌ Bad
ENV API_KEY=secret123

# ✅ Good - pass at runtime
# docker run -e API_KEY=$API_KEY myapp
```

## Debugging

```bash
# View logs
docker logs -f container_name

# Execute command in running container
docker exec -it container_name /bin/sh

# Inspect container
docker inspect container_name

# View resource usage
docker stats

# Build with progress output
docker build --progress=plain -t myapp .

# Debug failed build
docker build --target=builder -t debug .
docker run -it debug /bin/sh
```

## CI/CD Integration

```yaml
# .github/workflows/docker.yml
name: Docker Build

on:
  push:
    branches: [main]
    tags: ['v*']

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=sha
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

## Anti-Patterns

### ❌ Using latest Tag
```dockerfile
# Bad
FROM node:latest

# Good
FROM node:20.11-alpine
```

### ❌ Running as Root
```dockerfile
# Bad: Runs as root by default
CMD ["node", "app.js"]

# Good
USER node
CMD ["node", "app.js"]
```

### ❌ Storing Secrets in Image
```dockerfile
# Bad
ENV DATABASE_PASSWORD=supersecret

# Good: Pass at runtime
# docker run -e DATABASE_PASSWORD=$DB_PASS myapp
```

### ❌ Large Images
```dockerfile
# Bad: Full OS, 900MB+
FROM ubuntu:22.04

# Good: Alpine, ~50MB
FROM node:20-alpine

# Best for Go: Scratch, ~10MB
FROM scratch
```

### ❌ Not Using .dockerignore
```bash
# Without .dockerignore: sends node_modules to build context
# Build time: 2 minutes

# With .dockerignore excluding node_modules
# Build time: 5 seconds
```