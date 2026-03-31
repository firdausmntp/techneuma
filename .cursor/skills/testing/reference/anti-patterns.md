# Testing Anti-Patterns

## ❌ Testing Implementation Details
```typescript
// Bad: Testing internal state
it('sets loading to true', () => {
  const { result } = renderHook(() => useData())
  act(() => result.current.fetch())
  expect(result.current.loading).toBe(true)  // Internal detail!
})

// Good: Test observable behavior
it('shows loading indicator while fetching', async () => {
  render(<DataList />)
  fireEvent.click(screen.getByText('Load'))
  expect(screen.getByRole('progressbar')).toBeInTheDocument()
})
```

## ❌ Querying by Test ID When Better Options Exist
```typescript
// Bad: data-testid for everything
const button = screen.getByTestId('submit-button')

// Good: Query by role (accessible)
const button = screen.getByRole('button', { name: /submit/i })

// Good: Query by label (accessible)
const input = screen.getByLabelText(/email/i)

// Good: Query by text (user-facing)
const heading = screen.getByText(/welcome/i)
```

## ❌ No Assertions
```typescript
// Bad: Test with no assertions
it('renders component', () => {
  render(<MyComponent />)  // So what?
})

// Good: Assert something meaningful
it('renders user name', () => {
  render(<UserCard user={{ name: 'John' }} />)
  expect(screen.getByText('John')).toBeInTheDocument()
})
```

## ❌ Testing Third-Party Libraries
```typescript
// Bad: Testing React Router
it('navigates to /about', () => {
  render(<Link to="/about">About</Link>)
  // Don't test that Link works - React Router maintainers do that
})

// Good: Test YOUR behavior
it('shows about link in navigation', () => {
  render(<Navigation />)
  expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute('href', '/about')
})
```

## ❌ Tightly Coupled Tests
```typescript
// Bad: Tests depend on order
let userId: string

it('creates user', async () => {
  const user = await createUser({ name: 'John' })
  userId = user.id  // Used by next test!
})

it('fetches user', async () => {
  const user = await getUser(userId)  // Depends on previous test!
  expect(user.name).toBe('John')
})

// Good: Independent tests
it('creates and fetches user', async () => {
  const created = await createUser({ name: 'John' })
  const fetched = await getUser(created.id)
  expect(fetched.name).toBe('John')
})
```

## ❌ Too Much Mocking
```typescript
// Bad: Mock everything
vi.mock('./db')
vi.mock('./cache')
vi.mock('./logger')
vi.mock('./validator')
vi.mock('./formatter')
// Test now tests nothing real!

// Good: Mock only external boundaries
vi.mock('./api')  // External HTTP
// Use real implementations for internal modules
```

## ❌ Ignoring Async Behavior
```typescript
// Bad: Not waiting for async
it('shows data', () => {
  render(<DataFetcher />)
  expect(screen.getByText('Data')).toBeInTheDocument()  // Fails!
})

// Good: Wait for async
it('shows data', async () => {
  render(<DataFetcher />)
  await waitFor(() => {
    expect(screen.getByText('Data')).toBeInTheDocument()
  })
})

// Or use findBy (auto-waits)
it('shows data', async () => {
  render(<DataFetcher />)
  expect(await screen.findByText('Data')).toBeInTheDocument()
})
```

## ❌ Giant Test Files
```typescript
// Bad: 1000+ line test file with everything

// Good: Organize by feature/behavior
// user.service.test.ts - Unit tests for UserService
// user.api.test.ts - API integration tests
// user.e2e.test.ts - End-to-end user flows
```

## ❌ Flaky Tests
```typescript
// Bad: Time-dependent
it('shows relative time', () => {
  const date = new Date()
  expect(formatRelative(date)).toBe('just now')  // Flaky!
})

// Good: Control time
it('shows relative time', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2024-01-15T12:00:00'))
  
  const date = new Date('2024-01-15T11:59:00')
  expect(formatRelative(date)).toBe('1 minute ago')
  
  vi.useRealTimers()
})
```
