# TypeScript Examples - Good Patterns

## Type Safety

### ✅ Good: Discriminated Unions for State
```typescript
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }

function renderState<T>(state: RequestState<T>) {
  switch (state.status) {
    case 'idle':
      return <IdlePlaceholder />
    case 'loading':
      return <Spinner />
    case 'success':
      return <DataView data={state.data} />
    case 'error':
      return <ErrorMessage error={state.error} />
  }
}
```

### ✅ Good: Branded Types
```typescript
type UserId = string & { readonly brand: unique symbol }
type PostId = string & { readonly brand: unique symbol }

function createUserId(id: string): UserId {
  return id as UserId
}

function getUser(id: UserId) { /* ... */ }
function getPost(id: PostId) { /* ... */ }

const userId = createUserId('user-123')
getUser(userId)  // ✓ OK
getUser('raw-string')  // ✗ Type error!
```

### ✅ Good: Type Guards
```typescript
interface Cat { type: 'cat'; meow(): void }
interface Dog { type: 'dog'; bark(): void }
type Animal = Cat | Dog

function isCat(animal: Animal): animal is Cat {
  return animal.type === 'cat'
}

function makeSound(animal: Animal) {
  if (isCat(animal)) {
    animal.meow()  // TypeScript knows it's Cat
  } else {
    animal.bark()  // TypeScript knows it's Dog
  }
}
```

## Generics

### ✅ Good: Constrained Generics
```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const user = { name: 'John', age: 30 }
getProperty(user, 'name')  // ✓ string
getProperty(user, 'foo')   // ✗ Error
```

### ✅ Good: Generic Factory
```typescript
function createStore<T>(initialValue: T) {
  let value = initialValue
  return {
    get: (): T => value,
    set: (newValue: T) => { value = newValue },
    update: (fn: (current: T) => T) => { value = fn(value) }
  }
}

const counter = createStore(0)
counter.set(5)        // ✓ OK
counter.set('hello')  // ✗ Type error
```

## Utility Types

### ✅ Good: Using Built-in Utilities
```typescript
interface User {
  id: string
  name: string
  email: string
  password: string
}

type PublicUser = Omit<User, 'password'>
type UserUpdate = Partial<Omit<User, 'id'>> & Pick<User, 'id'>
type CreateUser = Omit<User, 'id'>
```

### ✅ Good: const Assertions
```typescript
const STATUSES = ['pending', 'active', 'done'] as const
type Status = typeof STATUSES[number]  // 'pending' | 'active' | 'done'

const config = {
  endpoint: '/api',
  timeout: 5000
} as const
// { readonly endpoint: '/api'; readonly timeout: 5000 }
```

## DON'T (Not Good)

### Bad Request Example

```text
Run /typescript and make it better.
```

Why this is not good:
- Too vague, no clear scope or success criteria.
- Missing constraints, so the result may break expectations.
- No validation steps, so quality cannot be trusted.

### Better Alternative

```text
Run /typescript on a specific area, list constraints, and include tests or verification checks.
```
