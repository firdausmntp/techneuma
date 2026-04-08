---
name: remix
description: Expert Remix development with nested routes, loaders/actions, progressive enhancement, and web-standard patterns
---

# Remix Specialist

You are an expert Remix developer. Apply these principles when building full-stack web applications.

## Core Philosophy

- **Web standards first** — Use native Request/Response, FormData, headers
- **Progressive enhancement** — Works without JS, enhanced with JS
- **Nested routing** — Layouts and data loading compose through route hierarchy
- **Server/client model** — Loaders for reads, actions for writes

## Route Module API

### Loader (Data Reading — GET)
```typescript
// app/routes/posts.tsx
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;

  const posts = await db.post.findMany({
    take: 20,
    skip: (page - 1) * 20,
    orderBy: { createdAt: "desc" },
  });

  return json({ posts, page });
}

export default function Posts() {
  const { posts, page } = useLoaderData<typeof loader>();

  return (
    <main>
      {posts.map((post) => (
        <article key={post.id}>
          <h2><Link to={post.slug}>{post.title}</Link></h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </main>
  );
}
```

### Action (Data Mutation — POST/PUT/DELETE)
```typescript
// app/routes/posts.new.tsx
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const title = String(formData.get("title"));
  const content = String(formData.get("content"));

  const errors: Record<string, string> = {};
  if (!title) errors.title = "Title is required";
  if (!content) errors.content = "Content is required";
  if (Object.keys(errors).length) return json({ errors }, { status: 400 });

  const post = await db.post.create({ data: { title, content } });
  return redirect(`/posts/${post.slug}`);
}

export default function NewPost() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Form method="post">
      <div>
        <label htmlFor="title">Title</label>
        <input id="title" name="title" required />
        {actionData?.errors?.title && <em>{actionData.errors.title}</em>}
      </div>
      <div>
        <label htmlFor="content">Content</label>
        <textarea id="content" name="content" rows={10} required />
        {actionData?.errors?.content && <em>{actionData.errors.content}</em>}
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Post"}
      </button>
    </Form>
  );
}
```

## Nested Routes

### File Structure
```
app/routes/
├── _index.tsx              → /
├── posts.tsx               → /posts (layout)
├── posts._index.tsx        → /posts (index)
├── posts.$slug.tsx         → /posts/:slug
├── posts.$slug.edit.tsx    → /posts/:slug/edit
└── _auth.tsx               → Pathless layout (wraps auth pages)
    ├── _auth.login.tsx     → /login
    └── _auth.register.tsx  → /register
```

### Layout Route with Outlet
```typescript
// app/routes/posts.tsx — parent layout
import { Outlet, NavLink } from "@remix-run/react";

export default function PostsLayout() {
  return (
    <div className="posts-layout">
      <nav>
        <NavLink to="." end>All Posts</NavLink>
        <NavLink to="new">New Post</NavLink>
      </nav>
      <div className="posts-content">
        <Outlet />
      </div>
    </div>
  );
}
```

## Error Handling

### Error Boundary Per Route
```typescript
import { isRouteErrorResponse, useRouteError } from "@remix-run/react";

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="error">
        <h1>{error.status} {error.statusText}</h1>
        <p>{error.data}</p>
      </div>
    );
  }

  return (
    <div className="error">
      <h1>Something went wrong</h1>
      <p>{error instanceof Error ? error.message : "Unknown error"}</p>
    </div>
  );
}
```

## Optimistic UI

```typescript
export default function TodoList() {
  const { todos } = useLoaderData<typeof loader>();
  const fetchers = useFetchers();

  // Merge server state with optimistic updates
  const optimisticTodos = todos.map((todo) => {
    const fetcher = fetchers.find(
      (f) => f.formData?.get("id") === todo.id
    );
    if (fetcher?.formData) {
      return { ...todo, complete: fetcher.formData.get("complete") === "true" };
    }
    return todo;
  });

  return (
    <ul>
      {optimisticTodos.map((todo) => (
        <li key={todo.id}>
          <fetcher.Form method="post">
            <input type="hidden" name="id" value={todo.id} />
            <input type="hidden" name="complete" value={String(!todo.complete)} />
            <button type="submit">{todo.complete ? "✓" : "○"} {todo.title}</button>
          </fetcher.Form>
        </li>
      ))}
    </ul>
  );
}
```

## DO

- Use `<Form>` instead of `<form>` for automatic progressive enhancement
- Use `loader` for data reads, `action` for mutations — never mix them
- Throw `Response` objects from loaders for error states (404, 403, etc.)
- Use `useFetcher` for non-navigation mutations (likes, toggles, inline edits)
- Return `json()` with proper status codes from actions
- Use nested routes to compose layouts and colocate data loading

## DON'T

- Don't use `useEffect` for data fetching — that's what `loader` is for
- Don't manage form state with React state — use native FormData
- Don't use client-side routers (react-router) — Remix handles routing
- Don't put database calls in components — all server logic in loader/action
- Don't ignore TypeScript `typeof loader` inference — it gives full type safety
- Don't fetch in parent loaders for child routes — each route loads its own data