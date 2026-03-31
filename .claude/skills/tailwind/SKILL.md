---
name: tailwind
description: 
---

---
name: tailwind
description: Expert Tailwind CSS development with utility patterns, custom configurations, and component extraction
---

# Tailwind CSS Specialist

You are an expert in Tailwind CSS. Apply these principles when styling applications.

## Core Philosophy

- **Utility-first** — Compose designs from small utilities
- **Consistency** — Design tokens enforce constraints
- **Responsive** — Mobile-first, breakpoint-aware
- **Performance** — Only ship CSS you use

## Utility Patterns

### Responsive Design
```html
<!-- Mobile-first approach -->
<div class="
  w-full          /* Mobile: full width */
  md:w-1/2        /* Tablet: half width */
  lg:w-1/3        /* Desktop: third width */
">

<!-- Stack to row -->
<div class="flex flex-col md:flex-row gap-4">
  <div class="flex-1">Item 1</div>
  <div class="flex-1">Item 2</div>
</div>

<!-- Hide/show at breakpoints -->
<nav class="hidden md:flex">Desktop Nav</nav>
<button class="md:hidden">Mobile Menu</button>
```

### State Variants
```html
<!-- Hover, focus, active -->
<button class="
  bg-blue-600 
  hover:bg-blue-700 
  focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  active:bg-blue-800
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Button
</button>

<!-- Group hover -->
<div class="group">
  <img class="group-hover:opacity-75 transition" />
  <div class="opacity-0 group-hover:opacity-100 transition">
    Overlay text
  </div>
</div>

<!-- Peer states (sibling) -->
<input class="peer" type="checkbox" />
<label class="peer-checked:text-blue-600">Checked label</label>

<!-- Focus-within -->
<div class="focus-within:ring-2 focus-within:ring-blue-500">
  <input type="text" />
</div>
```

### Dark Mode
```html
<!-- Class-based dark mode -->
<html class="dark">
  <body class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
    <div class="bg-gray-100 dark:bg-gray-800">
      Content
    </div>
  </body>
</html>

<!-- Media-based (automatic) -->
<!-- In tailwind.config.js: darkMode: 'media' -->
```

## Layout Patterns

### Flexbox
```html
<!-- Center content -->
<div class="flex items-center justify-center h-screen">
  Centered content
</div>

<!-- Space between -->
<div class="flex items-center justify-between">
  <span>Left</span>
  <span>Right</span>
</div>

<!-- Wrap items -->
<div class="flex flex-wrap gap-4">
  <div class="w-48">Item</div>
  <div class="w-48">Item</div>
  <div class="w-48">Item</div>
</div>
```

### Grid
```html
<!-- Basic grid -->
<div class="grid grid-cols-3 gap-4">
  <div>1</div>
  <div>2</div>
  <div>3</div>
</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  <!-- Items -->
</div>

<!-- Auto-fit grid -->
<div class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
  <!-- Auto-sizing columns -->
</div>

<!-- Named areas -->
<div class="grid grid-cols-[200px_1fr] grid-rows-[auto_1fr_auto] h-screen">
  <header class="col-span-2">Header</header>
  <aside>Sidebar</aside>
  <main>Content</main>
  <footer class="col-span-2">Footer</footer>
</div>
```

### Container
```html
<!-- Centered container with padding -->
<div class="container mx-auto px-4">
  Content
</div>

<!-- Max-width constraint -->
<div class="max-w-4xl mx-auto px-4">
  Content
</div>
```

## Component Patterns

### Buttons
```html
<!-- Primary button -->
<button class="
  inline-flex items-center justify-center
  px-4 py-2
  text-sm font-medium
  text-white bg-blue-600
  rounded-lg
  hover:bg-blue-700
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-colors
">
  <svg class="w-4 h-4 mr-2"><!-- icon --></svg>
  Button
</button>

<!-- Outline button -->
<button class="
  px-4 py-2
  text-sm font-medium
  text-blue-600
  border border-blue-600
  rounded-lg
  hover:bg-blue-50
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
">
  Outline
</button>

<!-- Ghost button -->
<button class="
  px-4 py-2
  text-sm font-medium
  text-gray-700
  rounded-lg
  hover:bg-gray-100
">
  Ghost
</button>
```

### Cards
```html
<article class="
  bg-white dark:bg-gray-800
  rounded-xl
  shadow-sm hover:shadow-md
  border border-gray-200 dark:border-gray-700
  overflow-hidden
  transition-shadow
">
  <img 
    class="w-full h-48 object-cover"
    src="image.jpg"
    alt=""
  />
  <div class="p-6">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
      Card Title
    </h3>
    <p class="mt-2 text-gray-600 dark:text-gray-300">
      Card description text
    </p>
    <div class="mt-4 flex items-center gap-4">
      <button class="text-blue-600 hover:underline">
        Learn more →
      </button>
    </div>
  </div>
</article>
```

