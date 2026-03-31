---
name: svelte
description: Expert Svelte development with reactive statements, stores, and component patterns
---

# Svelte Specialist

You are an expert Svelte developer. Apply these principles when building Svelte applications.

## Core Philosophy

- **Less boilerplate** — Write less, do more
- **True reactivity** — No virtual DOM, surgical updates
- **Compile-time magic** — Shift work to build time
- **Progressive enhancement** — SvelteKit for full-stack

## Reactivity

### Reactive Declarations
```svelte
<script>
  let count = 0
  let name = 'World'
  
  // Reactive statements - run when dependencies change
  $: doubled = count * 2
  $: greeting = `Hello, ${name}!`
  
  // Reactive blocks
  $: {
    console.log('count changed to', count)
    if (count > 10) {
      alert('Count is high!')
    }
  }
  
  // Reactive if
  $: if (count > 5) {
    console.log('Count is over 5')
  }
</script>

<button on:click={() => count++}>
  Clicked {count} times (doubled: {doubled})
</button>
```

### Reactive Stores
```javascript
// stores.js
import { writable, readable, derived } from 'svelte/store'

// Writable store
export const count = writable(0)

// With custom methods
function createCounter() {
  const { subscribe, set, update } = writable(0)
  
  return {
    subscribe,
    increment: () => update(n => n + 1),
    decrement: () => update(n => n - 1),
    reset: () => set(0)
  }
}
export const counter = createCounter()

// Readable store (external source)
export const time = readable(new Date(), (set) => {
  const interval = setInterval(() => set(new Date()), 1000)
  return () => clearInterval(interval)
})

// Derived store
export const doubled = derived(count, $count => $count * 2)

// Multiple sources
export const combined = derived(
  [firstName, lastName],
  ([$firstName, $lastName]) => `${$firstName} ${$lastName}`
)
```

```svelte
<script>
  import { count, counter } from './stores.js'
  
  // Auto-subscription with $
  $: console.log('count is', $count)
</script>

<p>Count: {$count}</p>
<button on:click={() => $count++}>Increment</button>
<button on:click={counter.reset}>Reset</button>
```

## Component Patterns

### Props
```svelte
<script>
  // Simple prop
  export let name
  
  // With default
  export let greeting = 'Hello'
  
  // Required (no default = required)
  export let id
  
  // Readonly (const exported)
  export const version = '1.0.0'
  
  // Spread props
  export let props = {}
</script>

<h1>{greeting}, {name}!</h1>

<!-- Usage -->
<Greeting name="World" />
<Greeting name="World" greeting="Hi" />
```

### Events
```svelte
<!-- Child component -->
<script>
  import { createEventDispatcher } from 'svelte'
  
  const dispatch = createEventDispatcher()
  
  function handleClick() {
    dispatch('message', { text: 'Hello from child!' })
  }
</script>

<button on:click={handleClick}>Send Message</button>

<!-- Parent component -->
<script>
  function handleMessage(event) {
    console.log(event.detail.text)
  }
</script>

<Child on:message={handleMessage} />

<!-- Event forwarding -->
<button on:click>Click me</button>  <!-- Forwards to parent -->
```

### Slots
```svelte
<!-- Card.svelte -->
<div class="card">
  <slot name="header" />
  
  <div class="content">
    <slot>
      <!-- Default content if no slot provided -->
      <p>No content provided</p>
    </slot>
  </div>
  
  <slot name="footer" />
</div>

<!-- Usage -->
<Card>
  <h2 slot="header">Card Title</h2>
  
  <p>Main content goes here</p>
  
  <button slot="footer">Action</button>
</Card>

<!-- Slot props -->
<List items={users} let:item let:index>
  <span>{index + 1}. {item.name}</span>
</List>
```

### Bindings
```svelte
<script>
  let name = ''
  let selected = 'a'
  let checked = false
  let group = []
  let textarea = ''
  let element
</script>

<!-- Input binding -->
<input bind:value={name} />

<!-- Checkbox -->
<input type="checkbox" bind:checked />

<!-- Radio group -->
<input type="radio" bind:group value="a" /> A
<input type="radio" bind:group value="b" /> B

<!-- Select -->
<select bind:value={selected}>
  <option value="a">A</option>
  <option value="b">B</option>
</select>

<!-- Textarea -->
<textarea bind:value={textarea} />

<!-- Element reference -->
<div bind:this={element}>...</div>

<!-- Component binding -->
<MyInput bind:value={name} />
```

## Lifecycle

```svelte
<script>
  import { onMount, onDestroy, beforeUpdate, afterUpdate, tick } from 'svelte'
  
  // After component mounts to DOM
  onMount(() => {
    console.log('Mounted')
    const interval = setInterval(() => {}, 1000)
    
    // Return cleanup function
    return () => clearInterval(interval)
  })
  
  // Before component is destroyed
  onDestroy(() => {
    console.log('Destroyed')
  })
  
  // Before DOM updates
  beforeUpdate(() => {
    console.log('About to update')
  })
  
  // After DOM updates
  afterUpdate(() => {
    console.log('Updated')
  })
  
  // Wait for DOM update
  async function handleClick() {
    count++
    await tick()  // Wait for DOM to update
    console.log('DOM updated')
  }
</script>
```

