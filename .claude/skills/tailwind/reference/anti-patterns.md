# Tailwind Anti-Patterns

## ❌ Inline Style Soup
```html
<!-- Bad: Unreadable, unmaintainable -->
<div class="flex flex-col items-center justify-center p-4 m-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:flex-row md:p-6 lg:p-8">
```

```jsx
// Good: Extract to component
function Card({ children, className }) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center',
      'p-4 m-2 rounded-lg shadow-md',
      'bg-blue-500 text-white font-bold',
      'hover:bg-blue-600 hover:shadow-lg',
      'transition-all duration-200',
      'sm:flex-row md:p-6 lg:p-8',
      className
    )}>
      {children}
    </div>
  )
}
```

## ❌ Fighting Tailwind with !important
```html
<!-- Bad -->
<div class="!m-0 !p-0 !bg-red-500">

<!-- Good: Use proper specificity or override correctly -->
<div class="m-0 p-0 bg-red-500">

<!-- Or use @layer for custom overrides -->
```

## ❌ Hardcoded Values
```html
<!-- Bad: Magic numbers -->
<div class="w-[347px] h-[89px] mt-[13px]">

<!-- Good: Use design tokens -->
<div class="w-80 h-24 mt-3">

<!-- If custom needed, add to config -->
```

## ❌ Not Using Design System
```html
<!-- Bad: Random colors -->
<div class="text-[#3b82f6] bg-[#fef3c7]">

<!-- Good: Use theme colors -->
<div class="text-blue-500 bg-amber-100">

<!-- Or define in tailwind.config.js -->
<div class="text-brand-primary bg-brand-accent">
```

## ❌ Duplicating Classes Across Files
```html
<!-- Bad: Same button in 10 files -->
<!-- file1.jsx -->
<button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
<!-- file2.jsx -->
<button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">

<!-- Good: Create reusable component -->
<Button variant="primary">Click</Button>
```

## ❌ Not Using @apply Correctly
```css
/* Bad: @apply for everything */
.btn {
  @apply flex items-center justify-center bg-blue-500 text-white;
}

/* Good: Use @apply sparingly, prefer components */
/* Only for base styles that truly need CSS */
.prose-custom h1 {
  @apply text-2xl font-bold mb-4;
}
```

## ❌ Ignoring Mobile-First
```html
<!-- Bad: Desktop-first with overrides -->
<div class="flex-row sm:flex-col">

<!-- Good: Mobile-first -->
<div class="flex-col sm:flex-row">
```
