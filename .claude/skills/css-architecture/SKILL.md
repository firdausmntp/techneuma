---
name: css-architecture
description: Expert CSS architecture with modern patterns, custom properties, container queries, layers, and scalable design systems
---

# CSS Architecture Specialist

You are an expert in modern CSS architecture. Apply these principles for scalable, maintainable, and high-performance stylesheets.

## Core Philosophy

- **Progressive enhancement** — Build on a solid CSS baseline, layer enhancement
- **Intrinsic design** — Let content and context drive sizing, not fixed breakpoints
- **Custom properties as API** — Expose theming and configuration through CSS variables
- **Cascade layers** — Control specificity explicitly instead of fighting it

## Cascade Layers

### Ordering Specificity Explicitly
```css
/* Define layer order — later layers win in specificity */
@layer reset, base, tokens, components, utilities, overrides;

@layer reset {
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
}

@layer tokens {
  :root {
    --color-primary: oklch(65% 0.25 260);
    --color-surface: oklch(98% 0.01 260);
    --space-xs: clamp(0.25rem, 0.5vw, 0.5rem);
    --space-s: clamp(0.5rem, 1vw, 0.75rem);
    --space-m: clamp(1rem, 2vw, 1.5rem);
    --space-l: clamp(1.5rem, 3vw, 2.5rem);
    --space-xl: clamp(2rem, 5vw, 4rem);
  }
}

@layer components {
  .card {
    background: var(--color-surface);
    padding: var(--space-m);
    border-radius: 12px;
  }
}

@layer utilities {
  .visually-hidden {
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    width: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
  }
}
```

## Custom Properties Design System

### Component API with CSS Variables
```css
/* Button component with a customizable API */
.btn {
  --_bg: var(--btn-bg, var(--color-primary));
  --_color: var(--btn-color, white);
  --_size: var(--btn-size, var(--space-s) var(--space-m));
  --_radius: var(--btn-radius, 8px);

  background: var(--_bg);
  color: var(--_color);
  padding: var(--_size);
  border-radius: var(--_radius);
  border: none;
  font: inherit;
  cursor: pointer;
  transition: filter 0.15s ease;
}

.btn:hover {
  filter: brightness(1.1);
}

/* Variant via custom property override — no extra class needed */
.btn-danger {
  --btn-bg: var(--color-danger);
}
```

### Dark Mode with Custom Properties
```css
:root {
  color-scheme: light dark;

  --surface-1: oklch(98% 0.01 260);
  --surface-2: oklch(94% 0.01 260);
  --text-1: oklch(20% 0.01 260);
  --text-2: oklch(40% 0.02 260);
}

@media (prefers-color-scheme: dark) {
  :root {
    --surface-1: oklch(15% 0.01 260);
    --surface-2: oklch(22% 0.01 260);
    --text-1: oklch(90% 0.01 260);
    --text-2: oklch(70% 0.02 260);
  }
}
```

## Container Queries

### Component-Scoped Responsive Design
```css
/* The parent defines the container */
.card-grid {
  container-type: inline-size;
  container-name: card-grid;
}

/* Children respond to parent's size, not viewport */
@container card-grid (min-width: 600px) {
  .card {
    grid-template-columns: 200px 1fr;
  }
}

@container card-grid (min-width: 900px) {
  .card {
    grid-template-columns: 300px 1fr auto;
  }
}
```

### Container Query Units
```css
.card-title {
  /* Font size scales with container width */
  font-size: clamp(1rem, 3cqi, 1.5rem);
}
```

## Modern Layout

### Fluid Grid with Auto-Fill
```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
  gap: var(--space-m);
}
```

### Sidebar Layout (Intrinsic)
```css
.with-sidebar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-m);
}

.with-sidebar > :first-child {
  flex-basis: 300px;
  flex-grow: 1;
}

.with-sidebar > :last-child {
  flex-basis: 0;
  flex-grow: 999;
  min-inline-size: 60%;
}
```

### Stack Layout
```css
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-m);
}

.stack-large { --space-m: var(--space-l); }
.stack-small { --space-m: var(--space-s); }
```

## Fluid Typography

```css
:root {
  /* Min (mobile) → Max (desktop) via clamp */
  --step--1: clamp(0.8rem, 0.75rem + 0.25vw, 0.9rem);
  --step-0: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --step-1: clamp(1.2rem, 1rem + 1vw, 1.5rem);
  --step-2: clamp(1.44rem, 1.1rem + 1.7vw, 2rem);
  --step-3: clamp(1.73rem, 1.2rem + 2.65vw, 2.67rem);
  --step-4: clamp(2.07rem, 1.2rem + 4.35vw, 3.55rem);
}

body { font-size: var(--step-0); }
h1   { font-size: var(--step-4); }
h2   { font-size: var(--step-3); }
h3   { font-size: var(--step-2); }
small { font-size: var(--step--1); }
```

## Scroll-Driven Animations

```css
@keyframes fade-in {
  from { opacity: 0; translate: 0 2rem; }
  to   { opacity: 1; translate: 0 0; }
}

.reveal {
  animation: fade-in linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}
```

## Modern Selectors

```css
/* :has() — parent selector */
.card:has(img) {
  grid-template-rows: auto 1fr;
}

form:has(:invalid) button[type="submit"] {
  opacity: 0.5;
  pointer-events: none;
}

/* :is() / :where() — grouping */
:is(h1, h2, h3) {
  line-height: 1.2;
  text-wrap: balance;
}

:where(ul, ol) {
  padding-inline-start: 1em;
}

/* nesting */
.card {
  background: var(--surface-1);
  
  & .title {
    font-size: var(--step-1);
  }

  &:hover {
    box-shadow: 0 4px 12px oklch(0% 0 0 / 10%);
  }
}
```

## DO

- Use `oklch()` or `oklch()` for perceptually uniform color spaces
- Use `clamp()` for fluid sizing — typography, spacing, container widths
- Use CSS layers (`@layer`) to avoid specificity wars
- Use container queries for component-level responsive behavior
- Use `text-wrap: balance` on headings and `text-wrap: pretty` on paragraphs
- Use logical properties (`inline`, `block`) over directional (`left`, `right`)
- Use `color-scheme: light dark` for automatic system-level theming

## DON'T

- Don't use `!important` — restructure layers instead
- Don't use pixel-based media queries for layout — prefer container queries
- Don't hardcode colors — use custom properties for theming
- Don't nest deeper than 3 levels — keep selectors flat and predictable
- Don't use `float` for layout — use Grid or Flexbox
- Don't set `font-size` in `px` — use `rem` with fluid `clamp()`
- Don't create utility classes for one-off styles — use the component layer