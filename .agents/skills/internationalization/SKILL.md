---
name: internationalization
description: Expert i18n/l10n implementation with locale routing, translations, and cultural adaptation
---

# Internationalization (i18n) Specialist

You are an expert in internationalization. Apply these principles for global-ready applications.

## Core Philosophy

- **Internationalization (i18n)** — Design for multiple languages/regions
- **Localization (l10n)** — Adapt for specific locale
- **Cultural sensitivity** — More than just translation
- **Separation of concerns** — Content from code

## Key Concepts

```
┌─────────────────────────────────────────────────────────────┐
│                    I18N FUNDAMENTALS                        │
├─────────────────────────────────────────────────────────────┤
│  LOCALE: language_REGION (e.g., en_US, pt_BR, zh_CN)       │
│  - Language: ISO 639-1 (en, es, zh)                        │
│  - Region: ISO 3166-1 (US, ES, CN)                         │
├─────────────────────────────────────────────────────────────┤
│  WHAT TO LOCALIZE:                                          │
│  - Text content                                             │
│  - Date/time formats                                        │
│  - Number/currency formats                                  │
│  - Pluralization rules                                      │
│  - RTL/LTR direction                                        │
│  - Images with text                                         │
│  - Legal/regulatory content                                 │
└─────────────────────────────────────────────────────────────┘
```

## Next.js i18n

### Setup with next-intl
```typescript
// next.config.js
const withNextIntl = require('next-intl/plugin')()

module.exports = withNextIntl({
  // Other Next.js config
})
```

```typescript
// i18n.config.ts
export const locales = ['en', 'es', 'fr', 'de', 'ja', 'zh'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ja: '日本語',
  zh: '中文'
}
```

### Middleware (Locale Detection)
```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n.config'

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'  // 'always' | 'as-needed' | 'never'
})

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
```

### Translation Files
```json
// messages/en.json
{
  "common": {
    "welcome": "Welcome",
    "loading": "Loading...",
    "error": "An error occurred",
    "retry": "Try again"
  },
  "nav": {
    "home": "Home",
    "about": "About",
    "contact": "Contact"
  },
  "auth": {
    "login": "Log in",
    "logout": "Log out",
    "signup": "Sign up",
    "forgotPassword": "Forgot password?"
  },
  "errors": {
    "required": "{field} is required",
    "invalid": "Invalid {field}",
    "minLength": "{field} must be at least {min} characters"
  },
  "products": {
    "count": "{count, plural, =0 {No products} =1 {1 product} other {# products}}",
    "price": "Price: {price, number, ::currency/USD}",
    "addedAt": "Added {date, date, medium}"
  }
}
```

```json
// messages/es.json
{
  "common": {
    "welcome": "Bienvenido",
    "loading": "Cargando...",
    "error": "Ocurrió un error",
    "retry": "Intentar de nuevo"
  },
  "products": {
    "count": "{count, plural, =0 {Sin productos} =1 {1 producto} other {# productos}}",
    "price": "Precio: {price, number, ::currency/EUR}",
    "addedAt": "Añadido {date, date, medium}"
  }
}
```

### Server Components
```typescript
// app/[locale]/page.tsx
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

// For async server components
export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'meta' })
  return { title: t('title') }
}

// For sync server components
export default function HomePage() {
  const t = useTranslations('common')
  
  return (
    <main>
      <h1>{t('welcome')}</h1>
    </main>
  )
}
```

### Client Components
```typescript
'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next-intl/client'

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  
  function handleChange(newLocale: string) {
    router.replace(pathname, { locale: newLocale })
  }
  
  return (
    <select value={locale} onChange={(e) => handleChange(e.target.value)}>
      <option value="en">English</option>
      <option value="es">Español</option>
      <option value="fr">Français</option>
    </select>
  )
}

export function ProductCount({ count }: { count: number }) {
  const t = useTranslations('products')
  
  // Handles pluralization automatically
  return <span>{t('count', { count })}</span>
}
```

## Formatting

### Dates & Times
```typescript
import { useFormatter } from 'next-intl'

function EventDate({ date }: { date: Date }) {
  const format = useFormatter()
  
  return (
    <div>
      {/* Full date: "January 15, 2024" / "15 de enero de 2024" */}
      <p>{format.dateTime(date, { dateStyle: 'long' })}</p>
      
      {/* Relative time: "3 days ago" / "hace 3 días" */}
      <p>{format.relativeTime(date)}</p>
      
      {/* Custom format */}
      <p>{format.dateTime(date, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })}</p>
    </div>
  )
}
```

### Numbers & Currency
```typescript
function ProductPrice({ price, currency = 'USD' }: { price: number; currency?: string }) {
  const format = useFormatter()
  
  return (
    <div>
      {/* Currency: "$1,234.56" / "1.234,56 €" */}
      <p>{format.number(price, { style: 'currency', currency })}</p>
      
      {/* Percentage: "25%" */}
      <p>{format.number(0.25, { style: 'percent' })}</p>
      
      {/* Compact: "1.2K" / "1,2 mil" */}
      <p>{format.number(1234, { notation: 'compact' })}</p>
    </div>
  )
}
```

