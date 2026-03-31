# Next.js Anti-Patterns: What NOT To Do

## Component Model Anti-Patterns

### ❌ Client Component for Static Content
```tsx
// BAD: Unnecessary client component
'use client'

export function Footer() {
  return (
    <footer className="py-8 bg-gray-100">
      <p>© 2024 My Company. All rights reserved.</p>
      <nav>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
      </nav>
    </footer>
  )
}

// GOOD: Server component (default)
export function Footer() {
  return (
    <footer className="py-8 bg-gray-100">
      <p>© 2024 My Company. All rights reserved.</p>
      <nav>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
      </nav>
    </footer>
  )
}
```

**Why it's bad:**
- Increases JavaScript bundle size
- Slower initial page load
- No benefit for static content

---

### ❌ Fetching in Client Components When Server Would Work
```tsx
// BAD: Client-side fetching for initial data
'use client'

import { useState, useEffect } from 'react'

export function ProductList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <Spinner />
  
  return (
    <div>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}

// GOOD: Server component with direct data access
import { db } from '@/lib/db'

export async function ProductList() {
  const products = await db.product.findMany()
  
  return (
    <div>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}
```

**Why it's bad:**
- Extra network round-trip
- No SEO benefit (content not in initial HTML)
- Loading states and spinners
- More code to maintain

---

### ❌ Passing Server-Only Imports to Client
```tsx
// BAD: This will error!
'use client'

import { db } from '@/lib/db'  // ❌ Server-only code in client!
import { headers } from 'next/headers'  // ❌ Server-only function!

export function Dashboard() {
  // This won't work - db doesn't exist on client
  const users = db.user.findMany()  // ❌ ERROR!
}

// GOOD: Keep server code in server components
// Use server actions for mutations from client

// Server component
import { db } from '@/lib/db'

export async function Dashboard() {
  const users = await db.user.findMany()
  return <UserList users={users} />
}

// For client interactivity, pass data as props
// or use server actions
```

---

### ❌ Making Everything Client Components
```tsx
// BAD: Entire page as client component
'use client'

export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  
  useEffect(() => {
    // Fetching everything client-side...
  }, [])
  
  return (
    <main>
      <ProductDetails product={product} />
      <AddToCartButton product={product} />
      <Reviews reviews={reviews} />
    </main>
  )
}

// GOOD: Server component with client islands
export default async function ProductPage({ params }) {
  const product = await getProduct(params.id)
  const reviews = await getReviews(params.id)
  
  return (
    <main>
      {/* Server component - runs on server */}
      <ProductDetails product={product} />
      
      {/* Client component - only what needs interactivity */}
      <AddToCartButton productId={product.id} />
      
      {/* Server component */}
      <Reviews reviews={reviews} />
    </main>
  )
}
```

## Data Fetching Anti-Patterns

### ❌ Sequential Waterfall Fetches
```tsx
// BAD: Sequential fetching
export default async function Dashboard() {
  const user = await getUser()           // Wait...
  const orders = await getOrders()        // Wait more...
  const analytics = await getAnalytics()  // Wait even more...
  
  // Total time = sum of all fetch times
  return <DashboardContent user={user} orders={orders} analytics={analytics} />
}

// GOOD: Parallel fetching
export default async function Dashboard() {
  // All requests start at the same time
  const [user, orders, analytics] = await Promise.all([
    getUser(),
    getOrders(),
    getAnalytics(),
  ])
  
  // Total time = longest single fetch
  return <DashboardContent user={user} orders={orders} analytics={analytics} />
}
```

---

### ❌ Not Using Suspense for Slow Data
```tsx
// BAD: Entire page waits for slowest query
export default async function Dashboard() {
  const fastData = await getFastData()    // 100ms
  const slowData = await getSlowData()    // 3000ms
  
  // User sees nothing for 3+ seconds!
  return (
    <div>
      <FastSection data={fastData} />
      <SlowSection data={slowData} />
    </div>
  )
}

// GOOD: Stream in sections independently
export default function Dashboard() {
  return (
    <div>
      <Suspense fallback={<FastSkeleton />}>
        <FastSection />  {/* Shows in 100ms */}
      </Suspense>
      
      <Suspense fallback={<SlowSkeleton />}>
        <SlowSection />  {/* Streams in when ready */}
      </Suspense>
    </div>
  )
}

async function FastSection() {
  const data = await getFastData()
  return <div>{/* render */}</div>
}

async function SlowSection() {
  const data = await getSlowData()
  return <div>{/* render */}</div>
}
```

---

