# Svelte Examples - Good Patterns

## ✅ Good: Reactive Declarations
```svelte
<script>
  let count = 0
  let doubled = $: count * 2
  let quadrupled = $: doubled * 2
  
  // Reactive statements
  $: if (count > 10) {
    console.log('Count exceeded 10')
  }
  
  $: {
    console.log('Count changed:', count)
    console.log('Doubled:', doubled)
  }
</script>

<button on:click={() => count++}>
  Count: {count}, Doubled: {doubled}
</button>
```

## ✅ Good: Component Composition
```svelte
<!-- Card.svelte -->
<script>
  export let title
  export let variant = 'default'
</script>

<article class="card card--{variant}">
  <header>
    <slot name="header">{title}</slot>
  </header>
  <div class="content">
    <slot />
  </div>
  <footer>
    <slot name="footer" />
  </footer>
</article>

<!-- Usage -->
<Card title="My Card" variant="primary">
  <span slot="header">Custom Header</span>
  <p>Card content here</p>
  <button slot="footer">Action</button>
</Card>
```

## ✅ Good: Stores for State
```typescript
// stores/counter.ts
import { writable, derived } from 'svelte/store'

export const count = writable(0)
export const doubled = derived(count, $count => $count * 2)

export function increment() {
  count.update(n => n + 1)
}

export function reset() {
  count.set(0)
}

// Component usage
<script>
  import { count, doubled, increment } from './stores/counter'
</script>

<p>Count: {$count}, Doubled: {$doubled}</p>
<button on:click={increment}>+1</button>
```

## ✅ Good: Actions for Reusable Behavior
```svelte
<script>
  function clickOutside(node, callback) {
    const handleClick = (event) => {
      if (!node.contains(event.target)) {
        callback()
      }
    }
    
    document.addEventListener('click', handleClick, true)
    
    return {
      destroy() {
        document.removeEventListener('click', handleClick, true)
      }
    }
  }
  
  let open = false
</script>

<div use:clickOutside={() => open = false}>
  {#if open}
    <div class="dropdown">Menu content</div>
  {/if}
</div>
```

## ✅ Good: Transitions
```svelte
<script>
  import { fade, fly, slide } from 'svelte/transition'
  import { quintOut } from 'svelte/easing'
  
  let visible = true
</script>

{#if visible}
  <div 
    in:fly={{ y: 200, duration: 500, easing: quintOut }}
    out:fade={{ duration: 200 }}
  >
    Animated content
  </div>
{/if}

<!-- List animations -->
{#each items as item (item.id)}
  <div transition:slide={{ duration: 300 }}>
    {item.name}
  </div>
{/each}
```

## ✅ Good: Svelte 5 Runes (Preview)
```svelte
<script>
  // State
  let count = $state(0)
  
  // Derived
  let doubled = $derived(count * 2)
  
  // Effects
  $effect(() => {
    console.log('Count is now:', count)
  })
  
  // Props with defaults
  let { title = 'Default', onSave } = $props()
</script>
```

## ✅ Good: Form Handling
```svelte
<script>
  let form = {
    email: '',
    password: ''
  }
  let errors = {}
  let submitting = false
  
  async function handleSubmit() {
    errors = validate(form)
    if (Object.keys(errors).length) return
    
    submitting = true
    try {
      await submitForm(form)
    } catch (e) {
      errors.form = e.message
    } finally {
      submitting = false
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <input 
    bind:value={form.email}
    class:error={errors.email}
  />
  {#if errors.email}
    <span class="error">{errors.email}</span>
  {/if}
  
  <button disabled={submitting}>
    {submitting ? 'Submitting...' : 'Submit'}
  </button>
</form>
```

## DON'T (Not Good)

### Bad Request Example

```text
Run /svelte and make it better.
```

Why this is not good:
- Too vague, no clear scope or success criteria.
- Missing constraints, so the result may break expectations.
- No validation steps, so quality cannot be trusted.

### Better Alternative

```text
Run /svelte on a specific area, list constraints, and include tests or verification checks.
```
