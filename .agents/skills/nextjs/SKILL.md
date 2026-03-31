---
name: nextjs
description: Expert Next.js development with App Router, Server Components, and full-stack patterns
---

# Next.js Specialist

You are an expert Next.js developer. Apply these principles when building Next.js applications.

## Core Philosophy

- **Server-first** — Default to Server Components, opt into client when needed
- **File-based routing** — Folder structure is your API
- **Hybrid rendering** — Choose the right strategy per page
- **Edge-ready** — Design for global distribution

## App Router Fundamentals

### File Conventions
```
app/
├── layout.tsx          # Root layout (required)
├── page.tsx            # Home page (/)
├── loading.tsx         # Loading UI
├── error.tsx           # Error boundary
├── not-found.tsx       # 404 page
├── dashboard/
│   ├── layout.tsx      # Nested layout
│   ├── page.tsx        # /dashboard
│   └── settings/
│       └── page.tsx    # /dashboard/settings
├── blog/
│   └── [slug]/
│       └── page.tsx    # /blog/:slug (dynamic)
└── api/
    └── users/
        └── route.ts    # API route
```

### Server Components (Default)
```tsx
// This runs on the server - direct database access!
async function ProductPage({ params }: { params: { id: string } }) {
  const product = await db.product.findUnique({ where: { id: params.id } })
  
  return (
    <main>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <AddToCartButton productId={product.id} />  {/* Client component */}
    </main>
  )
}

export default ProductPage
```

### Client Components
```tsx
'use client'  // This directive marks client component

import { useState } from 'react'

export function AddToCartButton({ productId }: { productId: string }) {
  const [pending, setPending] = useState(false)
  
  async function addToCart() {
    setPending(true)
    await fetch('/api/cart', { method: 'POST', body: JSON.stringify({ productId }) })
    setPending(false)
  }
  
  return (
    <button onClick={addToCart} disabled={pending}>
      {pending ? 'Adding...' : 'Add to Cart'}
    </button>
  )
}
```

## Data Fetching

### Server Component Fetching
```tsx
// Automatic deduplication and caching
async function Page() {
  // These run in parallel, deduped automatically
  const [user, posts] = await Promise.all([
    fetch('https://api.example.com/user').then(r => r.json()),
    fetch('https://api.example.com/posts').then(r => r.json())
  ])
  
  return <Dashboard user={user} posts={posts} />
}
```

### Caching Strategies
```tsx
// Static (default) - cached indefinitely
fetch('https://api.example.com/data')

// Revalidate every 60 seconds
fetch('https://api.example.com/data', { next: { revalidate: 60 } })

// Dynamic - no caching
fetch('https://api.example.com/data', { cache: 'no-store' })

// On-demand revalidation
import { revalidatePath, revalidateTag } from 'next/cache'
revalidatePath('/blog')
revalidateTag('posts')
```

### Server Actions
```tsx
// actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  const title = formData.get('title')
  const content = formData.get('content')
  
  await db.post.create({ data: { title, content } })
  
  revalidatePath('/posts')
  redirect('/posts')
}

// Usage in component
import { createPost } from './actions'

function NewPostForm() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit">Create</button>
    </form>
  )
}
```

## Rendering Strategies

### Static Generation (Default)
```tsx
// Page is pre-rendered at build time
export default async function BlogPage() {
  const posts = await getPosts()
  return <PostList posts={posts} />
}

// Generate static params for dynamic routes
export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map(post => ({ slug: post.slug }))
}
```

### Dynamic Rendering
```tsx
// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Or use dynamic functions
import { cookies, headers } from 'next/headers'

export default async function Page() {
  const cookieStore = cookies()  // Makes page dynamic
  const token = cookieStore.get('token')
  // ...
}
```

### Streaming & Suspense
```tsx
import { Suspense } from 'react'

export default function Dashboard() {
  return (
    <main>
      <h1>Dashboard</h1>
      
      {/* Streams in as ready */}
      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />
      </Suspense>
      
      <Suspense fallback={<TableSkeleton />}>
        <RecentOrders />
      </Suspense>
    </main>
  )
}
```

## API Routes

```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = searchParams.get('page') ?? '1'
  
  const users = await db.user.findMany({
    skip: (parseInt(page) - 1) * 10,
    take: 10
  })
  
  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  const user = await db.user.create({ data: body })
  
  return NextResponse.json(user, { status: 201 })
}

// Dynamic route: app/api/users/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await db.user.findUnique({ where: { id: params.id } })
  
  if (!user) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  
  return NextResponse.json(user)
}
```

## Middleware

```tsx
// middleware.ts (root level)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check auth
  const token = request.cookies.get('token')
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Add headers
  const response = NextResponse.next()
  response.headers.set('x-custom-header', 'value')
  
  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
}
```

## Metadata & SEO

```tsx
// Static metadata
export const metadata = {
  title: 'My App',
  description: 'Description of my app',
  openGraph: {
    title: 'My App',
    description: 'Description of my app',
    images: ['/og-image.jpg']
  }
}

// Dynamic metadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.id)
  
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      images: [product.image]
    }
  }
}
```

## Performance Patterns

### Image Optimization
```tsx
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority  // Preload above-the-fold images
  placeholder="blur"
  blurDataURL={blurUrl}
/>
```

### Font Optimization
```tsx
// app/layout.tsx
import { Inter, Playfair_Display } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair'
})

export default function RootLayout({ children }) {
  return (
    <html className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

### Parallel Routes
```
app/
├── @modal/
│   └── login/
│       └── page.tsx
└── layout.tsx

// layout.tsx
export default function Layout({ children, modal }) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
```

## Anti-Patterns to Avoid

### ❌ Client Component for Static Content
```tsx
// Bad: Unnecessary client component
'use client'
export function Footer() {
  return <footer>© 2024 My Company</footer>
}

// Good: Server component (default)
export function Footer() {
  return <footer>© 2024 My Company</footer>
}
```

### ❌ Fetching in Client Components
```tsx
// Bad: Client-side fetching when server would work
'use client'
function Products() {
  const [products, setProducts] = useState([])
  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setProducts)
  }, [])
}

// Good: Server component
async function Products() {
  const products = await db.product.findMany()
  return <ProductList products={products} />
}
```

### ❌ Passing Server-Only Code to Client
```tsx
// Bad: This exposes server code to client
'use client'
import { db } from '@/lib/db'  // ❌ Will error

// Good: Use server actions or API routes
'use client'
import { getProducts } from '@/app/actions'
```

## File Structure

```
├── app/
│   ├── (marketing)/     # Route group (no URL impact)
│   │   ├── about/
│   │   └── pricing/
│   ├── (dashboard)/
│   │   ├── layout.tsx   # Shared dashboard layout
│   │   └── settings/
│   └── api/
├── components/
│   ├── ui/              # Shared UI components
│   └── features/        # Feature-specific components
├── lib/
│   ├── db.ts           # Database client
│   └── utils.ts        # Utilities
└── public/
```