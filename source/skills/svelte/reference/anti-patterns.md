# Svelte Anti-Patterns

## ❌ Mutating Props Directly
```svelte
<!-- Bad -->
<script>
  export let items = []
  
  function addItem() {
    items.push(newItem)  // Mutating prop!
  }
</script>

<!-- Good: Dispatch event to parent -->
<script>
  import { createEventDispatcher } from 'svelte'
  
  export let items = []
  const dispatch = createEventDispatcher()
  
  function addItem() {
    dispatch('add', newItem)
  }
</script>
```

## ❌ Forgetting Reactive Statements
```svelte
<!-- Bad: total won't update -->
<script>
  export let items = []
  let total = items.reduce((sum, i) => sum + i.price, 0)
</script>

<!-- Good: Use reactive declaration -->
<script>
  export let items = []
  $: total = items.reduce((sum, i) => sum + i.price, 0)
</script>
```

## ❌ Store Subscription Leaks
```svelte
<!-- Bad: Manual subscribe without cleanup -->
<script>
  import { myStore } from './stores'
  
  let value
  myStore.subscribe(v => value = v)  // Memory leak!
</script>

<!-- Good: Auto-subscription with $ -->
<script>
  import { myStore } from './stores'
</script>

<p>{$myStore}</p>

<!-- Or manual with cleanup -->
<script>
  import { onDestroy } from 'svelte'
  import { myStore } from './stores'
  
  let value
  const unsubscribe = myStore.subscribe(v => value = v)
  onDestroy(unsubscribe)
</script>
```

## ❌ Unnecessary Component Splits
```svelte
<!-- Bad: Over-engineering simple UI -->
<!-- TitleText.svelte -->
<h1><slot /></h1>

<!-- Just use HTML -->
<h1>Title</h1>
```

## ❌ Not Using Keyed Each
```svelte
<!-- Bad: Items may not update correctly -->
{#each items as item}
  <Item data={item} />
{/each}

<!-- Good: Use keys for proper updates -->
{#each items as item (item.id)}
  <Item data={item} />
{/each}
```

## ❌ Inline Event Handlers with Side Effects
```svelte
<!-- Bad: Hard to test, no reuse -->
<button on:click={() => {
  loading = true
  fetch('/api/data')
    .then(r => r.json())
    .then(data => { items = data })
    .finally(() => loading = false)
}}>
  Load
</button>

<!-- Good: Extract to function -->
<script>
  async function loadData() {
    loading = true
    try {
      items = await fetch('/api/data').then(r => r.json())
    } finally {
      loading = false
    }
  }
</script>

<button on:click={loadData}>Load</button>
```

## ❌ Global Store for Local State
```svelte
<!-- Bad: Using store for single-component state -->
<script>
  import { writable } from 'svelte/store'
  const isOpen = writable(false)
</script>

<!-- Good: Local state -->
<script>
  let isOpen = false
</script>
```

## ❌ Ignoring Accessibility
```svelte
<!-- Bad -->
<div on:click={toggle}>Toggle</div>

<!-- Good -->
<button on:click={toggle}>Toggle</button>

<!-- Or with proper ARIA -->
<div
  role="button"
  tabindex="0"
  on:click={toggle}
  on:keydown={(e) => e.key === 'Enter' && toggle()}
>
  Toggle
</div>
```