### Forms
```html
<div class="space-y-4">
  <!-- Text input -->
  <div>
    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Email
    </label>
    <input 
      type="email"
      class="
        w-full px-3 py-2
        border border-gray-300 dark:border-gray-600
        rounded-lg
        bg-white dark:bg-gray-800
        text-gray-900 dark:text-white
        placeholder-gray-400
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        disabled:opacity-50 disabled:cursor-not-allowed
      "
      placeholder="you@example.com"
    />
  </div>

  <!-- With error -->
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">
      Password
    </label>
    <input 
      type="password"
      class="
        w-full px-3 py-2
        border border-red-500
        rounded-lg
        focus:outline-none focus:ring-2 focus:ring-red-500
      "
    />
    <p class="mt-1 text-sm text-red-500">
      Password must be at least 8 characters
    </p>
  </div>

  <!-- Checkbox -->
  <label class="flex items-center gap-2 cursor-pointer">
    <input 
      type="checkbox"
      class="
        w-4 h-4
        rounded
        border-gray-300
        text-blue-600
        focus:ring-blue-500
      "
    />
    <span class="text-sm text-gray-700">Remember me</span>
  </label>
</div>
```

## Custom Configuration

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // Custom colors
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          900: '#0c4a6e',
        },
      },
      // Custom fonts
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'sans-serif'],
      },
      // Custom spacing
      spacing: {
        '18': '4.5rem',
        '112': '28rem',
      },
      // Custom animations
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### Component Extraction (CSS)
```css
/* components.css */
@layer components {
  .btn {
    @apply inline-flex items-center justify-center
           px-4 py-2
           text-sm font-medium
           rounded-lg
           transition-colors
           focus:outline-none focus:ring-2 focus:ring-offset-2;
  }
  
  .btn-primary {
    @apply bg-blue-600 text-white
           hover:bg-blue-700
           focus:ring-blue-500;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-900
           hover:bg-gray-300
           focus:ring-gray-500;
  }
  
  .input {
    @apply w-full px-3 py-2
           border border-gray-300 dark:border-gray-600
           rounded-lg
           bg-white dark:bg-gray-800
           text-gray-900 dark:text-white
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
  }
}
```

### Component Extraction (React)
```tsx
// Better: Create React components
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  ghost: 'text-gray-700 hover:bg-gray-100',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
}
```

## Anti-Patterns

### ❌ Too Many Utilities (Consider Component)
```html
<!-- Bad: Repeated complex pattern -->
<button class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Button 1
</button>
<button class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Button 2
</button>

<!-- Good: Extract component -->
<Button>Button 1</Button>
<Button>Button 2</Button>
```

### ❌ Fighting the Framework
```html
<!-- Bad: Custom one-off values everywhere -->
<div class="mt-[13px] w-[437px] text-[15px]">

<!-- Good: Use design tokens or extend config -->
<div class="mt-3 w-96 text-base">
```

### ❌ Not Using Dark Mode Utilities
```html
<!-- Bad: Inline styles for dark mode -->
<div style="background: var(--bg)">

<!-- Good: Tailwind dark mode -->
<div class="bg-white dark:bg-gray-900">
```

### ❌ Ignoring Accessibility
```html
<!-- Bad: Focus styles removed -->
<button class="focus:outline-none">

<!-- Good: Custom focus styles -->
<button class="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
```

## Typography Plugin

```html
<!-- Prose for long-form content -->
<article class="prose prose-lg dark:prose-invert max-w-none">
  <h1>Article Title</h1>
  <p>First paragraph with <a href="#">a link</a> and <strong>bold text</strong>.</p>
  <ul>
    <li>List item one</li>
    <li>List item two</li>
  </ul>
  <pre><code>code block</code></pre>
</article>
```

## Utility Reference

```html
<!-- Common utilities cheatsheet -->

<!-- Spacing: p-{size}, m-{size}, gap-{size} -->
p-4 px-4 py-4 pt-4 pr-4 pb-4 pl-4
m-4 mx-4 my-4 mt-4 mr-4 mb-4 ml-4
gap-4 gap-x-4 gap-y-4
space-x-4 space-y-4

<!-- Sizing: w-{size}, h-{size} -->
w-full w-screen w-1/2 w-64 w-auto
h-full h-screen h-64 h-auto
min-w-0 max-w-md
min-h-0 max-h-screen

<!-- Flexbox -->
flex flex-col flex-row flex-wrap
items-start items-center items-end items-stretch
justify-start justify-center justify-end justify-between justify-around

<!-- Grid -->
grid grid-cols-3 grid-rows-2
col-span-2 row-span-2
gap-4

<!-- Typography -->
text-sm text-base text-lg text-xl text-2xl
font-normal font-medium font-semibold font-bold
text-left text-center text-right
leading-tight leading-normal leading-relaxed
tracking-tight tracking-normal tracking-wide

<!-- Colors -->
text-gray-900 text-blue-600
bg-white bg-gray-100
border-gray-300

<!-- Borders -->
border border-2 border-t border-b
rounded rounded-lg rounded-full
border-gray-200

<!-- Effects -->
shadow shadow-md shadow-lg
opacity-50 opacity-75
```
