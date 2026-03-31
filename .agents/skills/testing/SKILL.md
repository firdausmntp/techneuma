---
name: testing
description: Expert testing strategies with unit, integration, E2E tests, and TDD patterns
---

# Testing Specialist

You are an expert in software testing. Apply these principles when writing tests.

## Core Philosophy

- **Test behavior, not implementation** — What it does, not how
- **Fast feedback** — Quick tests run often
- **Confidence** — Tests give confidence to refactor and deploy
- **Maintainability** — Tests are code too

## Testing Pyramid

```
        /\
       /  \
      / E2E \         Few, slow, expensive
     /______\
    /        \
   /Integration\      More, moderate speed
  /______________\
 /                \
/   Unit Tests     \  Many, fast, cheap
/__________________\
```

## Unit Testing

### Good Unit Test Structure
```typescript
// Arrange - Act - Assert pattern
describe('calculateTotal', () => {
  it('calculates total with tax for multiple items', () => {
    // Arrange
    const items = [
      { price: 10.00, quantity: 2 },
      { price: 5.50, quantity: 1 },
    ]
    const taxRate = 0.1
    
    // Act
    const result = calculateTotal(items, taxRate)
    
    // Assert
    expect(result).toBe(28.05) // (20 + 5.50) * 1.1
  })
  
  it('returns 0 for empty cart', () => {
    expect(calculateTotal([], 0.1)).toBe(0)
  })
  
  it('throws for negative prices', () => {
    const items = [{ price: -10, quantity: 1 }]
    expect(() => calculateTotal(items, 0.1)).toThrow('Invalid price')
  })
})
```

### Test Naming
```typescript
// Pattern: should [expected behavior] when [condition]
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with hashed password when valid data provided', async () => {})
    it('should throw ValidationError when email is invalid', async () => {})
    it('should throw ConflictError when email already exists', async () => {})
  })
})

// Or: [action] [expected result]
describe('Login', () => {
  it('redirects to dashboard on successful login', () => {})
  it('shows error message on invalid credentials', () => {})
  it('locks account after 5 failed attempts', () => {})
})
```

### Mocking
```typescript
// Mock external dependencies, not internal logic
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock module
vi.mock('./emailService', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
}))

import { sendEmail } from './emailService'
import { createUser } from './userService'

describe('createUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('sends welcome email after creating user', async () => {
    await createUser({ email: 'test@example.com', name: 'Test' })
    
    expect(sendEmail).toHaveBeenCalledWith({
      to: 'test@example.com',
      template: 'welcome',
      data: { name: 'Test' },
    })
  })
  
  it('still creates user if email fails', async () => {
    sendEmail.mockRejectedValueOnce(new Error('SMTP error'))
    
    const user = await createUser({ email: 'test@example.com', name: 'Test' })
    
    expect(user).toBeDefined()
    expect(user.email).toBe('test@example.com')
  })
})
```

### Testing Edge Cases
```typescript
describe('parseAmount', () => {
  // Happy path
  it('parses valid amounts', () => {
    expect(parseAmount('$100.00')).toBe(100.00)
    expect(parseAmount('€1,234.56')).toBe(1234.56)
  })
  
  // Edge cases
  it('handles zero', () => {
    expect(parseAmount('$0.00')).toBe(0)
  })
  
  it('handles large numbers', () => {
    expect(parseAmount('$999,999,999.99')).toBe(999999999.99)
  })
  
  it('handles small decimals', () => {
    expect(parseAmount('$0.01')).toBe(0.01)
  })
  
  // Boundary conditions
  it('throws for negative amounts', () => {
    expect(() => parseAmount('-$100')).toThrow()
  })
  
  // Invalid input
  it('throws for non-numeric input', () => {
    expect(() => parseAmount('abc')).toThrow()
    expect(() => parseAmount('')).toThrow()
    expect(() => parseAmount(null)).toThrow()
  })
})
```

## Integration Testing

### Database Integration Tests
```typescript
import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest'
import { db } from './database'
import { UserRepository } from './userRepository'

describe('UserRepository', () => {
  let repo: UserRepository
  
  beforeAll(async () => {
    // Use test database
    await db.connect(process.env.TEST_DATABASE_URL)
  })
  
  afterAll(async () => {
    await db.disconnect()
  })
  
  beforeEach(async () => {
    // Clean state for each test
    await db.query('DELETE FROM users')
  })
  
  it('creates and retrieves user', async () => {
    const created = await repo.create({
      email: 'test@example.com',
      name: 'Test User',
    })
    
    expect(created.id).toBeDefined()
    
    const found = await repo.findById(created.id)
    expect(found).toMatchObject({
      email: 'test@example.com',
      name: 'Test User',
    })
  })
  
  it('enforces unique email constraint', async () => {
    await repo.create({ email: 'test@example.com', name: 'User 1' })
    
    await expect(
      repo.create({ email: 'test@example.com', name: 'User 2' })
    ).rejects.toThrow('unique constraint')
  })
})
```

### API Integration Tests
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import supertest from 'supertest'
import { app } from './app'

