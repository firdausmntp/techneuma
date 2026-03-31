---
name: performance
description: Expert web performance optimization with Core Web Vitals, bundle optimization, and loading strategies
---

# Performance Specialist

You are an expert in web performance optimization. Apply these principles to create fast experiences.

## Core Philosophy

- **Measure first** — Don't guess, profile
- **User perception** — Perceived speed matters most
- **Progressive** — Fast first paint, enhance progressively
- **Budget** — Set and enforce performance budgets

## Core Web Vitals

### LCP (Largest Contentful Paint)
```html
<!-- Target: < 2.5 seconds -->

<!-- ✅ Preload critical resources -->
<link rel="preload" href="/hero.webp" as="image" />
<link rel="preload" href="/critical.css" as="style" />

<!-- ✅ Optimize LCP element -->
<img
  src="/hero.webp"
  alt="Hero"
  width="1200"
  height="600"
  fetchpriority="high"  /* Prioritize this image */
  decoding="async"
/>

<!-- ✅ Inline critical CSS -->
<style>
  /* Only above-the-fold styles */
  .hero { /* ... */ }
</style>

<!-- Load rest async -->
<link rel="preload" href="/styles.css" as="style" onload="this.rel='stylesheet'">
```

### FID / INP (Interaction to Next Paint)
```javascript
// Target: < 200ms

// ✅ Break up long tasks
function processLargeArray(items) {
  const CHUNK_SIZE = 100
  let index = 0
  
  function processChunk() {
    const end = Math.min(index + CHUNK_SIZE, items.length)
    
    for (; index < end; index++) {
      processItem(items[index])
    }
    
    if (index < items.length) {
      // Yield to main thread
      setTimeout(processChunk, 0)
    }
  }
  
  processChunk()
}

// ✅ Use requestIdleCallback for non-urgent work
requestIdleCallback((deadline) => {
  while (deadline.timeRemaining() > 0 && tasks.length > 0) {
    doTask(tasks.pop())
  }
})

// ✅ Debounce input handlers
const handleInput = debounce((e) => {
  search(e.target.value)
}, 300)
```

### CLS (Cumulative Layout Shift)
```html
<!-- Target: < 0.1 -->

<!-- ✅ Always specify dimensions -->
<img src="photo.jpg" width="800" height="600" alt="Photo" />
<video width="1920" height="1080" poster="thumb.jpg"></video>

<!-- ✅ Reserve space for dynamic content -->
<div class="ad-container" style="min-height: 250px;">
  <!-- Ad loads here -->
</div>

<!-- ✅ Use aspect-ratio -->
<style>
  .video-container {
    aspect-ratio: 16 / 9;
    width: 100%;
  }
</style>

<!-- ✅ Avoid inserting content above existing content -->
<!-- Bad: Banner appears and pushes content down -->
<!-- Good: Reserve space or use overlay -->
```

## Loading Strategies

### Resource Hints
```html
<!-- Preconnect to required origins -->
<link rel="preconnect" href="https://api.example.com" />
<link rel="preconnect" href="https://fonts.googleapis.com" />

<!-- DNS prefetch for likely-needed origins -->
<link rel="dns-prefetch" href="https://analytics.example.com" />

<!-- Preload critical resources -->
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/critical.js" as="script" />

<!-- Prefetch for likely next navigation -->
<link rel="prefetch" href="/next-page.html" />

<!-- Prerender for certain next page -->
<link rel="prerender" href="/checkout" />
```

### Lazy Loading
```html
<!-- Native lazy loading for images -->
<img src="photo.jpg" loading="lazy" alt="Photo" />

<!-- Native lazy loading for iframes -->
<iframe src="video.html" loading="lazy"></iframe>
```

```javascript
// Intersection Observer for custom lazy loading
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        observer.unobserve(img)
      }
    })
  },
  { rootMargin: '100px' }  // Start loading 100px before visible
)

document.querySelectorAll('img[data-src]').forEach(img => {
  observer.observe(img)
})
```

### Code Splitting
```javascript
// Dynamic imports for route-based splitting
const routes = {
  '/': () => import('./pages/Home'),
  '/about': () => import('./pages/About'),
  '/dashboard': () => import('./pages/Dashboard'),
}

// Component-level splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'))

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyComponent />
    </Suspense>
  )
}
```

## Image Optimization

### Modern Formats
```html
<!-- Use modern formats with fallback -->
<picture>
  <source srcset="photo.avif" type="image/avif" />
  <source srcset="photo.webp" type="image/webp" />
  <img src="photo.jpg" alt="Photo" />
</picture>

<!-- Responsive images -->
<img
  srcset="
    photo-400.webp 400w,
    photo-800.webp 800w,
    photo-1200.webp 1200w
  "
  sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px"
  src="photo-800.webp"
  alt="Photo"
/>
```

### Image Sizing
```css
/* Prevent layout shift */
img {
  max-width: 100%;
  height: auto;
}

/* Use aspect-ratio for responsive images */
.thumbnail {
  aspect-ratio: 1;
  object-fit: cover;
}
```

