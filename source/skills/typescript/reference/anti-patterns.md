# TypeScript Anti-Patterns

## ❌ Using `any` Everywhere
```typescript
// Bad
function process(data: any) {
  return data.foo.bar  // No safety!
}

// Good
function process(data: unknown) {
  if (isValidData(data)) {
    return data.foo.bar
  }
}
```

## ❌ Type Assertions to Silence Errors
```typescript
// Bad - lying to compiler
const user = {} as User
user.name  // Runtime error!

// Good
const user: User = { id: '1', name: 'John', email: 'j@e.com' }
```

## ❌ Non-Null Assertions Everywhere
```typescript
// Bad
const user = users.find(u => u.id === id)!
return user.name  // Could crash!

// Good
const user = users.find(u => u.id === id)
if (!user) throw new Error('Not found')
return user.name
```

## ❌ Overly Complex Types
```typescript
// Bad - unreadable
type Foo<T> = T extends (infer U)[] ? U extends { id: infer I } ? Record<I, Omit<U, 'id'>> : never : never

// Good - break it down
type ArrayItem<T> = T extends (infer U)[] ? U : never
type WithoutId<T> = Omit<T, 'id'>
```

## ❌ @ts-ignore Without Explanation
```typescript
// Bad
// @ts-ignore
doSomething(wrongArg)

// Good - explain why
// @ts-expect-error - Library types are incorrect, see issue #123
doSomething(wrongArg)
```

## ❌ Disabling Strict Mode
```json
// Bad
{ "compilerOptions": { "strict": false } }

// Good
{ "compilerOptions": { "strict": true } }
```
