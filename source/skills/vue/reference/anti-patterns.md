# Vue.js Anti-Patterns: What NOT To Do

## Reactivity Anti-Patterns

### ❌ Destructuring Reactive Objects
```js
// BAD: Loses reactivity!
const state = reactive({ count: 0, name: 'John' })
const { count, name } = state  // ❌ count and name are NOT reactive!

// After this, changes to state.count won't update count variable
state.count++  // state.count = 1
console.log(count)  // Still 0!

// GOOD: Use toRefs or access directly
const state = reactive({ count: 0, name: 'John' })
const { count, name } = toRefs(state)  // ✅ Now they're refs!

// Or just use refs from the start
const count = ref(0)
const name = ref('John')
```

**Why it's bad:**
- Primitive values get disconnected from reactive source
- UI won't update when you expect it to
- Silent bug that's hard to debug

---

### ❌ Replacing Entire Reactive Object
```js
// BAD: Replacing reactive object breaks reactivity
let state = reactive({ count: 0 })

function reset() {
  state = reactive({ count: 0 })  // ❌ New object, old references broken!
}

// GOOD: Mutate properties or use ref
const state = reactive({ count: 0 })

function reset() {
  state.count = 0  // ✅ Mutate property
}

// Or use ref for the whole object
const state = ref({ count: 0 })

function reset() {
  state.value = { count: 0 }  // ✅ Ref handles replacement
}
```

---

### ❌ Async Modification Without Checking
```js
// BAD: No guard for component unmount
async function loadData() {
  const data = await fetchData()
  items.value = data  // ❌ Component might be unmounted!
}

// GOOD: Check if still mounted
import { onUnmounted, ref } from 'vue'

const items = ref([])
let isMounted = true

onUnmounted(() => {
  isMounted = false
})

async function loadData() {
  const data = await fetchData()
  if (isMounted) {
    items.value = data  // ✅ Only update if mounted
  }
}
```

## Component Anti-Patterns

### ❌ Mutating Props Directly
```vue
<!-- BAD: Mutating props -->
<script setup>
const props = defineProps(['user'])

function updateName(newName) {
  props.user.name = newName  // ❌ Mutating prop object!
}
</script>

<!-- GOOD: Emit event to parent -->
<script setup>
const props = defineProps(['user'])
const emit = defineEmits(['update:user'])

function updateName(newName) {
  emit('update:user', { ...props.user, name: newName })  // ✅
}
</script>
```

**Why it's bad:**
- Breaks one-way data flow
- Parent doesn't know about changes
- Can cause hard-to-track bugs

---

### ❌ Using v-if and v-for on Same Element
```vue
<!-- BAD: v-if with v-for on same element -->
<template>
  <ul>
    <li v-for="item in items" v-if="item.isActive" :key="item.id">
      {{ item.name }}
    </li>
  </ul>
</template>

<!-- GOOD: Use computed or template wrapper -->
<script setup>
const activeItems = computed(() => items.value.filter(i => i.isActive))
</script>

<template>
  <ul>
    <li v-for="item in activeItems" :key="item.id">
      {{ item.name }}
    </li>
  </ul>
</template>

<!-- Or use template wrapper -->
<template>
  <ul>
    <template v-for="item in items" :key="item.id">
      <li v-if="item.isActive">{{ item.name }}</li>
    </template>
  </ul>
</template>
```

**Why it's bad:**
- Vue 3: v-if has higher priority, causes error (item undefined)
- Inefficient: evaluates condition for every item every render

---

### ❌ Watchers for Derived State
```vue
<!-- BAD: Watch just to compute derived state -->
<script setup>
const firstName = ref('John')
const lastName = ref('Doe')
const fullName = ref('')

// DON'T DO THIS!
watch([firstName, lastName], () => {
  fullName.value = `${firstName.value} ${lastName.value}`
}, { immediate: true })
</script>

<!-- GOOD: Use computed -->
<script setup>
const firstName = ref('John')
const lastName = ref('Doe')

// Computed handles this automatically!
const fullName = computed(() => `${firstName.value} ${lastName.value}`)
</script>
```

**Why it's bad:**
- Unnecessary complexity
- Extra state to manage
- Watchers are for side effects, not derived state

---

