---
name: state-management
description: 
---

---
name: state-management
description: Expert state management patterns for React, Vue, and framework-agnostic solutions
---

# State Management Specialist

You are an expert in state management across different frameworks and architectures.

## Core Philosophy

- **Single source of truth** — One authoritative location for each piece of state
- **Predictable updates** — State changes follow clear, traceable patterns
- **Minimal global state** — Keep state as local as possible
- **Derived state** — Compute values from state, don't store duplicates

## State Categories

```
┌─────────────────────────────────────────────────────────────┐
│                    STATE HIERARCHY                          │
├─────────────────────────────────────────────────────────────┤
│  LOCAL UI STATE         │  Form inputs, toggles, modals    │
│  ────────────────────   │  Keep in component state         │
├─────────────────────────────────────────────────────────────┤
│  SHARED UI STATE        │  Theme, sidebar, notifications   │
│  ────────────────────   │  Context or lightweight store    │
├─────────────────────────────────────────────────────────────┤
│  SERVER STATE           │  API data, cached responses      │
│  ────────────────────   │  React Query, SWR, Apollo        │
├─────────────────────────────────────────────────────────────┤
│  GLOBAL APP STATE       │  User session, permissions       │
│  ────────────────────   │  Redux, Zustand, Pinia           │
└─────────────────────────────────────────────────────────────┘
```

## React State Management

### Local State (useState)
```jsx
function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  )
}
```

### Complex Local State (useReducer)
```jsx
const initialState = {
  items: [],
  loading: false,
  error: null
}

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null }
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, items: action.payload }
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload }
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) }
    default:
      return state
  }
}

function ItemList() {
  const [state, dispatch] = useReducer(reducer, initialState)
  
  useEffect(() => {
    dispatch({ type: 'FETCH_START' })
    fetchItems()
      .then(items => dispatch({ type: 'FETCH_SUCCESS', payload: items }))
      .catch(error => dispatch({ type: 'FETCH_ERROR', payload: error.message }))
  }, [])
  
  return (
    <div>
      {state.loading && <Spinner />}
      {state.error && <Error message={state.error} />}
      {state.items.map(item => (
        <Item 
          key={item.id} 
          item={item}
          onRemove={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
        />
      ))}
    </div>
  )
}
```

### Context API
```jsx
// Create context with default value
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {}
})

// Provider component
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  
  const value = useMemo(() => ({
    theme,
    toggleTheme: () => setTheme(t => t === 'light' ? 'dark' : 'light')
  }), [theme])
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Custom hook for consuming
function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

// Usage
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button onClick={toggleTheme}>
      Current: {theme}
    </button>
  )
}
```

### Zustand (Lightweight Store)
```javascript
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// Simple store
const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 })
}))

// With middleware and TypeScript
interface AuthState {
  user: User | null
  token: string | null
  login: (credentials: Credentials) => Promise<void>
  logout: () => void
}

const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        
        login: async (credentials) => {
          const { user, token } = await api.login(credentials)
          set({ user, token })
        },
        
        logout: () => {
          set({ user: null, token: null })
        }
      }),
      { name: 'auth-storage' }
    )
  )
)

// Selectors for performance
const useUser = () => useAuthStore((state) => state.user)
const useIsAuthenticated = () => useAuthStore((state) => !!state.token)

// Usage
function Profile() {
  const user = useUser()
  const logout = useAuthStore((state) => state.logout)
  
  if (!user) return null
  
  return (
    <div>
      <span>{user.name}</span>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### Redux Toolkit
```javascript
import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Async thunk
const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getUsers()
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Slice
const usersSlice = createSlice({
  name: 'users',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {
    addUser: (state, action) => {
      state.items.push(action.payload)
    },
    removeUser: (state, action) => {
      state.items = state.items.filter(u => u.id !== action.payload)
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

// Store
const store = configureStore({
  reducer: {
    users: usersSlice.reducer
  }
})

// Typed hooks
const useAppDispatch = () => useDispatch<AppDispatch>()
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// Usage
function UserList() {
  const dispatch = useAppDispatch()
  const { items, loading, error } = useAppSelector(state => state.users)
  
  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])
  
  return (
    <div>
      {loading && <Spinner />}
      {items.map(user => <UserCard key={user.id} user={user} />)}
    </div>
  )
}
```

### Server State (TanStack Query)
```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Query
function useUsers(filters) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => api.getUsers(filters),
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 30 * 60 * 1000     // 30 minutes (formerly cacheTime)
  })
}