### Lists
```typescript
function Contributors({ names }: { names: string[] }) {
  const format = useFormatter()
  
  // "Alice, Bob, and Charlie" / "Alice, Bob y Charlie"
  return <p>{format.list(names, { type: 'conjunction' })}</p>
}
```

## RTL Support

```typescript
// app/[locale]/layout.tsx
import { useLocale } from 'next-intl'

const rtlLocales = ['ar', 'he', 'fa', 'ur']

export default function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const dir = rtlLocales.includes(locale) ? 'rtl' : 'ltr'
  
  return (
    <html lang={locale} dir={dir}>
      <body>{children}</body>
    </html>
  )
}
```

```css
/* CSS logical properties for RTL support */
.sidebar {
  /* Instead of: margin-left: 1rem; */
  margin-inline-start: 1rem;
  
  /* Instead of: padding-right: 2rem; */
  padding-inline-end: 2rem;
  
  /* Instead of: text-align: left; */
  text-align: start;
  
  /* Instead of: border-left: 1px solid; */
  border-inline-start: 1px solid;
}

.icon {
  /* Flip icons in RTL */
  [dir="rtl"] & {
    transform: scaleX(-1);
  }
}
```

## React i18next

```typescript
// i18n.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import Backend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'fr', 'de'],
    ns: ['common', 'auth', 'errors'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      caches: ['cookie']
    }
  })

export default i18n
```

```typescript
// Usage
import { useTranslation, Trans } from 'react-i18next'

function MyComponent() {
  const { t, i18n } = useTranslation()
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      
      {/* With interpolation */}
      <p>{t('greeting', { name: 'John' })}</p>
      
      {/* Pluralization */}
      <p>{t('itemCount', { count: 5 })}</p>
      
      {/* Nested keys */}
      <p>{t('errors.notFound')}</p>
      
      {/* With components */}
      <Trans i18nKey="terms">
        By signing up, you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.
      </Trans>
      
      {/* Change language */}
      <button onClick={() => i18n.changeLanguage('es')}>
        Español
      </button>
    </div>
  )
}
```

## Type Safety

```typescript
// types/i18n.ts
import en from '../messages/en.json'

type Messages = typeof en

declare global {
  interface IntlMessages extends Messages {}
}

// Now translations are type-safe
const t = useTranslations('common')
t('welcome')  // ✓
t('nonexistent')  // ✗ Type error
```

## SEO for Multi-language

```typescript
// app/[locale]/layout.tsx
import { locales, defaultLocale } from '@/i18n.config'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'meta' })
  
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `https://example.com/${locale}`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `https://example.com/${l}`])
      )
    },
    openGraph: {
      locale: locale,
      alternateLocales: locales.filter((l) => l !== locale)
    }
  }
}
```

```html
<!-- Generated hreflang tags -->
<link rel="alternate" hreflang="en" href="https://example.com/en" />
<link rel="alternate" hreflang="es" href="https://example.com/es" />
<link rel="alternate" hreflang="x-default" href="https://example.com" />
```

## Translation Management

### Using Lokalise/Crowdin
```typescript
// scripts/sync-translations.ts
import { LokaliseApi } from '@lokalise/node-api'

const lokalise = new LokaliseApi({ apiKey: process.env.LOKALISE_API_KEY! })

async function downloadTranslations() {
  const response = await lokalise.files().download(PROJECT_ID, {
    format: 'json',
    original_filenames: true,
    directory_prefix: '',
    placeholder_format: 'icu'
  })
  
  // Download and extract bundle
  // ...
}

async function uploadTranslations() {
  await lokalise.files().upload(PROJECT_ID, {
    data: base64encode(JSON.stringify(enMessages)),
    filename: 'en.json',
    lang_iso: 'en'
  })
}
```

## Anti-Patterns

### ❌ Hard-coded Strings
```typescript
// Bad
<button>Submit</button>

// Good
<button>{t('common.submit')}</button>
```

### ❌ Concatenating Translated Strings
```typescript
// Bad: Word order varies by language
const message = t('hello') + ' ' + name + ', ' + t('welcomeBack')

// Good: Use interpolation
const message = t('greeting', { name })
// "Hello {name}, welcome back!" / "¡Bienvenido de nuevo, {name}!"
```

### ❌ Hardcoded Date/Number Formats
```typescript
// Bad
const date = `${d.getMonth()}/${d.getDate()}/${d.getFullYear()}`

// Good
const date = format.dateTime(d, { dateStyle: 'short' })
// "1/15/24" (en-US) / "15/1/24" (en-GB) / "15.1.24" (de)
```

### ❌ Assuming Text Direction
```css
/* Bad */
.sidebar { margin-left: 20px; }

/* Good */
.sidebar { margin-inline-start: 20px; }
```

### ❌ Ignoring Text Expansion
```typescript
// Bad: Fixed-width containers for text
<div style={{ width: '100px' }}>{t('submit')}</div>
// "Submit" fits, "Absenden" (German) doesn't

// Good: Flexible containers
<div style={{ minWidth: '100px' }}>{t('submit')}</div>
```

### ❌ Manual Pluralization
```typescript
// Bad
const text = count === 1 ? '1 item' : `${count} items`

// Good: ICU MessageFormat
t('itemCount', { count })
// "{count, plural, =0 {No items} =1 {1 item} other {# items}}"
```