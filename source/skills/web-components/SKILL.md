---
name: web-components
description: Expert Web Components development with Custom Elements, Shadow DOM, declarative templates, and interop patterns
---

# Web Components Specialist

You are an expert Web Components developer. Apply these principles for framework-agnostic, standards-based UI components.

## Core Philosophy

- **Standards-based** — Custom Elements, Shadow DOM, HTML Templates are browser-native
- **Framework agnostic** — Works in React, Vue, Svelte, Angular, or plain HTML
- **Encapsulation** — Shadow DOM prevents style leaks and naming collisions
- **Longevity** — Web standards outlast any framework

## Custom Elements

### Defining a Component
```javascript
class AppButton extends HTMLElement {
  static observedAttributes = ['variant', 'disabled'];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.shadowRoot.querySelector('button')
      ?.addEventListener('click', this.#handleClick);
  }

  disconnectedCallback() {
    this.shadowRoot.querySelector('button')
      ?.removeEventListener('click', this.#handleClick);
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal) this.render();
  }

  #handleClick = (e) => {
    if (this.hasAttribute('disabled')) {
      e.preventDefault();
      return;
    }
    this.dispatchEvent(new CustomEvent('btn-click', {
      bubbles: true,
      composed: true, // crosses shadow boundary
      detail: { variant: this.getAttribute('variant') },
    }));
  };

  get variant() { return this.getAttribute('variant') || 'primary'; }

  render() {
    const disabled = this.hasAttribute('disabled');
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        :host([disabled]) {
          opacity: 0.5;
          pointer-events: none;
        }
        button {
          font: inherit;
          cursor: pointer;
          padding: 0.5em 1.25em;
          border: none;
          border-radius: 6px;
          background: var(--btn-bg, #3b82f6);
          color: var(--btn-color, white);
          transition: filter 0.15s;
        }
        button:hover { filter: brightness(1.1); }
        :host([variant="danger"]) button { background: #ef4444; }
        :host([variant="ghost"]) button {
          background: transparent;
          color: inherit;
          border: 1px solid currentColor;
        }
      </style>
      <button ${disabled ? 'disabled' : ''}>
        <slot></slot>
      </button>
    `;
  }
}

customElements.define('app-button', AppButton);
```

### Usage in HTML
```html
<app-button variant="primary">Save</app-button>
<app-button variant="danger" disabled>Delete</app-button>

<script>
  document.querySelector('app-button')
    .addEventListener('btn-click', (e) => {
      console.log('Clicked:', e.detail.variant);
    });
</script>
```

## Shadow DOM

### Slots for Content Projection
```javascript
class AppCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          border-radius: 12px;
          overflow: hidden;
          background: var(--card-bg, white);
          box-shadow: 0 1px 3px oklch(0% 0 0 / 10%);
        }
        .header { padding: 1rem 1.5rem; border-bottom: 1px solid #eee; }
        .body   { padding: 1.5rem; }
        .footer { padding: 1rem 1.5rem; border-top: 1px solid #eee; }

        /* Hide sections when slot is empty */
        .header:not(:has(::slotted(*))) { display: none; }
        .footer:not(:has(::slotted(*))) { display: none; }
      </style>

      <div class="header"><slot name="header"></slot></div>
      <div class="body"><slot></slot></div>
      <div class="footer"><slot name="footer"></slot></div>
    `;
  }
}

customElements.define('app-card', AppCard);
```

```html
<app-card>
  <h3 slot="header">Card Title</h3>
  <p>This is the default slot content.</p>
  <div slot="footer">
    <app-button>Action</app-button>
  </div>
</app-card>
```

## CSS Custom Properties as API

```css
/* Consumer customizes via CSS variables — no JS needed */
app-button {
  --btn-bg: oklch(55% 0.25 145);
  --btn-color: white;
}

.dark-theme app-card {
  --card-bg: #1e1e1e;
}
```

## Form-Associated Custom Elements

```javascript
class AppInput extends HTMLElement {
  static formAssociated = true;
  static observedAttributes = ['value', 'required', 'name'];

  #internals;

  constructor() {
    super();
    this.#internals = this.attachInternals();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        input {
          font: inherit;
          padding: 0.5em 0.75em;
          border: 1px solid #ccc;
          border-radius: 6px;
          width: 100%;
        }
        input:focus { outline: 2px solid var(--focus-color, #3b82f6); }
        :host(:state(invalid)) input { border-color: red; }
      </style>
      <input type="text">
    `;

    const input = this.shadowRoot.querySelector('input');
    input.addEventListener('input', () => {
      this.#internals.setFormValue(input.value);
      this.#validate(input.value);
    });
  }

  #validate(value) {
    if (this.hasAttribute('required') && !value) {
      this.#internals.setValidity(
        { valueMissing: true },
        'This field is required',
        this.shadowRoot.querySelector('input')
      );
    } else {
      this.#internals.setValidity({});
    }
  }

  get value() { return this.shadowRoot.querySelector('input')?.value; }
}

customElements.define('app-input', AppInput);
```

## Lit (Recommended Library)

```javascript
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('app-counter')
class AppCounter extends LitElement {
  static styles = css`
    :host { display: block; text-align: center; }
    button { font-size: 1.5rem; padding: 0.5em 1em; }
    .count { font-size: 3rem; font-weight: bold; }
  `;

  @property({ type: Number }) start = 0;
  @state() private count = 0;

  connectedCallback() {
    super.connectedCallback();
    this.count = this.start;
  }

  render() {
    return html`
      <div class="count">${this.count}</div>
      <button @click=${() => this.count--}>-</button>
      <button @click=${() => this.count++}>+</button>
    `;
  }
}
```

## DO

- Use Shadow DOM for style encapsulation and DOM isolation
- Use CSS custom properties as the public styling API
- Use `composed: true` on events that need to cross shadow boundaries
- Use named slots for flexible content projection
- Use `observedAttributes` + `attributeChangedCallback` for reactive attributes
- Use Lit or Stencil for complex component libraries (reduces boilerplate)
- Register elements with a namespace prefix: `app-`, `ui-`, etc.

## DON'T

- Don't extend built-in elements (`extends: 'button'`) — poor browser support
- Don't manipulate light DOM children directly — use slots
- Don't use `innerHTML` in hot loops — use `<template>` cloning for performance
- Don't forget `disconnectedCallback` for cleanup (event listeners, observers)
- Don't skip the `mode: 'open'` option unless you have a strong reason for closed mode
- Don't create Shadow DOM for every element — leaf text nodes don't need it
