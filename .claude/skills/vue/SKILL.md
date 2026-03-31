---
name: vue
description: 
---

---
name: vue
description: Expert Vue.js development with Composition API, reactivity system, and component patterns
---

# Vue.js Specialist

You are an expert Vue.js developer. Apply these principles when building Vue applications.

## Core Philosophy

- **Progressive framework** — Use only what you need
- **Reactivity at the core** — Automatic dependency tracking
- **Single File Components** — Template, script, style together
- **Options vs Composition** — Prefer Composition API for complex logic

## Composition API Patterns

### Composables (Reusable Logic)
```vue
<script setup>
// useUser.js - Composable
import { ref, computed, watchEffect } from 'vue'

export function useUser(userId) {
  const user = ref(null)
  const loading = ref(true)
  const error = ref(null)
  
  const fullName = computed(() => 
    user.value ? `${user.value.firstName} ${user.value.lastName}` : ''
  )
  
  watchEffect(async () => {
    loading.value = true
    try {
      user.value = await fetchUser(userId.value)
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  })
  
  return { user, loading, error, fullName }
}
</script>
```

### Script Setup (Recommended)
```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUser } from '@/composables/useUser'

const props = defineProps<{
  userId: string
}>()

const emit = defineEmits<{
  update: [user: User]
}>()

const { user, loading } = useUser(toRef(props, 'userId'))

const handleSave = () => {
  emit('update', user.value)
}
</script>

<template>
  <div v-if="loading">Loading...</div>
  <UserForm v-else :user="user" @save="handleSave" />
</template>
```

## Reactivity Deep Dive

### ref vs reactive
```js
// ref: For primitives or when you need .value
const count = ref(0)
count.value++

// reactive: For objects, no .value needed
const state = reactive({
  count: 0,
  user: null
})
state.count++

// ✅ Prefer ref for most cases (more predictable)
```

### Computed Properties
```js
// ✅ Cached, only recalculates when dependencies change
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

// ✅ Writable computed
const fullName = computed({
  get: () => `${firstName.value} ${lastName.value}`,
  set: (val) => {
    const [first, last] = val.split(' ')
    firstName.value = first
    lastName.value = last
  }
})
```

### Watch vs WatchEffect
```js
// watch: Explicit dependencies, access old value
watch(userId, async (newId, oldId) => {
  user.value = await fetchUser(newId)
}, { immediate: true })

// watchEffect: Auto-track dependencies
watchEffect(async () => {
  user.value = await fetchUser(userId.value)
})
```

## Component Patterns

### Props with Defaults
```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
  items?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  items: () => []  // Factory for non-primitives
})
</script>
```

### v-model on Components
```vue
<!-- Parent -->
<CustomInput v-model="searchQuery" />
<CustomInput v-model:firstName="first" v-model:lastName="last" />

<!-- CustomInput.vue -->
<script setup>
const model = defineModel<string>()
// or with options
const firstName = defineModel('firstName')
const lastName = defineModel('lastName')
</script>

<template>
  <input :value="model" @input="model = $event.target.value" />
</template>
```

### Provide/Inject (Dependency Injection)
```js
// Parent provides
const theme = ref('dark')
provide('theme', theme)

// Child injects (any depth)
const theme = inject('theme', 'light')  // with default
```

### Slots
```vue
<!-- Named slots -->
<template>
  <div class="card">
    <header><slot name="header" /></header>
    <main><slot /></main>  <!-- default slot -->
    <footer><slot name="footer" /></footer>
  </div>
</template>

<!-- Scoped slots -->
<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      <slot :item="item" :index="index">
        {{ item.name }}  <!-- fallback -->
      </slot>
    </li>
  </ul>
</template>
```

## State Management (Pinia)

```js
// stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const isLoggedIn = computed(() => !!user.value)
  
  async function login(credentials) {
    user.value = await authApi.login(credentials)
  }
  
  function logout() {
    user.value = null
  }
  
  return { user, isLoggedIn, login, logout }
})

// Usage in component
const userStore = useUserStore()
await userStore.login({ email, password })
```

## Performance Patterns

### Lazy Loading
```js
// Router lazy loading
const routes = [
  {
    path: '/dashboard',
    component: () => import('./views/Dashboard.vue')
  }
]

// Async components
const AsyncModal = defineAsyncComponent(() => 
  import('./components/HeavyModal.vue')
)
```

### v-once, v-memo
```vue
<!-- Render once, never update -->
<footer v-once>{{ copyright }}</footer>

<!-- Memoize based on dependencies -->
<div v-memo="[item.id, selected === item.id]">
  <!-- Only re-renders when id or selection changes -->
</div>
```

### List Virtualization
```vue
<script setup>
import { RecycleScroller } from 'vue-virtual-scroller'
</script>

<template>
  <RecycleScroller
    :items="largeList"
    :item-size="50"
    v-slot="{ item }"
  >
    <ListItem :item="item" />
  </RecycleScroller>
</template>
```

## Anti-Patterns to Avoid

### ❌ Mutating Props
```js
// Bad
props.user.name = 'New Name'

// Good: Emit event to parent
emit('update:user', { ...props.user, name: 'New Name' })
```

### ❌ Direct DOM Manipulation
```js
// Bad
document.querySelector('.my-element').style.color = 'red'

// Good: Use refs and reactive binding
const el = ref(null)
const color = ref('red')
// <div ref="el" :style="{ color }">
```

### ❌ Watchers for Everything
```js
// Bad: Watch just to sync derived state
watch([firstName, lastName], () => {
  fullName.value = `${firstName.value} ${lastName.value}`
})

// Good: Use computed
const fullName = computed(() => `${firstName.value} ${lastName.value}`)
```

## File Structure

```
src/
├── components/          # Shared UI components
│   ├── ui/             # Base components (Button, Input)
│   └── layout/         # Layout components
├── composables/        # Reusable composition functions
├── stores/             # Pinia stores
├── views/              # Route-level components
├── router/             # Vue Router config
├── utils/              # Pure utility functions
├── types/              # TypeScript types
└── App.vue
```

## Testing

```js
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'

test('displays user name after login', async () => {
  const wrapper = mount(UserProfile, {
    global: {
      plugins: [createTestingPinia({
        initialState: {
          user: { user: { name: 'John' } }
        }
      })]
    }
  })
  
  expect(wrapper.text()).toContain('John')
})
```
