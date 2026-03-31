---
name: monorepo
description: Expert monorepo architecture with Turborepo, Nx, pnpm workspaces, and shared packages
---

# Monorepo Specialist

You are an expert in monorepo architecture. Apply these principles for scalable multi-package repositories.

## Core Philosophy

- **Single source of truth** — One repo for related projects
- **Shared dependencies** — Consistent versions across packages
- **Incremental builds** — Only rebuild what changed
- **Atomic changes** — Cross-package changes in single commit

## Workspace Setup

### pnpm Workspaces
```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'tools/*'
```

```json
// package.json (root)
{
  "name": "my-monorepo",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

### Directory Structure
```
my-monorepo/
├── apps/
│   ├── web/                 # Next.js app
│   │   ├── package.json
│   │   └── src/
│   ├── api/                 # Express API
│   │   ├── package.json
│   │   └── src/
│   └── mobile/              # React Native
│       ├── package.json
│       └── src/
├── packages/
│   ├── ui/                  # Shared React components
│   │   ├── package.json
│   │   └── src/
│   ├── config/              # Shared configs (ESLint, TS, etc.)
│   │   └── package.json
│   ├── utils/               # Shared utilities
│   │   ├── package.json
│   │   └── src/
│   └── types/               # Shared TypeScript types
│       ├── package.json
│       └── src/
├── tools/
│   └── scripts/             # Build/deploy scripts
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.json
```

## Turborepo Configuration

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"],
      "env": ["NODE_ENV"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "inputs": ["src/**/*.ts", "src/**/*.tsx", "test/**/*.ts"]
    },
    "lint": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "clean": {
      "cache": false
    }
  }
}
```

## Shared Packages

### UI Package
```json
// packages/ui/package.json
{
  "name": "@repo/ui",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./button": "./src/button.tsx",
    "./card": "./src/card.tsx"
  },
  "scripts": {
    "build": "tsc",
    "lint": "eslint src/",
    "test": "vitest"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@repo/config": "workspace:*",
    "@types/react": "^18.0.0",
    "react": "^18.0.0",
    "typescript": "^5.4.0"
  }
}
```

```typescript
// packages/ui/src/index.ts
export { Button } from './button'
export type { ButtonProps } from './button'
export { Card } from './card'
export { Input } from './input'
```

```typescript
// packages/ui/src/button.tsx
import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@repo/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'rounded font-medium transition-colors',
          {
            'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
            'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
            'hover:bg-gray-100': variant === 'ghost',
          },
          {
            'px-2 py-1 text-sm': size === 'sm',
            'px-4 py-2': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
```

### Shared Config Package
```json
// packages/config/package.json
{
  "name": "@repo/config",
  "version": "0.0.0",
  "private": true,
  "exports": {
    "./eslint": "./eslint.config.js",
    "./typescript": "./tsconfig.json",
    "./typescript/react": "./tsconfig.react.json",
    "./prettier": "./prettier.config.js"
  }
}
```

```javascript
// packages/config/eslint.config.js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      react,
      'react-hooks': reactHooks
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  }
]
```

```json
// packages/config/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

```json
// packages/config/tsconfig.react.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx"
  }
}
```

### Utils Package
```json
// packages/utils/package.json
{
  "name": "@repo/utils",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest"
  }
}
```

```typescript
// packages/utils/src/index.ts
export { cn } from './cn'
export { formatDate, formatCurrency } from './format'
export { debounce, throttle } from './timing'
export { deepMerge } from './object'
```

## App Configuration

### Next.js App
```json
// apps/web/package.json
{
  "name": "@repo/web",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@repo/ui": "workspace:*",
    "@repo/utils": "workspace:*",
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@repo/config": "workspace:*",
    "@types/react": "^18.0.0",
    "typescript": "^5.4.0"
  }
}
```

```typescript
// apps/web/src/app/page.tsx
import { Button, Card } from '@repo/ui'
import { formatDate } from '@repo/utils'

export default function Home() {
  return (
    <main>
      <Card>
        <h1>Welcome</h1>
        <p>Today is {formatDate(new Date())}</p>
        <Button variant="primary">Get Started</Button>
      </Card>
    </main>
  )
}
```

## Nx Alternative

```json
// nx.json
{
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["{projectRoot}/dist"]
    },
    "test": {
      "dependsOn": ["build"]
    }
  },
  "namedInputs": {
    "default": ["{projectRoot}/**/*"],
    "production": [
      "default",
      "!{projectRoot}/**/*.spec.ts",
      "!{projectRoot}/test/**/*"
    ]
  }
}
```

```bash
# Nx commands
nx build web                    # Build single project
nx run-many -t build            # Build all
nx affected -t test             # Test only affected
nx graph                        # Visualize dependencies
nx reset                        # Clear cache
```

## Versioning & Publishing

### Changesets
```bash
# Initialize changesets
pnpm add -Dw @changesets/cli
pnpm changeset init
```

```json
// .changeset/config.json
{
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@repo/web", "@repo/api"]
}
```

```bash
# Create changeset
pnpm changeset

# Version packages
pnpm changeset version

# Publish
pnpm changeset publish
```

## CI/CD

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Needed for affected detection
      
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build
        run: pnpm turbo build --filter=...[origin/main]
      
      - name: Test
        run: pnpm turbo test --filter=...[origin/main]
      
      - name: Lint
        run: pnpm turbo lint --filter=...[origin/main]
```

## Common Commands

```bash
# Add dependency to specific package
pnpm add lodash --filter @repo/utils

# Add dev dependency to root
pnpm add -Dw typescript

# Add workspace dependency
pnpm add @repo/utils --filter @repo/web

# Run command in specific package
pnpm --filter @repo/web dev

# Run command in all packages
pnpm -r build

# Clean all packages
pnpm -r exec rm -rf node_modules dist .next
```

## Anti-Patterns

### ❌ Circular Dependencies
```
# Bad: A depends on B, B depends on A
packages/a → packages/b → packages/a

# Good: Extract shared code to third package
packages/a → packages/shared
packages/b → packages/shared
```

### ❌ Version Mismatches
```json
// Bad: Different React versions
// packages/a/package.json
{ "dependencies": { "react": "^17.0.0" } }
// packages/b/package.json
{ "dependencies": { "react": "^18.0.0" } }

// Good: Single version in root, peer deps in packages
// package.json (root)
{ "dependencies": { "react": "^18.0.0" } }
```

### ❌ Not Using Workspace Protocol
```json
// Bad: Fixed version
{ "dependencies": { "@repo/utils": "1.0.0" } }

// Good: Workspace protocol
{ "dependencies": { "@repo/utils": "workspace:*" } }
```

### ❌ Building Everything on Every Change
```bash
# Bad
turbo build

# Good: Only build affected packages
turbo build --filter=...[origin/main]
```

### ❌ Too Many Packages
```
# Bad: Over-splitting
packages/
  button/
  input/
  card/
  modal/
  ...50 more component packages

# Good: Logical grouping
packages/
  ui/          # All UI components
  forms/       # Form-related utilities
  utils/       # General utilities
```
