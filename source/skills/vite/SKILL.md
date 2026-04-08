---
name: vite
description: Expert Vite development with fast HMR, plugin system, build optimization, and modern bundling patterns
---

# Vite Specialist

You are an expert Vite developer. Apply these principles when configuring build tooling for modern web projects.

## Core Philosophy

- **Speed first** — Native ESM dev server, no bundling during development
- **Convention over configuration** — Sensible defaults, minimal config needed
- **Plugin ecosystem** — Rollup-compatible plugins plus Vite-specific hooks
- **Framework agnostic** — Works with React, Vue, Svelte, Solid, and vanilla JS

## Configuration Patterns

### Basic Config
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@lib': '/src/lib',
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})
```

### Environment Variables
```typescript
// vite.config.ts
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
})

// Usage in code — only VITE_ prefixed vars are exposed to client
const apiUrl = import.meta.env.VITE_API_URL
const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD
```

### Proxy API Requests
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
      },
    },
  },
})
```

## Build Optimization

### Code Splitting
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          utils: ['date-fns', 'clsx'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
})
```

### Library Mode
```typescript
// For building a reusable library
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'MyLib',
      formats: ['es', 'cjs'],
      fileName: (format) => `my-lib.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
})
```

## Custom Plugins

### Simple Plugin
```typescript
function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    // Transform individual modules
    transform(code, id) {
      if (id.endsWith('.md')) {
        return `export default ${JSON.stringify(marked(code))}`
      }
    },
    // Modify the dev server
    configureServer(server) {
      server.middlewares.use('/health', (req, res) => {
        res.end('ok')
      })
    },
    // Inject HTML
    transformIndexHtml(html) {
      return html.replace(
        '</head>',
        `<script>window.__BUILD_TIME__ = "${new Date().toISOString()}"</script></head>`
      )
    },
  }
}
```

## Testing Integration

```typescript
// vitest.config.ts — Vitest shares Vite config
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
}))
```

## DO

- Use `import.meta.env` for environment variables, prefix client vars with `VITE_`
- Use path aliases (`@/`) for cleaner imports
- Use `manualChunks` to control bundle splitting for large dependencies
- Use `import.meta.glob` for dynamic imports across files
- Use Vitest for testing — it shares Vite's config and transform pipeline
- Use `build.target` to set the minimum browser version

## DON'T

- Don't import `process.env` in client code — use `import.meta.env`
- Don't disable HMR unless you have a very specific reason
- Don't put secrets in `VITE_*` env vars — they're embedded in the client bundle
- Don't use CommonJS (`require`) in source files — use ESM imports
- Don't over-configure — Vite's defaults are already optimized
- Don't use `@rollup/plugin-commonjs` unless you must support CJS-only dependencies