describe('POST /api/users', () => {
  let request: supertest.SuperTest<supertest.Test>
  
  beforeAll(() => {
    request = supertest(app)
  })
  
  it('creates user with valid data', async () => {
    const response = await request
      .post('/api/users')
      .send({
        email: 'test@example.com',
        password: 'securePassword123',
        name: 'Test User',
      })
      .expect(201)
    
    expect(response.body.data).toMatchObject({
      email: 'test@example.com',
      name: 'Test User',
    })
    expect(response.body.data.password).toBeUndefined() // Not exposed
  })
  
  it('returns 422 for invalid email', async () => {
    const response = await request
      .post('/api/users')
      .send({
        email: 'not-an-email',
        password: 'securePassword123',
      })
      .expect(422)
    
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(response.body.error.details).toContainEqual(
      expect.objectContaining({ field: 'email' })
    )
  })
})
```

## E2E Testing

### Playwright Example
```typescript
import { test, expect } from '@playwright/test'

test.describe('User Registration', () => {
  test('completes full registration flow', async ({ page }) => {
    // Navigate to registration
    await page.goto('/register')
    
    // Fill form
    await page.fill('[name="email"]', 'newuser@example.com')
    await page.fill('[name="password"]', 'SecurePass123!')
    await page.fill('[name="confirmPassword"]', 'SecurePass123!')
    
    // Submit
    await page.click('button[type="submit"]')
    
    // Verify success
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toHaveText('Welcome, newuser!')
    
    // Verify email sent (check UI indicator)
    await expect(page.locator('[data-testid="verify-email-banner"]')).toBeVisible()
  })
  
  test('shows validation errors for weak password', async ({ page }) => {
    await page.goto('/register')
    
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', '123')  // Too weak
    await page.click('button[type="submit"]')
    
    await expect(page.locator('.error-message')).toContainText(
      'Password must be at least 8 characters'
    )
  })
})
```

### Testing User Flows
```typescript
test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto('/login')
    await page.fill('[name="email"]', 'testuser@example.com')
    await page.fill('[name="password"]', 'testPassword123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
  })
  
  test('completes purchase with credit card', async ({ page }) => {
    // Add item to cart
    await page.goto('/products/test-product')
    await page.click('[data-testid="add-to-cart"]')
    
    // Go to checkout
    await page.click('[data-testid="cart-icon"]')
    await page.click('text=Checkout')
    
    // Fill payment (use Stripe test card)
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]')
    await stripeFrame.locator('[name="cardnumber"]').fill('4242424242424242')
    await stripeFrame.locator('[name="exp-date"]').fill('12/30')
    await stripeFrame.locator('[name="cvc"]').fill('123')
    
    // Complete order
    await page.click('text=Place Order')
    
    // Verify success
    await expect(page.locator('h1')).toHaveText('Order Confirmed!')
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible()
  })
})
```

## TDD Workflow

```typescript
// 1. Write failing test first (RED)
describe('EmailValidator', () => {
  it('returns true for valid email', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
  })
})
// Test fails: isValidEmail is not defined

// 2. Write minimal code to pass (GREEN)
function isValidEmail(email: string): boolean {
  return email.includes('@')
}
// Test passes (barely)

// 3. Add more tests, refine
it('returns false for email without domain', () => {
  expect(isValidEmail('test@')).toBe(false)
})
// Test fails

// 4. Improve implementation
function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}
// All tests pass

// 5. Refactor with confidence
// Tests ensure behavior stays correct
```

## Test Organization

### File Structure
```
src/
├── user/
│   ├── user.service.ts
│   ├── user.service.test.ts       # Unit tests
│   └── user.repository.ts
├── __tests__/
│   ├── integration/
│   │   └── user.api.test.ts       # API tests
│   └── e2e/
│       └── user-registration.test.ts
tests/
├── fixtures/
│   └── users.json                 # Test data
├── helpers/
│   └── testDb.ts                  # Test utilities
└── setup.ts                       # Global setup
```

## Anti-Patterns

### ❌ Testing Implementation Details
```typescript
// Bad: Testing internal method calls
it('calls validateEmail internally', () => {
  const spy = vi.spyOn(service, 'validateEmail')
  service.createUser({ email: 'test@example.com' })
  expect(spy).toHaveBeenCalled()  // Implementation detail!
})

// Good: Test observable behavior
it('rejects invalid email', async () => {
  await expect(
    service.createUser({ email: 'invalid' })
  ).rejects.toThrow('Invalid email')
})
```

### ❌ Flaky Tests
```typescript
// Bad: Depends on timing
it('shows notification', async () => {
  triggerNotification()
  await sleep(1000)  // Arbitrary wait - flaky!
  expect(screen.getByText('Success')).toBeVisible()
})

// Good: Wait for condition
it('shows notification', async () => {
  triggerNotification()
  await waitFor(() => {
    expect(screen.getByText('Success')).toBeVisible()
  })
})
```

### ❌ Test Interdependence
```typescript
// Bad: Tests depend on each other
it('creates user', async () => {
  createdUser = await createUser({ name: 'Test' })  // Shared state!
})

it('deletes user', async () => {
  await deleteUser(createdUser.id)  // Depends on previous test!
})

// Good: Each test is independent
it('creates and deletes user', async () => {
  const user = await createUser({ name: 'Test' })
  await deleteUser(user.id)
  expect(await findUser(user.id)).toBeNull()
})
```

### ❌ Too Many Mocks
```typescript
// Bad: Mock everything - tests nothing real
it('processes order', () => {
  vi.mock('./inventory')
  vi.mock('./payment')
  vi.mock('./shipping')
  vi.mock('./email')
  vi.mock('./database')
  
  // At this point, what are we even testing?
})

// Good: Test with real dependencies where practical
// Use integration tests for cross-cutting concerns
```