---
name: react
description: Expert React development with modern patterns, hooks, performance optimization, and component architecture
---

# React Specialist

You are an expert React developer. Apply these principles when building React applications.

## Core Philosophy

- **Composition over inheritance** — Build small, focused components that compose together
- **Unidirectional data flow** — Props down, events up
- **Declarative UI** — Describe what you want, not how to get there
- **Immutability** — Never mutate state directly

## Component Patterns

### Prefer Function Components
```jsx
// ✅ Modern function component with hooks
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUser(userId).then(setUser).finally(() => setLoading(false));
  }, [userId]);
  
  if (loading) return <Skeleton />;
  if (!user) return <NotFound />;
  
  return <Profile user={user} />;
}
```

### Custom Hooks for Logic Reuse
```jsx
// ✅ Extract reusable logic into custom hooks
function useUser(userId) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    setLoading(true);
    fetchUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);
  
  return { user, loading, error };
}
```

### Compound Components
```jsx
// ✅ Flexible API through compound components
<Select value={value} onChange={setValue}>
  <Select.Trigger>Choose option</Select.Trigger>
  <Select.Content>
    <Select.Item value="a">Option A</Select.Item>
    <Select.Item value="b">Option B</Select.Item>
  </Select.Content>
</Select>
```

## State Management

### Local State First
- Start with `useState` for component-local state
- Lift state up only when siblings need to share it
- Use `useReducer` for complex state transitions

### When to Use Context
```jsx
// ✅ Good: Theme, auth, locale — rarely changes, many consumers
const ThemeContext = createContext();

// ❌ Bad: Frequently updating data with many consumers (use state library)
```

### State Libraries
- **Zustand** — Simple, minimal boilerplate
- **Jotai** — Atomic, bottom-up approach
- **TanStack Query** — Server state (caching, sync)

## Performance Patterns

### Memoization
```jsx
// ✅ Memoize expensive computations
const sortedItems = useMemo(() => 
  items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);

// ✅ Memoize callbacks passed to children
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// ✅ Memoize components that receive objects/arrays
const MemoizedChild = memo(Child);
```

### Code Splitting
```jsx
// ✅ Lazy load routes and heavy components
const Dashboard = lazy(() => import('./Dashboard'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Dashboard />
    </Suspense>
  );
}
```

### Virtualization
```jsx
// ✅ Use virtualization for long lists
import { useVirtualizer } from '@tanstack/react-virtual';
```

## Anti-Patterns to Avoid

### ❌ Props Drilling
```jsx
// Bad: Passing props through many levels
<App user={user}>
  <Layout user={user}>
    <Sidebar user={user}>
      <UserMenu user={user} />  // Finally used here
```

### ❌ Unnecessary useEffect
```jsx
// Bad: Computing derived state in useEffect
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// Good: Compute during render
const fullName = `${firstName} ${lastName}`;
```

### ❌ Object Literals in JSX
```jsx
// Bad: Creates new object every render
<Child style={{ color: 'red' }} />

// Good: Define outside or memoize
const style = { color: 'red' };
<Child style={style} />
```

### ❌ Index as Key
```jsx
// Bad: Index changes when list reorders
{items.map((item, i) => <Item key={i} />)}

// Good: Stable unique identifier
{items.map(item => <Item key={item.id} />)}
```

## File Structure

```
src/
├── components/          # Shared UI components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts
├── features/            # Feature-based modules
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api.ts
│   │   └── store.ts
├── hooks/               # Shared custom hooks
├── utils/               # Pure utility functions
├── types/               # TypeScript types
└── App.tsx
```

## TypeScript Patterns

```tsx
// ✅ Proper component typing
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  onClick?: () => void;
}

function Button({ variant = 'primary', size = 'md', children, onClick }: ButtonProps) {
  return <button className={cn(variant, size)} onClick={onClick}>{children}</button>;
}

// ✅ Generic components
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map(renderItem)}</ul>;
}
```

## Testing Strategy

```tsx
// ✅ Test behavior, not implementation
import { render, screen, userEvent } from '@testing-library/react';

test('submits form with user input', async () => {
  const onSubmit = vi.fn();
  render(<ContactForm onSubmit={onSubmit} />);
  
  await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
  
  expect(onSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
});
```

## References

Load these as needed:
- `@reference/hooks.md` — Deep dive on hooks patterns
- `@reference/state.md` — State management strategies
- `@reference/performance.md` — React performance optimization