---
name: typescript
description: 
---

---
name: typescript
description: Expert TypeScript development with type safety, generics, utility types, and best practices
---

# TypeScript Specialist

You are an expert TypeScript developer. Apply these principles for type-safe code.

## Core Philosophy

- **Type safety** — Catch errors at compile time
- **Developer experience** — Autocompletion, refactoring support
- **Documentation** — Types are documentation
- **Gradual adoption** — Start loose, tighten over time

## Basic Types

```typescript
// Primitives
let name: string = 'John'
let age: number = 30
let isActive: boolean = true
let data: null = null
let value: undefined = undefined

// Arrays
let numbers: number[] = [1, 2, 3]
let strings: Array<string> = ['a', 'b', 'c']
let mixed: (string | number)[] = [1, 'two', 3]

// Tuples
let point: [number, number] = [10, 20]
let record: [string, number, boolean] = ['name', 42, true]

// Objects
let user: { name: string; age: number } = { name: 'John', age: 30 }

// Any, unknown, never
let anything: any = 'could be anything'  // Avoid!
let mystery: unknown = getSomething()     // Safer than any
function fail(): never { throw new Error() }  // Never returns
```

## Interfaces & Types

### Interfaces
```typescript
interface User {
  id: string
  name: string
  email: string
}

// Optional & readonly
interface Config {
  apiUrl: string
  timeout?: number          // Optional
  readonly version: string  // Immutable
}

// Extending
interface Admin extends User {
  permissions: string[]
}

// Implementing
class UserService implements IUserService {
  getUser(id: string): User { /* ... */ }
}
```

### Type Aliases
```typescript
// Union types
type Status = 'pending' | 'active' | 'completed'
type Result = Success | Error

// Intersection types
type AdminUser = User & { permissions: string[] }

// Function types
type Handler = (event: Event) => void
type AsyncFn<T> = () => Promise<T>
```

## Generics

### Basic Generics
```typescript
function identity<T>(value: T): T {
  return value
}

interface Container<T> {
  value: T
  getValue(): T
}

class Box<T> {
  constructor(private content: T) {}
  get(): T { return this.content }
}
```

### Constraints
```typescript
function getLength<T extends { length: number }>(item: T): number {
  return item.length
}

function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}
```

### Multiple Type Parameters
```typescript
function map<T, U>(array: T[], fn: (item: T) => U): U[] {
  return array.map(fn)
}

// With defaults
interface Response<T = unknown, E = Error> {
  data?: T
  error?: E
}
```

## Utility Types

```typescript
// Partial - all optional
type PartialUser = Partial<User>

// Required - all required
type RequiredConfig = Required<Config>

// Pick - select properties
type UserPreview = Pick<User, 'id' | 'name'>

// Omit - exclude properties
type UserWithoutEmail = Omit<User, 'email'>

// Record - key-value map
type UserMap = Record<string, User>

// Readonly - immutable
type ImmutableUser = Readonly<User>

// ReturnType - function return
type NewUser = ReturnType<typeof createUser>

// Parameters - function params
type CreateUserParams = Parameters<typeof createUser>

// NonNullable
type DefiniteString = NonNullable<string | null>  // string

// Extract / Exclude
type T0 = Extract<'a' | 'b' | 'c', 'a' | 'f'>  // 'a'
type T1 = Exclude<'a' | 'b' | 'c', 'a'>        // 'b' | 'c'
```

## Advanced Patterns

### Discriminated Unions
```typescript
interface LoadingState { status: 'loading' }
interface SuccessState { status: 'success'; data: User[] }
interface ErrorState { status: 'error'; error: string }

type State = LoadingState | SuccessState | ErrorState

function render(state: State) {
  switch (state.status) {
    case 'loading': return 'Loading...'
    case 'success': return state.data.map(u => u.name).join(', ')
    case 'error': return `Error: ${state.error}`
  }
}
```

### Type Guards
```typescript
// typeof
function process(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase()
  }
  return value * 2
}

// Custom type guard
function isCat(animal: Cat | Dog): animal is Cat {
  return 'meow' in animal
}

// in operator
function handle(value: { name: string } | { title: string }) {
  if ('name' in value) return value.name
  return value.title
}
```

### Template Literal Types
```typescript
type EventName = 'click' | 'focus' | 'blur'
type Handler = `on${Capitalize<EventName>}`
// 'onClick' | 'onFocus' | 'onBlur'

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
type Route = `${HTTPMethod} /api/${string}`
```

### Conditional Types
```typescript
type IsString<T> = T extends string ? true : false

// Infer keyword
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never

// Unwrap array
type Unwrap<T> = T extends Array<infer U> ? U : T
```

## Best Practices

### Enable Strict Mode
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### Prefer const assertions
```typescript
const config = {
  endpoint: '/api',
  timeout: 5000,
} as const
// { readonly endpoint: '/api'; readonly timeout: 5000 }

const statuses = ['pending', 'active', 'done'] as const
type Status = typeof statuses[number]  // 'pending' | 'active' | 'done'
```

## Anti-Patterns

### ❌ Type Assertions Everywhere
```typescript
// Bad
const user = {} as User

// Good
const user: User = { id: '1', name: 'John', email: 'john@example.com' }
```

### ❌ Using any
```typescript
// Bad
function process(data: any) {
  return data.someProperty
}

// Good
function process(data: unknown) {
  if (typeof data === 'object' && data !== null && 'someProperty' in data) {
    return (data as { someProperty: unknown }).someProperty
  }
}
```

### ❌ Overly Complex Types
```typescript
// Bad
type X = Pick<Omit<Partial<Required<T>>, 'a'>, 'b'> & { c: string }

// Good: Break it down
type WithoutA = Omit<T, 'a'>
type OnlyB = Pick<WithoutA, 'b'>
type X = OnlyB & { c: string }
```

### ❌ Not Using Strict Mode
Always enable `"strict": true` in tsconfig.json.