// Mutation with optimistic update
function useCreateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (newUser) => api.createUser(newUser),
    
    onMutate: async (newUser) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['users'] })
      
      // Snapshot previous value
      const previous = queryClient.getQueryData(['users'])
      
      // Optimistically update
      queryClient.setQueryData(['users'], (old) => [...old, { ...newUser, id: 'temp' }])
      
      return { previous }
    },
    
    onError: (err, newUser, context) => {
      // Rollback on error
      queryClient.setQueryData(['users'], context.previous)
    },
    
    onSettled: () => {
      // Refetch after success or error
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

// Usage
function UserList() {
  const { data: users, isLoading, error } = useUsers({ role: 'admin' })
  const createUser = useCreateUser()
  
  if (isLoading) return <Spinner />
  if (error) return <Error message={error.message} />
  
  return (
    <div>
      {users.map(user => <UserCard key={user.id} user={user} />)}
      <button onClick={() => createUser.mutate({ name: 'New User' })}>
        Add User
      </button>
    </div>
  )
}
```

## Vue State Management

### Composition API (ref/reactive)
```javascript
import { ref, reactive, computed, watch } from 'vue'

// Simple ref
const count = ref(0)

// Reactive object
const user = reactive({
  name: '',
  email: '',
  preferences: {}
})

// Computed
const fullName = computed(() => `${user.firstName} ${user.lastName}`)

// Watch
watch(count, (newValue, oldValue) => {
  console.log(`Count changed: ${oldValue} → ${newValue}`)
})

// Composable (custom hook equivalent)
export function useCounter(initial = 0) {
  const count = ref(initial)
  
  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => count.value = initial
  
  return { count, increment, decrement, reset }
}
```

### Pinia (Vue Store)
```javascript
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: null,
    loading: false
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    fullName: (state) => state.user 
      ? `${state.user.firstName} ${state.user.lastName}`
      : ''
  },
  
  actions: {
    async login(credentials) {
      this.loading = true
      try {
        const { user, token } = await api.login(credentials)
        this.user = user
        this.token = token
      } finally {
        this.loading = false
      }
    },
    
    logout() {
      this.user = null
      this.token = null
    }
  }
})

// Setup syntax (composition API style)
export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  
  const total = computed(() => 
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )
  
  function addItem(product) {
    const existing = items.value.find(i => i.id === product.id)
    if (existing) {
      existing.quantity++
    } else {
      items.value.push({ ...product, quantity: 1 })
    }
  }
  
  function removeItem(id) {
    const index = items.value.findIndex(i => i.id === id)
    if (index > -1) items.value.splice(index, 1)
  }
  
  return { items, total, addItem, removeItem }
})
```

## State Machine (XState)

```javascript
import { createMachine, assign } from 'xstate'
import { useMachine } from '@xstate/react'

const fetchMachine = createMachine({
  id: 'fetch',
  initial: 'idle',
  context: {
    data: null,
    error: null
  },
  states: {
    idle: {
      on: { FETCH: 'loading' }
    },
    loading: {
      invoke: {
        src: 'fetchData',
        onDone: {
          target: 'success',
          actions: assign({ data: (_, event) => event.data })
        },
        onError: {
          target: 'failure',
          actions: assign({ error: (_, event) => event.data })
        }
      }
    },
    success: {
      on: { REFETCH: 'loading' }
    },
    failure: {
      on: { RETRY: 'loading' }
    }
  }
})

function DataFetcher() {
  const [state, send] = useMachine(fetchMachine, {
    services: {
      fetchData: () => fetch('/api/data').then(r => r.json())
    }
  })
  
  return (
    <div>
      {state.matches('idle') && (
        <button onClick={() => send('FETCH')}>Load Data</button>
      )}
      {state.matches('loading') && <Spinner />}
      {state.matches('success') && (
        <pre>{JSON.stringify(state.context.data, null, 2)}</pre>
      )}
      {state.matches('failure') && (
        <div>
          <p>Error: {state.context.error.message}</p>
          <button onClick={() => send('RETRY')}>Retry</button>
        </div>
      )}
    </div>
  )
}
```

## Anti-Patterns

### ❌ Prop Drilling
```jsx
// Bad: Passing through many levels
<App>
  <Layout user={user}>
    <Sidebar user={user}>
      <UserMenu user={user} />
    </Sidebar>
  </Layout>
</App>

// Good: Context or store
<UserProvider>
  <App>
    <Layout>
      <Sidebar>
        <UserMenu />  {/* Uses useUser() */}
      </Sidebar>
    </Layout>
  </App>
</UserProvider>
```

### ❌ Derived State as State
```jsx
// Bad: Storing derived values
const [items, setItems] = useState([])
const [total, setTotal] = useState(0)  // Derived!

useEffect(() => {
  setTotal(items.reduce((sum, i) => sum + i.price, 0))
}, [items])

// Good: Compute on render
const [items, setItems] = useState([])
const total = items.reduce((sum, i) => sum + i.price, 0)

// Or useMemo for expensive computations
const total = useMemo(
  () => items.reduce((sum, i) => sum + i.price, 0),
  [items]
)
```

### ❌ Everything in Global State
```jsx
// Bad: Form state in Redux
dispatch(updateFormField('name', 'John'))
dispatch(updateFormField('email', 'john@example.com'))

// Good: Local state for forms
const [formData, setFormData] = useState({ name: '', email: '' })
```

### ❌ Not Normalizing Data
```javascript
// Bad: Nested data
{
  posts: [
    { id: 1, author: { id: 1, name: 'John' }, comments: [...] },
    { id: 2, author: { id: 1, name: 'John' }, comments: [...] }
  ]
}

// Good: Normalized
{
  posts: { 1: { id: 1, authorId: 1 }, 2: { id: 2, authorId: 1 } },
  users: { 1: { id: 1, name: 'John' } },
  comments: { ... }
}
```

### ❌ Mutating State
```javascript
// Bad: Direct mutation
state.items.push(newItem)  // Won't trigger re-render!

// Good: Immutable update
setState(prev => ({
  ...prev,
  items: [...prev.items, newItem]
}))
```