## Control Flow

```svelte
<!-- If/else -->
{#if condition}
  <p>True</p>
{:else if otherCondition}
  <p>Other true</p>
{:else}
  <p>False</p>
{/if}

<!-- Each -->
{#each items as item, index (item.id)}
  <li>{index}: {item.name}</li>
{:else}
  <li>No items</li>
{/each}

<!-- Await -->
{#await promise}
  <p>Loading...</p>
{:then value}
  <p>Got: {value}</p>
{:catch error}
  <p>Error: {error.message}</p>
{/await}

<!-- Key block (force re-render) -->
{#key selectedId}
  <Component />
{/key}
```

## Transitions & Animations

```svelte
<script>
  import { fade, fly, slide, scale, draw } from 'svelte/transition'
  import { flip } from 'svelte/animate'
  import { quintOut } from 'svelte/easing'
  
  let visible = true
  let items = []
</script>

<!-- Simple transition -->
{#if visible}
  <p transition:fade>Fades in and out</p>
{/if}

<!-- With parameters -->
{#if visible}
  <p transition:fly={{ y: 200, duration: 500 }}>Flies in</p>
{/if}

<!-- Separate in/out -->
{#if visible}
  <p in:fly={{ y: -50 }} out:fade>Different in/out</p>
{/if}

<!-- List animations -->
{#each items as item (item.id)}
  <li 
    animate:flip={{ duration: 300 }}
    in:slide
    out:fade
  >
    {item.name}
  </li>
{/each}

<!-- Custom transition -->
<script>
  function typewriter(node, { speed = 1 }) {
    const text = node.textContent
    const duration = text.length / (speed * 0.01)
    
    return {
      duration,
      tick: t => {
        const i = Math.trunc(text.length * t)
        node.textContent = text.slice(0, i)
      }
    }
  }
</script>

<p transition:typewriter>Hello World</p>
```

## SvelteKit

### Routing
```
src/routes/
├── +page.svelte          → /
├── +layout.svelte        → Shared layout
├── about/
│   └── +page.svelte      → /about
├── blog/
│   ├── +page.svelte      → /blog
│   └── [slug]/
│       └── +page.svelte  → /blog/:slug
└── api/
    └── users/
        └── +server.js    → /api/users
```

### Load Functions
```javascript
// +page.js (client + server)
export async function load({ params, fetch }) {
  const response = await fetch(`/api/posts/${params.slug}`)
  const post = await response.json()
  
  return { post }
}

// +page.server.js (server only)
export async function load({ params }) {
  const post = await db.post.findUnique({
    where: { slug: params.slug }
  })
  
  return { post }
}
```

```svelte
<!-- +page.svelte -->
<script>
  export let data  // Receives load() return value
</script>

<h1>{data.post.title}</h1>
```

### Form Actions
```javascript
// +page.server.js
export const actions = {
  default: async ({ request }) => {
    const data = await request.formData()
    const email = data.get('email')
    
    // Validate, save, etc.
    await db.user.create({ data: { email } })
    
    return { success: true }
  },
  
  login: async ({ request, cookies }) => {
    // Named action
  },
  
  logout: async ({ cookies }) => {
    cookies.delete('session')
  }
}
```

```svelte
<form method="POST">
  <input name="email" type="email" required />
  <button>Subscribe</button>
</form>

<!-- Named action -->
<form method="POST" action="?/login">
  ...
</form>
```

## Anti-Patterns

### ❌ Mutating Arrays/Objects Without Assignment
```svelte
<script>
  let items = ['a', 'b', 'c']
  
  // ❌ Won't trigger reactivity
  function addBad() {
    items.push('d')
  }
  
  // ✅ Triggers reactivity
  function addGood() {
    items = [...items, 'd']
  }
  
  // ✅ Or reassign
  function addAlsoGood() {
    items.push('d')
    items = items
  }
</script>
```

### ❌ Over-using Stores for Local State
```svelte
<!-- ❌ Store for single-component state -->
<script>
  import { writable } from 'svelte/store'
  const isOpen = writable(false)  // Overkill!
</script>

<!-- ✅ Simple let variable -->
<script>
  let isOpen = false
</script>
```

### ❌ Not Using $ Auto-subscription
```svelte
<script>
  import { count } from './stores.js'
  
  // ❌ Manual subscription
  let value
  const unsubscribe = count.subscribe(v => value = v)
  onDestroy(unsubscribe)
  
  // ✅ Auto-subscription
  $: console.log($count)
</script>

<p>{$count}</p>
```

## TypeScript Support

```svelte
<script lang="ts">
  interface User {
    id: string
    name: string
    email: string
  }
  
  export let user: User
  export let onSave: (user: User) => void
  
  let count: number = 0
</script>
```