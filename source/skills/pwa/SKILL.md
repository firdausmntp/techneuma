---
name: pwa
description: Expert Progressive Web App development with service workers, offline support, and native-like capabilities
---

# PWA Specialist

You are an expert in building Progressive Web Apps. Create web experiences that work offline, install like native apps, and perform reliably on any connection.

## Core Philosophy

- **Reliability** — Load instantly and never show the downasaur, even offline
- **Speed** — Respond to user interactions quickly with smooth animations
- **Engagement** — Feel like a natural app with immersive full-screen experiences
- **Progressive** — Work for every user regardless of browser, enhancing when possible

## Web App Manifest

### manifest.json
```json
{
  "name": "My Application",
  "short_name": "MyApp",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4488ff",
  "icons": [
    { "src": "/icons/192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "screenshots": [
    { "src": "/screenshots/wide.png", "sizes": "1280x720", "type": "image/png", "form_factor": "wide" },
    { "src": "/screenshots/narrow.png", "sizes": "750x1334", "type": "image/png", "form_factor": "narrow" }
  ]
}
```

### Meta Tags
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#4488ff">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="/icons/180.png">
```

## Service Worker

### Registration
```typescript
// main.ts
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
              // New version available — notify user
              showUpdateBanner()
            }
          })
        })
      })
  })
}
```

### Caching Strategies
```typescript
// sw.js — Cache-first for assets, network-first for API
const CACHE_NAME = 'app-v1'
const STATIC_ASSETS = ['/', '/index.html', '/app.js', '/styles.css']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  
  if (request.url.includes('/api/')) {
    // Network-first for API calls
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        })
        .catch(() => caches.match(request))
    )
  } else {
    // Cache-first for static assets
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    )
  }
})
```

### Workbox (Recommended)
```typescript
// sw.ts with Workbox
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

// Precache build assets
precacheAndRoute(self.__WB_MANIFEST)

// Cache images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 })],
  })
)

// Cache API responses
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 5 * 60 })],
  })
)
```

## Background Sync
```typescript
// Queue failed requests for retry
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncPendingOrders())
  }
})

async function syncPendingOrders() {
  const db = await openDB('pending-orders')
  const orders = await db.getAll('outbox')
  
  for (const order of orders) {
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order.data),
    })
    await db.delete('outbox', order.id)
  }
}
```

## Push Notifications
```typescript
// Subscribe
async function subscribeToPush() {
  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  })
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sub),
  })
}

// Handle in service worker
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/192.png',
      badge: '/icons/badge.png',
      data: { url: data.url },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data.url))
})
```

## Install Prompt
```typescript
let deferredPrompt: BeforeInstallPromptEvent | null = null

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
  showInstallButton()
})

async function installApp() {
  if (!deferredPrompt) return
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  deferredPrompt = null
  hideInstallButton()
}
```

## DO

- Use HTTPS — service workers require a secure context
- Provide both 192px and 512px icons, plus a maskable version
- Implement a clear update flow — tell users when new content is available
- Test offline behavior extensively — not just "does it load"
- Use Workbox for production service workers — it handles edge cases
- Cache critical CSS and JS for instant first paint

## DON'T

- Don't cache everything — be strategic about what goes offline
- Don't use `skipWaiting()` without an update notification — it can break active sessions
- Don't forget to version your cache names when updating cached assets
- Don't request notification permission on page load — wait for user intent
- Don't serve stale API data without indicating it's from cache
- Don't forget `apple-touch-icon` and iOS-specific meta tags
