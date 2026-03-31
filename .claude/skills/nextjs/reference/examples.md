# Next.js Examples: What TO Do

## Server Components

### ✅ Data Fetching in Server Components
```tsx
// app/products/page.tsx
// This component runs on the server - no "use client" needed!

import { db } from '@/lib/db'
import { ProductCard } from '@/components/ProductCard'

async function getProducts() {
  // Direct database access - no API needed!
  return await db.product.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
}

export default async function ProductsPage() {
  const products = await getProducts()
  
  return (
    <main className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      <div className="grid grid-cols-3 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  )
}
```

### ✅ Parallel Data Fetching
```tsx
// Fetch multiple resources in parallel
async function DashboardPage() {
  // These run in parallel, not sequentially!
  const [user, orders, analytics] = await Promise.all([
    getUser(),
    getOrders(),
    getAnalytics(),
  ])

  return (
    <Dashboard 
      user={user} 
      orders={orders} 
      analytics={analytics} 
    />
  )
}
```

### ✅ Streaming with Suspense
```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react'

// These components fetch their own data
import { RevenueChart } from './RevenueChart'
import { RecentOrders } from './RecentOrders'
import { TopProducts } from './TopProducts'

export default function DashboardPage() {
  return (
    <main className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Each section streams in as it's ready */}
      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />
      </Suspense>
      
      <div className="grid grid-cols-2 gap-6 mt-6">
        <Suspense fallback={<TableSkeleton />}>
          <RecentOrders />
        </Suspense>
        
        <Suspense fallback={<ListSkeleton />}>
          <TopProducts />
        </Suspense>
      </div>
    </main>
  )
}
```

## Server Actions

### ✅ Form with Server Action
```tsx
// app/contact/actions.ts
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const ContactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
})

export async function submitContact(formData: FormData) {
  // Validate
  const result = ContactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  })
  
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors }
  }
  
  // Save to database
  await db.contact.create({ data: result.data })
  
  // Revalidate and redirect
  revalidatePath('/contact')
  redirect('/contact/success')
}

// app/contact/page.tsx
import { submitContact } from './actions'

export default function ContactPage() {
  return (
    <form action={submitContact} className="space-y-4 max-w-md">
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" required className="input" />
      </div>
      
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required className="input" />
      </div>
      
      <div>
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" required className="textarea" />
      </div>
      
      <SubmitButton />
    </form>
  )
}

// Client component for pending state
'use client'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button type="submit" disabled={pending} className="btn btn-primary">
      {pending ? 'Sending...' : 'Send Message'}
    </button>
  )
}
```

### ✅ Optimistic Updates
```tsx
'use client'

import { useOptimistic, useTransition } from 'react'
import { toggleLike } from './actions'

export function LikeButton({ postId, initialLiked, initialCount }) {
  const [isPending, startTransition] = useTransition()
  
  const [optimisticState, setOptimistic] = useOptimistic(
    { liked: initialLiked, count: initialCount },
    (state, newLiked: boolean) => ({
      liked: newLiked,
      count: newLiked ? state.count + 1 : state.count - 1,
    })
  )
  
  function handleClick() {
    const newLiked = !optimisticState.liked
    
    startTransition(async () => {
      setOptimistic(newLiked)
      await toggleLike(postId, newLiked)
    })
  }
  
  return (
    <button 
      onClick={handleClick} 
      disabled={isPending}
      className={optimisticState.liked ? 'text-red-500' : 'text-gray-500'}
    >
      ❤️ {optimisticState.count}
    </button>
  )
}
```

## Caching Strategies

### ✅ Proper Cache Configuration
```tsx
// Static data - cache indefinitely
async function getCategories() {
  const res = await fetch('https://api.example.com/categories')
  // Cached by default
  return res.json()
}

// Semi-static - revalidate periodically
async function getProducts() {
  const res = await fetch('https://api.example.com/products', {
    next: { revalidate: 3600 }  // Revalidate every hour
  })
  return res.json()
}

// Dynamic data - never cache
async function getCart(userId: string) {
  const res = await fetch(`https://api.example.com/cart/${userId}`, {
    cache: 'no-store'  // Always fresh
  })
  return res.json()
}

// Tag-based revalidation
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    next: { tags: ['posts'] }
  })
  return res.json()
}

// In server action:
import { revalidateTag } from 'next/cache'

export async function createPost(data) {
  await db.post.create({ data })
  revalidateTag('posts')  // Invalidate all posts
}
```

## Route Handlers

### ✅ RESTful API Route
```tsx
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const PostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(10),
})

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '10')
  
  const posts = await db.post.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
  })
  
  return NextResponse.json({ posts, page, limit })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = PostSchema.parse(body)
    
    const post = await db.post.create({ data })
    
    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Metadata & SEO

### ✅ Dynamic Metadata
```tsx
// app/blog/[slug]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug)
  
  if (!post) {
    return { title: 'Post Not Found' }
  }
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPost(params.slug)
  
  if (!post) {
    notFound()
  }
  
  return <Article post={post} />
}
```

## Layouts & Composition

### ✅ Nested Layouts with Shared State
```tsx
// app/dashboard/layout.tsx
import { Sidebar } from '@/components/Sidebar'
import { DashboardHeader } from '@/components/DashboardHeader'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

// app/dashboard/settings/layout.tsx
// Nested layout for settings section
export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <nav className="flex gap-4 mb-6 border-b">
        <NavLink href="/dashboard/settings">General</NavLink>
        <NavLink href="/dashboard/settings/security">Security</NavLink>
        <NavLink href="/dashboard/settings/billing">Billing</NavLink>
      </nav>
      {children}
    </div>
  )
}
```

### ✅ Loading & Error States
```tsx
// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-gray-200 rounded" />
        ))}
      </div>
    </div>
  )
}

// app/dashboard/error.tsx
'use client'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="p-6 bg-red-50 rounded-lg text-center">
      <h2 className="text-lg font-semibold text-red-800 mb-2">
        Something went wrong!
      </h2>
      <p className="text-red-600 mb-4">{error.message}</p>
      <button 
        onClick={reset}
        className="btn btn-primary"
      >
        Try again
      </button>
    </div>
  )
}
```

## DON'T (Not Good)

### Bad Request Example

```text
Run /nextjs and make it better.
```

Why this is not good:
- Too vague, no clear scope or success criteria.
- Missing constraints, so the result may break expectations.
- No validation steps, so quality cannot be trusted.

### Better Alternative

```text
Run /nextjs on a specific area, list constraints, and include tests or verification checks.
```
