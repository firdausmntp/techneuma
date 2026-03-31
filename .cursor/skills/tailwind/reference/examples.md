# Tailwind Examples - Good Patterns

## ✅ Good: Component Composition
```jsx
// Button with variants using CVA
import { cva } from 'class-variance-authority'

const button = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        ghost: 'hover:bg-gray-100'
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
)

function Button({ variant, size, className, ...props }) {
  return <button className={button({ variant, size, className })} {...props} />
}
```

## ✅ Good: Responsive Design
```html
<!-- Mobile-first approach -->
<div class="
  grid 
  grid-cols-1 
  gap-4
  sm:grid-cols-2 
  md:grid-cols-3 
  lg:grid-cols-4
">
  <!-- Cards -->
</div>

<!-- Container with max-width -->
<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  <!-- Content -->
</div>
```

## ✅ Good: Dark Mode
```html
<div class="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
  <h1 class="text-gray-900 dark:text-white">Title</h1>
  <p class="text-gray-600 dark:text-gray-400">Description</p>
</div>
```

## ✅ Good: Custom Design Tokens
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          900: '#0c4a6e'
        }
      },
      spacing: {
        '18': '4.5rem',
        '112': '28rem'
      },
      fontFamily: {
        display: ['Cal Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      }
    }
  }
}
```

## ✅ Good: Animation Utilities
```html
<!-- Smooth transitions -->
<button class="
  transform 
  transition-all 
  duration-200 
  hover:scale-105 
  hover:shadow-lg
  active:scale-95
">
  Click me
</button>

<!-- Loading spinner -->
<div class="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
```

## ✅ Good: Typography Plugin
```html
<article class="prose prose-lg dark:prose-invert max-w-none">
  <h1>Article Title</h1>
  <p>Content with <a href="#">links</a> and <code>code</code>.</p>
  <ul>
    <li>Automatically styled lists</li>
  </ul>
</article>
```

## ✅ Good: cn() Utility for Conditional Classes
```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage
<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  variant === 'primary' ? 'primary-classes' : 'secondary-classes',
  className  // Allow override
)} />
```

## DON'T (Not Good)

### Bad Request Example

```text
Run /tailwind and make it better.
```

Why this is not good:
- Too vague, no clear scope or success criteria.
- Missing constraints, so the result may break expectations.
- No validation steps, so quality cannot be trusted.

### Better Alternative

```text
Run /tailwind on a specific area, list constraints, and include tests or verification checks.
```