## JavaScript Optimization

### Bundle Size
```javascript
// ✅ Import only what you need
import { format } from 'date-fns'  // Not: import * as dateFns

// ✅ Use tree-shakeable libraries
import debounce from 'lodash/debounce'  // Not: import { debounce } from 'lodash'

// ✅ Analyze bundle
// npx webpack-bundle-analyzer stats.json
// npx source-map-explorer bundle.js
```

### Script Loading
```html
<!-- ✅ Defer non-critical scripts -->
<script src="app.js" defer></script>

<!-- ✅ Async for independent scripts -->
<script src="analytics.js" async></script>

<!-- ✅ Module scripts are deferred by default -->
<script type="module" src="app.js"></script>

<!-- ❌ Render-blocking script in head -->
<head>
  <script src="heavy-library.js"></script>
</head>
```

### Runtime Performance
```javascript
// ✅ Use requestAnimationFrame for visual updates
function animate() {
  // Update animation state
  element.style.transform = `translateX(${x}px)`
  
  requestAnimationFrame(animate)
}

// ✅ Avoid layout thrashing
// Bad: Forces layout on each iteration
elements.forEach(el => {
  el.style.width = el.offsetWidth + 10 + 'px'
})

// Good: Batch reads then writes
const widths = elements.map(el => el.offsetWidth)
elements.forEach((el, i) => {
  el.style.width = widths[i] + 10 + 'px'
})

// ✅ Use will-change sparingly
.animated-element {
  will-change: transform;  /* Only when needed */
}
```

## CSS Optimization

### Critical CSS
```html
<!-- Inline critical CSS -->
<head>
  <style>
    /* Above-the-fold styles only */
    body { margin: 0; font-family: sans-serif; }
    .header { /* ... */ }
    .hero { /* ... */ }
  </style>
  
  <!-- Load rest asynchronously -->
  <link rel="preload" href="styles.css" as="style" onload="this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="styles.css"></noscript>
</head>
```

### Efficient Selectors
```css
/* ✅ Simple, efficient selectors */
.button { }
.nav-link { }

/* ❌ Overly complex selectors */
body > div.container > ul > li > a.nav-link { }
[class*="btn-"] { }

/* ✅ Avoid expensive properties in animations */
.animate {
  /* Good: GPU-accelerated */
  transform: translateX(100px);
  opacity: 0.5;
  
  /* Bad: Triggers layout */
  /* width: 100px; */
  /* top: 50px; */
}
```

### Reduce Unused CSS
```javascript
// Use tools like PurgeCSS
// purgecss --css styles.css --content index.html --output dist/

// Or in build config
module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
}
```

## Caching

### HTTP Caching
```
# Static assets - cache forever (use content hash in filename)
Cache-Control: public, max-age=31536000, immutable

# HTML - revalidate each time
Cache-Control: no-cache

# API responses - short cache
Cache-Control: private, max-age=300, stale-while-revalidate=60
```

### Service Worker Caching
```javascript
// Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/styles.css',
        '/app.js',
        '/offline.html',
      ])
    })
  )
})

// Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})
```

## Measuring Performance

### Performance API
```javascript
// Measure specific operations
performance.mark('start')
// ... operation
performance.mark('end')
performance.measure('operation', 'start', 'end')

const [measure] = performance.getEntriesByName('operation')
console.log(`Operation took ${measure.duration}ms`)

// Get navigation timing
const [nav] = performance.getEntriesByType('navigation')
console.log('Time to first byte:', nav.responseStart)
console.log('DOM loaded:', nav.domContentLoadedEventEnd)
console.log('Page fully loaded:', nav.loadEventEnd)

// Observe LCP
new PerformanceObserver((list) => {
  const entries = list.getEntries()
  const lastEntry = entries[entries.length - 1]
  console.log('LCP:', lastEntry.startTime)
}).observe({ type: 'largest-contentful-paint', buffered: true })
```

## Anti-Patterns

### ❌ Render-Blocking Resources
```html
<!-- Bad: Blocks rendering -->
<head>
  <link rel="stylesheet" href="huge-framework.css" />
  <script src="analytics.js"></script>
</head>

<!-- Good: Non-blocking -->
<head>
  <style>/* Critical CSS inline */</style>
  <link rel="preload" href="styles.css" as="style" onload="this.rel='stylesheet'">
  <script src="analytics.js" async></script>
</head>
```

### ❌ Unoptimized Images
```html
<!-- Bad: 5MB image for 200px display -->
<img src="original-5mb.jpg" style="width: 200px" />

<!-- Good: Properly sized -->
<img 
  srcset="image-200.webp 200w, image-400.webp 400w"
  sizes="200px"
  src="image-200.webp"
  loading="lazy"
/>
```

### ❌ Memory Leaks
```javascript
// Bad: Event listener never removed
useEffect(() => {
  window.addEventListener('resize', handleResize)
  // Missing cleanup!
}, [])

// Good: Cleanup on unmount
useEffect(() => {
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [])
```
