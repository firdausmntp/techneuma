---
name: nuxt
description: Expert Nuxt development with auto-imports, server routes, hybrid rendering, and Vue ecosystem mastery
---

# Nuxt Specialist

You are an expert Nuxt developer. Apply these principles when building full-stack Vue applications.

## Core Philosophy

- **Convention over configuration** — File-based routing, auto-imports, zero config
- **Hybrid rendering** — SSR, SSG, ISR, SPA per route
- **Full-stack Vue** — Server routes, middleware, and API in one project
- **DX first** — Auto-imports, TypeScript support, DevTools built in

## Auto-Imports & Composables

### Built-in Composables (No Import Needed)
```vue
<script setup lang="ts">
// ✅ All auto-imported by Nuxt — no import statements needed
const route = useRoute()
const router = useRouter()
const { data: user } = await useFetch('/api/user')
const config = useRuntimeConfig()
const cookie = useCookie('session')
const appConfig = useAppConfig()
</script>
```

### Custom Composables (composables/ directory)
```typescript
// composables/useAuth.ts — auto-imported throughout app
export function useAuth() {
  const user = useState<User | null>('auth-user', () => null)
  const isLoggedIn = computed(() => !!user.value)

  async function login(email: string, password: string) {
    user.value = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    navigateTo('/login')
  }

  return { user, isLoggedIn, login, logout }
}
```

## Data Fetching

### useFetch (SSR-friendly)
```vue
<script setup lang="ts">
// Runs on server during SSR, deduplicates on client
const { data: posts, status, error, refresh } = await useFetch('/api/posts', {
  query: { page: 1, limit: 10 },
  transform: (data) => data.items,
  watch: [page],  // Auto-refresh when reactive page changes
})
</script>

<template>
  <div v-if="status === 'pending'">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <article v-for="post in posts" :key="post.id">
    <h2>{{ post.title }}</h2>
  </article>
</template>
```

### useAsyncData (Custom async logic)
```vue
<script setup lang="ts">
const { data: dashboard } = await useAsyncData('dashboard', async () => {
  const [stats, recent, alerts] = await Promise.all([
    $fetch('/api/stats'),
    $fetch('/api/recent'),
    $fetch('/api/alerts'),
  ])
  return { stats, recent, alerts }
})
</script>
```

## Server Routes

### API Endpoints (server/api/)
```typescript
// server/api/posts/index.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const posts = await db.post.findMany({
    take: Number(query.limit) || 20,
    skip: Number(query.offset) || 0,
    orderBy: { createdAt: 'desc' },
  })
  return posts
})

// server/api/posts/index.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const post = await db.post.create({ data: body })
  return post
})

// server/api/posts/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const post = await db.post.findUnique({ where: { id } })
  if (!post) throw createError({ statusCode: 404, message: 'Post not found' })
  return post
})
```

### Server Middleware
```typescript
// server/middleware/auth.ts
export default defineEventHandler(async (event) => {
  const protectedRoutes = ['/api/admin', '/api/user']
  const isProtected = protectedRoutes.some(r => event.path.startsWith(r))

  if (isProtected) {
    const session = await getSession(event)
    if (!session.user) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }
    event.context.user = session.user
  }
})
```

## Rendering Modes

### Hybrid Rendering (Per-Route)
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/':         { prerender: true },          // SSG at build time
    '/blog/**':  { isr: 3600 },                // ISR: revalidate every hour
    '/admin/**': { ssr: false },               // Client-side SPA only
    '/api/**':   { cors: true, cache: false },  // SSR API routes
  },
})
```

## Layouts & Pages

### Nested Layouts
```vue
<!-- layouts/default.vue -->
<template>
  <div class="app">
    <AppHeader />
    <main>
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<!-- layouts/dashboard.vue -->
<template>
  <div class="dashboard">
    <DashboardSidebar />
    <div class="dashboard-content">
      <slot />
    </div>
  </div>
</template>
```

```vue
<!-- pages/admin.vue — uses dashboard layout -->
<script setup>
definePageMeta({ layout: 'dashboard' })
</script>
```

## DO

- Use `useFetch` over raw `$fetch` in components for SSR deduplication
- Define server routes with method suffixes (`.get.ts`, `.post.ts`)
- Use `useState` for shared reactive state across components
- Leverage `routeRules` for per-route rendering strategies
- Use `composables/` directory for auto-imported reusable logic
- Use `useRuntimeConfig()` for environment variables

## DON'T

- Don't call `$fetch` directly in setup — it runs twice (server + client)
- Don't use Vuex — use `useState` or Pinia with Nuxt integration
- Don't hardcode API URLs — use server routes or runtime config
- Don't create manual route guards — use `definePageMeta` middleware
- Don't skip TypeScript — Nuxt auto-generates types from your file structure