### ❌ Ignoring Caching
```tsx
// BAD: No cache strategy (defaults vary)
async function getProducts() {
  const res = await fetch('https://api.example.com/products')
  return res.json()
}

// Or worse: disabling cache unnecessarily
async function getProducts() {
  const res = await fetch('https://api.example.com/products', {
    cache: 'no-store'  // ❌ Every request hits API!
  })
  return res.json()
}

// GOOD: Explicit caching strategy
async function getProducts() {
  const res = await fetch('https://api.example.com/products', {
    next: { revalidate: 3600 }  // Cache for 1 hour
  })
  return res.json()
}

// For data that changes often
async function getCart(userId: string) {
  const res = await fetch(`https://api.example.com/cart/${userId}`, {
    cache: 'no-store'  // ✅ Intentionally dynamic
  })
  return res.json()
}
```

## Routing Anti-Patterns

### ❌ Client-Side Navigation for Everything
```tsx
// BAD: Using onClick for navigation
'use client'

export function ProductCard({ product }) {
  const router = useRouter()
  
  return (
    <div onClick={() => router.push(`/products/${product.id}`)}>
      <h2>{product.name}</h2>
      <p>{product.price}</p>
    </div>
  )
}

// GOOD: Use Link component
import Link from 'next/link'

export function ProductCard({ product }) {
  return (
    <Link href={`/products/${product.id}`} className="block">
      <h2>{product.name}</h2>
      <p>{product.price}</p>
    </Link>
  )
}
```

**Why it's bad:**
- No prefetching
- Not accessible (keyboard, screen readers)
- No right-click "open in new tab"

---

### ❌ Not Using Route Groups
```
// BAD: Duplicated layouts
app/
├── marketing-home/
│   └── page.tsx
├── marketing-about/
│   └── page.tsx
├── dashboard-home/
│   └── page.tsx
├── dashboard-settings/
│   └── page.tsx

// GOOD: Route groups with shared layouts
app/
├── (marketing)/
│   ├── layout.tsx      # Marketing layout
│   ├── page.tsx        # /
│   └── about/
│       └── page.tsx    # /about
├── (dashboard)/
│   ├── layout.tsx      # Dashboard layout
│   ├── page.tsx        # /dashboard (if you add it)
│   └── settings/
│       └── page.tsx    # /settings
```

## Server Action Anti-Patterns

### ❌ No Validation in Server Actions
```tsx
// BAD: Trusting client input
'use server'

export async function createUser(formData: FormData) {
  // ❌ No validation!
  const email = formData.get('email') as string
  const role = formData.get('role') as string
  
  // What if role is 'admin' and user shouldn't have access?
  await db.user.create({ data: { email, role } })
}

// GOOD: Always validate on server
'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth'

const CreateUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['user', 'editor']),  // Limit allowed values
})

export async function createUser(formData: FormData) {
  // Check authorization
  const session = await auth()
  if (!session?.user?.isAdmin) {
    throw new Error('Unauthorized')
  }
  
  // Validate input
  const result = CreateUserSchema.safeParse({
    email: formData.get('email'),
    role: formData.get('role'),
  })
  
  if (!result.success) {
    return { error: result.error.flatten() }
  }
  
  await db.user.create({ data: result.data })
}
```

---

### ❌ Forgetting to Revalidate
```tsx
// BAD: Data doesn't update after mutation
'use server'

export async function addProduct(data) {
  await db.product.create({ data })
  // ❌ Product list still shows old data!
}

// GOOD: Revalidate affected data
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

export async function addProduct(data) {
  await db.product.create({ data })
  
  // Option 1: Revalidate specific path
  revalidatePath('/products')
  
  // Option 2: Revalidate by tag (more flexible)
  revalidateTag('products')
}
```

## Middleware Anti-Patterns

### ❌ Heavy Logic in Middleware
```tsx
// BAD: Database queries in middleware
// middleware.ts
import { db } from '@/lib/db'

export async function middleware(request: NextRequest) {
  // ❌ Database query runs on EVERY request!
  const user = await db.user.findUnique({
    where: { id: getUserIdFromCookie(request) }
  })
  
  if (!user.isAdmin && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect('/login')
  }
}

// GOOD: Lightweight checks in middleware, heavy logic in pages
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  
  // Quick check - just verify token exists
  if (!token && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

// Detailed auth check in the page/layout
// app/admin/layout.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }) {
  const session = await auth()
  
  if (!session?.user?.isAdmin) {
    redirect('/unauthorized')
  }
  
  return children
}
```
