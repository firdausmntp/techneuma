---
name: solidjs
description: Expert SolidJS development with fine-grained reactivity, signals, stores, and high-performance UI patterns
---

# SolidJS Specialist

You are an expert SolidJS developer. Apply these principles for reactive, high-performance web applications.

## Core Philosophy

- **Fine-grained reactivity** — No virtual DOM, direct DOM updates via signals
- **Compile-time optimization** — JSX compiles to efficient DOM operations
- **Signals over state** — Primitives that track and react to changes automatically
- **No re-renders** — Components run once, only reactive expressions re-execute

## Reactivity Primitives

### Signals (Atomic Reactive State)
```tsx
import { createSignal, createEffect, createMemo } from "solid-js";

function Counter() {
  const [count, setCount] = createSignal(0);
  const doubled = createMemo(() => count() * 2);

  // Runs whenever count changes — no dependency array needed
  createEffect(() => {
    console.log(`Count is now: ${count()}`);
  });

  return (
    <div>
      <p>Count: {count()}</p>
      <p>Doubled: {doubled()}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
    </div>
  );
}
```

### Stores (Nested Reactive Objects)
```tsx
import { createStore, produce } from "solid-js/store";

function TodoApp() {
  const [state, setState] = createStore({
    todos: [] as { id: number; text: string; done: boolean }[],
    filter: "all" as "all" | "active" | "done",
  });

  const addTodo = (text: string) => {
    setState("todos", (todos) => [
      ...todos,
      { id: Date.now(), text, done: false },
    ]);
  };

  // Fine-grained nested update — only the specific todo re-renders
  const toggleTodo = (id: number) => {
    setState("todos", (t) => t.id === id, "done", (d) => !d);
  };

  // Or use produce for immer-like syntax
  const removeTodo = (id: number) => {
    setState(produce((s) => {
      s.todos = s.todos.filter((t) => t.id !== id);
    }));
  };

  const filtered = createMemo(() => {
    if (state.filter === "active") return state.todos.filter((t) => !t.done);
    if (state.filter === "done") return state.todos.filter((t) => t.done);
    return state.todos;
  });

  return (
    <ul>
      <For each={filtered()}>
        {(todo) => (
          <li classList={{ done: todo.done }} onClick={() => toggleTodo(todo.id)}>
            {todo.text}
          </li>
        )}
      </For>
    </ul>
  );
}
```

## Control Flow Components

### <For> — Keyed List Rendering
```tsx
// ✅ Efficient keyed iteration — each item tracked individually
<For each={items()}>
  {(item, index) => (
    <div>
      {index()}: {item.name}
    </div>
  )}
</For>
```

### <Show>, <Switch>, <Match>
```tsx
<Show when={user()} fallback={<LoginButton />}>
  {(user) => <UserProfile user={user()} />}
</Show>

<Switch fallback={<DefaultView />}>
  <Match when={status() === "loading"}>
    <Spinner />
  </Match>
  <Match when={status() === "error"}>
    <ErrorMessage />
  </Match>
  <Match when={status() === "success"}>
    <SuccessView />
  </Match>
</Switch>
```

### <Suspense> and <ErrorBoundary>
```tsx
import { Suspense, ErrorBoundary } from "solid-js";

function App() {
  return (
    <ErrorBoundary fallback={(err) => <div>Error: {err.message}</div>}>
      <Suspense fallback={<Spinner />}>
        <AsyncContent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

## Resource (Async Data)

```tsx
import { createResource, Suspense } from "solid-js";

function UserProfile(props: { userId: string }) {
  const [user] = createResource(
    () => props.userId,
    async (id) => {
      const res = await fetch(`/api/users/${id}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    }
  );

  return (
    <Suspense fallback={<Skeleton />}>
      <Show when={user()}>
        {(u) => (
          <div>
            <h1>{u().name}</h1>
            <p>{u().email}</p>
          </div>
        )}
      </Show>
    </Suspense>
  );
}
```

## Context

```tsx
import { createContext, useContext } from "solid-js";

const ThemeContext = createContext<{ theme: () => string; toggle: () => void }>();

function ThemeProvider(props: { children: any }) {
  const [theme, setTheme] = createSignal("light");
  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {props.children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
```

## DO

- Call signals as functions: `count()` not `count` — reactivity depends on the call
- Use `<For>` for lists — it provides keyed, efficient updates per item
- Use `createMemo` for derived values to avoid redundant computation
- Use stores for nested data — fine-grained updates without immutability gymnastics
- Use `<Show>` with callback children for narrowed types
- Use `createResource` for async data — integrates with `<Suspense>`

## DON'T

- Don't destructure props — it breaks reactivity: use `props.name` directly
- Don't use `Array.map()` for lists — use `<For>` for tracked updates
- Don't wrap everything in signals — plain values for things that never change
- Don't expect components to re-run — they execute once, only reactive parts update
- Don't use `useEffect`-like patterns for data fetching — use `createResource`
- Don't use ternary in JSX for conditional rendering — use `<Show>` / `<Switch>`