### ❌ Massive Options API Components
```vue
<!-- BAD: Everything in one component -->
<script>
export default {
  data() {
    return {
      // 30 data properties...
      users: [],
      products: [],
      cart: [],
      searchQuery: '',
      // etc...
    }
  },
  computed: {
    // 20 computed properties...
  },
  methods: {
    // 40 methods...
    fetchUsers() {},
    fetchProducts() {},
    addToCart() {},
    // etc...
  },
  mounted() {
    // 50 lines of initialization...
  },
  // ... 1000+ lines total
}
</script>

<!-- GOOD: Composition API with composables -->
<script setup>
import { useUsers } from '@/composables/useUsers'
import { useProducts } from '@/composables/useProducts'
import { useCart } from '@/composables/useCart'
import { useSearch } from '@/composables/useSearch'

const { users, fetchUsers } = useUsers()
const { products, fetchProducts } = useProducts()
const { cart, addToCart } = useCart()
const { searchQuery, filteredResults } = useSearch()
</script>
```

---

### ❌ Direct DOM Manipulation
```vue
<!-- BAD: Direct DOM manipulation -->
<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  document.querySelector('.my-element').style.color = 'red'
  document.querySelector('.my-element').classList.add('active')
})
</script>

<!-- GOOD: Reactive bindings -->
<script setup>
import { ref } from 'vue'

const isActive = ref(true)
const textColor = ref('red')
</script>

<template>
  <div 
    :class="{ active: isActive }"
    :style="{ color: textColor }"
  >
    Content
  </div>
</template>
```

---

### ❌ Overusing v-html
```vue
<!-- BAD: v-html with user content -->
<template>
  <div v-html="userProvidedContent" />  <!-- ❌ XSS vulnerability! -->
</template>

<!-- GOOD: Sanitize or use alternatives -->
<script setup>
import DOMPurify from 'dompurify'

const sanitizedContent = computed(() => 
  DOMPurify.sanitize(userProvidedContent.value)
)
</script>

<template>
  <div v-html="sanitizedContent" />  <!-- ✅ Sanitized -->
</template>

<!-- Better: Use structured data when possible -->
<template>
  <article>
    <h1>{{ post.title }}</h1>
    <p v-for="paragraph in post.paragraphs" :key="paragraph.id">
      {{ paragraph.text }}
    </p>
  </article>
</template>
```

---

### ❌ Not Using Key on v-for
```vue
<!-- BAD: No key or using index -->
<template>
  <ul>
    <li v-for="item in items">{{ item.name }}</li>  <!-- ❌ No key! -->
    <li v-for="(item, index) in items" :key="index">  <!-- ❌ Index as key -->
      {{ item.name }}
    </li>
  </ul>
</template>

<!-- GOOD: Stable unique key -->
<template>
  <ul>
    <li v-for="item in items" :key="item.id">  <!-- ✅ Unique ID -->
      {{ item.name }}
    </li>
  </ul>
</template>
```

**Why it's bad:**
- Vue can't track which items changed
- State gets mixed up when list reorders
- Animations won't work correctly

---

### ❌ Calling Methods in Template for Expensive Operations
```vue
<!-- BAD: Expensive method called every render -->
<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      {{ formatPrice(item.price) }}  <!-- Called every render -->
      {{ calculateDiscount(item) }}   <!-- Expensive, called every render -->
    </li>
  </ul>
</template>

<!-- GOOD: Pre-compute or use computed -->
<script setup>
const itemsWithCalculations = computed(() => 
  items.value.map(item => ({
    ...item,
    formattedPrice: formatPrice(item.price),
    discount: calculateDiscount(item)
  }))
)
</script>

<template>
  <ul>
    <li v-for="item in itemsWithCalculations" :key="item.id">
      {{ item.formattedPrice }}
      {{ item.discount }}
    </li>
  </ul>
</template>
```

---

### ❌ Global Event Bus (Vue 2 Pattern)
```js
// BAD: Global event bus (anti-pattern in Vue 3)
const eventBus = new Vue()  // ❌ Doesn't even work in Vue 3!

// Component A
eventBus.$emit('data-updated', data)

// Component B
eventBus.$on('data-updated', handleUpdate)

// GOOD: Use provide/inject, Pinia, or props/emit
// For sibling communication, lift state to parent
// For app-wide state, use Pinia
```

**Why it's bad:**
- Hard to trace event flow
- Memory leaks if not cleaned up
- No type safety
- Doesn't work in Vue 3
