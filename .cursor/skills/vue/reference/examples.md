# Vue.js Examples: What TO Do

## Composables (Reusable Logic)

### ✅ Well-Structured Composable
```js
// composables/useAsync.js
import { ref, shallowRef } from 'vue'

export function useAsync(asyncFn) {
  const data = shallowRef(null)
  const error = ref(null)
  const loading = ref(false)

  async function execute(...args) {
    loading.value = true
    error.value = null
    
    try {
      data.value = await asyncFn(...args)
      return data.value
    } catch (e) {
      error.value = e
      throw e
    } finally {
      loading.value = false
    }
  }

  return { data, error, loading, execute }
}

// Usage
const { data: user, loading, error, execute: fetchUser } = useAsync(
  (id) => api.getUser(id)
)

await fetchUser(userId)
```

### ✅ Composable with Cleanup
```js
// composables/useEventListener.js
import { onMounted, onUnmounted, unref } from 'vue'

export function useEventListener(target, event, handler) {
  onMounted(() => {
    unref(target).addEventListener(event, handler)
  })
  
  onUnmounted(() => {
    unref(target).removeEventListener(event, handler)
  })
}

// composables/useIntersectionObserver.js
export function useIntersectionObserver(target, callback, options = {}) {
  let observer = null

  onMounted(() => {
    observer = new IntersectionObserver(callback, options)
    observer.observe(unref(target))
  })

  onUnmounted(() => {
    observer?.disconnect()
  })
}
```

## Component Patterns

### ✅ Script Setup with TypeScript
```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// Props with defaults
interface Props {
  title: string
  items?: string[]
  maxItems?: number
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  maxItems: 10
})

// Emits with types
const emit = defineEmits<{
  select: [item: string]
  update: [items: string[]]
}>()

// Reactive state
const searchQuery = ref('')

// Computed
const filteredItems = computed(() => 
  props.items
    .filter(item => item.toLowerCase().includes(searchQuery.value.toLowerCase()))
    .slice(0, props.maxItems)
)

// Methods
function selectItem(item: string) {
  emit('select', item)
}

// Watchers
watch(searchQuery, (newQuery) => {
  console.log('Search query changed:', newQuery)
})
</script>

<template>
  <div class="item-picker">
    <h2>{{ title }}</h2>
    <input v-model="searchQuery" placeholder="Search..." />
    <ul>
      <li 
        v-for="item in filteredItems" 
        :key="item"
        @click="selectItem(item)"
      >
        {{ item }}
      </li>
    </ul>
    <p v-if="filteredItems.length === 0" class="empty">No items found</p>
  </div>
</template>
```

### ✅ Proper v-model Implementation
```vue
<!-- Parent -->
<script setup>
import { ref } from 'vue'
import RatingInput from './RatingInput.vue'

const rating = ref(3)
</script>

<template>
  <RatingInput v-model="rating" :max="5" />
  <p>Selected: {{ rating }} stars</p>
</template>

<!-- RatingInput.vue -->
<script setup lang="ts">
interface Props {
  max?: number
}

const props = withDefaults(defineProps<Props>(), {
  max: 5
})

const model = defineModel<number>({ default: 0 })
</script>

<template>
  <div class="rating" role="radiogroup" aria-label="Rating">
    <button
      v-for="n in max"
      :key="n"
      type="button"
      :class="{ active: n <= model }"
      :aria-checked="n === model"
      @click="model = n"
    >
      ★
    </button>
  </div>
</template>
```

### ✅ Slots with Fallback Content
```vue
<!-- Card.vue -->
<template>
  <article class="card">
    <header v-if="$slots.header" class="card-header">
      <slot name="header" />
    </header>
    
    <div class="card-body">
      <slot>
        <!-- Default content if no slot provided -->
        <p class="placeholder">No content provided</p>
      </slot>
    </div>
    
    <footer v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </footer>
  </article>
</template>

<!-- Usage -->
<Card>
  <template #header>
    <h3>Card Title</h3>
  </template>
  
  <p>Main content goes here</p>
  
  <template #footer>
    <button>Action</button>
  </template>
</Card>
```

### ✅ Scoped Slots for Flexibility
```vue
<!-- DataTable.vue -->
<script setup lang="ts" generic="T">
interface Props {
  items: T[]
  columns: Array<{ key: keyof T; label: string }>
}

defineProps<Props>()
</script>

<template>
  <table>
    <thead>
      <tr>
        <th v-for="col in columns" :key="String(col.key)">
          {{ col.label }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, index) in items" :key="index">
        <td v-for="col in columns" :key="String(col.key)">
          <!-- Allow custom cell rendering -->
          <slot :name="`cell-${String(col.key)}`" :item="item" :value="item[col.key]">
            {{ item[col.key] }}
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<!-- Usage -->
<DataTable :items="users" :columns="columns">
  <template #cell-status="{ value }">
    <StatusBadge :status="value" />
  </template>
  
  <template #cell-actions="{ item }">
    <button @click="editUser(item)">Edit</button>
  </template>
</DataTable>
```

## State Management (Pinia)

### ✅ Composition Store Pattern
```js
// stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const userName = computed(() => user.value?.name ?? 'Guest')

  // Actions
  async function login(credentials) {
    const response = await api.login(credentials)
    token.value = response.token
    user.value = response.user
    localStorage.setItem('token', response.token)
  }

  async function logout() {
    await api.logout()
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  async function fetchUser() {
    if (token.value && !user.value) {
      user.value = await api.getCurrentUser()
    }
  }

  return { 
    user, 
    token, 
    isAuthenticated, 
    userName,
    login, 
    logout, 
    fetchUser 
  }
})
```

## Async Components

### ✅ Lazy Loading with Suspense
```vue
<script setup>
import { defineAsyncComponent } from 'vue'

const HeavyChart = defineAsyncComponent({
  loader: () => import('./HeavyChart.vue'),
  loadingComponent: () => import('./ChartSkeleton.vue'),
  errorComponent: () => import('./ChartError.vue'),
  delay: 200,
  timeout: 10000
})
</script>

<template>
  <Suspense>
    <HeavyChart :data="chartData" />
    
    <template #fallback>
      <div class="loading">Loading chart...</div>
    </template>
  </Suspense>
</template>
```

## Transitions

### ✅ List Transitions
```vue
<script setup>
import { ref } from 'vue'

const items = ref([])

function addItem() {
  items.value.push({ id: Date.now(), text: 'New Item' })
}

function removeItem(id) {
  items.value = items.value.filter(i => i.id !== id)
}
</script>

<template>
  <button @click="addItem">Add Item</button>
  
  <TransitionGroup name="list" tag="ul">
    <li v-for="item in items" :key="item.id">
      {{ item.text }}
      <button @click="removeItem(item.id)">×</button>
    </li>
  </TransitionGroup>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-active {
  position: absolute;
}
</style>
```

## DON'T (Not Good)

### Bad Request Example

```text
Run /vue and make it better.
```

Why this is not good:
- Too vague, no clear scope or success criteria.
- Missing constraints, so the result may break expectations.
- No validation steps, so quality cannot be trusted.

### Better Alternative

```text
Run /vue on a specific area, list constraints, and include tests or verification checks.
```
