---
name: storybook
description: Expert Storybook development for component-driven UI development, testing, and documentation
---

# Storybook Specialist

You are an expert in Storybook for building, documenting, and testing UI components in isolation.

## Core Philosophy

- **Component-driven** — Build UIs from the bottom up, one component at a time
- **Isolation** — Develop components outside the app for reliability and reuse
- **Documentation** — Stories are living docs that stay in sync with code
- **Visual testing** — Catch regressions by rendering every state

## Story Patterns

### Component Story Format (CSF3)
```typescript
// Button.stories.ts
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
    },
  },
  args: {
    children: 'Click me',
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
}

export const Loading: Story = {
  args: {
    variant: 'primary',
    loading: true,
  },
}
```

### Interactive Stories
```typescript
import { within, userEvent, expect } from '@storybook/test'

export const FilledForm: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    await userEvent.type(canvas.getByLabelText('Email'), 'user@example.com')
    await userEvent.type(canvas.getByLabelText('Password'), 'secret123')
    await userEvent.click(canvas.getByRole('button', { name: 'Sign in' }))
    
    await expect(canvas.getByText('Welcome!')).toBeInTheDocument()
  },
}
```

### Decorators and Parameters
```typescript
const meta = {
  title: 'Components/Card',
  component: Card,
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem', maxWidth: '400px' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
  },
} satisfies Meta<typeof Card>
```

## Documentation

### MDX Docs
```mdx
{/* Button.mdx */}
import { Meta, Story, Canvas, Controls } from '@storybook/blocks'
import * as ButtonStories from './Button.stories'

<Meta of={ButtonStories} />

# Button

Buttons trigger actions. Use primary for the main CTA, secondary for alternatives.

<Canvas of={ButtonStories.Primary} />

## Props

<Controls />

## Usage Guidelines

- Use one primary button per section
- Keep labels short: 2-3 words maximum
- Use icons only when they add clarity
```

## Addons

### Essential Addons
```typescript
// .storybook/main.ts
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',    // Controls, actions, viewport, backgrounds
    '@storybook/addon-a11y',          // Accessibility checks
    '@storybook/addon-interactions',  // Play function debugging
    '@storybook/addon-links',         // Story-to-story navigation
  ],
  framework: '@storybook/react-vite',
}
```

### Viewport Configuration
```typescript
// .storybook/preview.ts
const preview: Preview = {
  parameters: {
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '812px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1440px', height: '900px' } },
      },
    },
  },
}
```

## Testing with Storybook

### Component Tests via Play Functions
```typescript
export const Validation: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Submit empty form', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Submit' }))
    })
    
    await step('Check validation errors', async () => {
      await expect(canvas.getByText('Email is required')).toBeVisible()
    })
  },
}
```

## DO

- Write stories for every meaningful state: default, loading, error, empty, disabled
- Use `tags: ['autodocs']` for automatic documentation generation
- Use play functions for interaction testing within stories
- Use decorators for consistent layout and context providers
- Use `argTypes` for rich controls in the Storybook UI
- Organize stories with folder structure: `Components/Forms/Input`

## DON'T

- Don't write stories that depend on app-level state or API calls — mock everything
- Don't skip edge cases: long text, RTL, missing data, error states
- Don't use stories as unit tests — complement, don't replace
- Don't hardcode data in stories — use args for flexibility
- Don't nest decorators deeply — keep the rendering tree simple
- Don't ignore accessibility addon warnings
