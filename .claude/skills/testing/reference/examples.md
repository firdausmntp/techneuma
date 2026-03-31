# Testing Examples - Good Patterns

## ✅ Good: Arrange-Act-Assert Pattern
```typescript
describe('UserService', () => {
  it('should create a user with hashed password', async () => {
    // Arrange
    const userData = { email: 'test@example.com', password: 'secret123' }
    const userService = new UserService(mockDb)
    
    // Act
    const user = await userService.create(userData)
    
    // Assert
    expect(user.email).toBe(userData.email)
    expect(user.password).not.toBe(userData.password)
    expect(await bcrypt.compare(userData.password, user.password)).toBe(true)
  })
})
```

## ✅ Good: Descriptive Test Names
```typescript
describe('ShoppingCart', () => {
  describe('addItem', () => {
    it('should increase quantity when adding existing item', () => {})
    it('should add new item when not in cart', () => {})
    it('should throw error when item is out of stock', () => {})
    it('should apply discount when quantity exceeds threshold', () => {})
  })
  
  describe('removeItem', () => {
    it('should decrease quantity when more than one', () => {})
    it('should remove item completely when quantity is one', () => {})
    it('should do nothing when item not in cart', () => {})
  })
})
```

## ✅ Good: Testing Library Queries
```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

test('submits form with user data', async () => {
  const user = userEvent.setup()
  const onSubmit = vi.fn()
  
  render(<LoginForm onSubmit={onSubmit} />)
  
  // Query by role (accessible)
  await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com')
  await user.type(screen.getByLabelText(/password/i), 'secret123')
  await user.click(screen.getByRole('button', { name: /sign in/i }))
  
  expect(onSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'secret123'
  })
})
```

## ✅ Good: Mocking External Dependencies
```typescript
import { vi } from 'vitest'

// Mock at module level
vi.mock('./api', () => ({
  fetchUser: vi.fn()
}))

import { fetchUser } from './api'

describe('UserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('displays user data after loading', async () => {
    // Setup mock response
    vi.mocked(fetchUser).mockResolvedValue({
      id: '1',
      name: 'John',
      email: 'john@example.com'
    })
    
    render(<UserProfile userId="1" />)
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument()
    })
    
    expect(fetchUser).toHaveBeenCalledWith('1')
  })
})
```

## ✅ Good: Test Data Factories
```typescript
import { faker } from '@faker-js/faker'

function createUser(overrides?: Partial<User>): User {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    createdAt: faker.date.past(),
    ...overrides
  }
}

function createPost(overrides?: Partial<Post>): Post {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(3),
    authorId: faker.string.uuid(),
    ...overrides
  }
}

// Usage
it('displays user posts', () => {
  const author = createUser({ name: 'Test Author' })
  const posts = [
    createPost({ authorId: author.id, title: 'First Post' }),
    createPost({ authorId: author.id, title: 'Second Post' })
  ]
  
  render(<UserPosts user={author} posts={posts} />)
  
  expect(screen.getByText('First Post')).toBeInTheDocument()
})
```

## ✅ Good: Integration Tests
```typescript
import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test('completes purchase successfully', async ({ page }) => {
    await page.goto('/products')
    
    // Add item to cart
    await page.click('[data-testid="product-1"] button')
    
    // Go to cart
    await page.click('[data-testid="cart-icon"]')
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1')
    
    // Proceed to checkout
    await page.click('text=Checkout')
    
    // Fill form
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="card"]', '4242424242424242')
    
    // Complete purchase
    await page.click('text=Pay Now')
    
    // Verify success
    await expect(page).toHaveURL(/\/order\//)
    await expect(page.locator('h1')).toContainText('Thank you')
  })
})
```

## ✅ Good: Snapshot Testing for UI
```typescript
it('renders correctly', () => {
  const { container } = render(
    <Card title="Test" description="Description" />
  )
  
  expect(container).toMatchSnapshot()
})

// Better: Inline snapshots for small outputs
it('formats price correctly', () => {
  expect(formatPrice(1234.5)).toMatchInlineSnapshot(`"$1,234.50"`)
  expect(formatPrice(0)).toMatchInlineSnapshot(`"$0.00"`)
})
```

## DON'T (Not Good)

### Bad Request Example

```text
Run /testing and make it better.
```

Why this is not good:
- Too vague, no clear scope or success criteria.
- Missing constraints, so the result may break expectations.
- No validation steps, so quality cannot be trusted.

### Better Alternative

```text
Run /testing on a specific area, list constraints, and include tests or verification checks.
```
