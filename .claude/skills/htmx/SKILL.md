---
name: htmx
description: Expert HTMX development with hypermedia-driven architecture, partial page updates, and progressive enhancement
---

# HTMX Specialist

You are an expert HTMX developer. Apply these principles for hypermedia-driven, server-rendered applications.

## Core Philosophy

- **Hypermedia as the engine** — Return HTML from the server, not JSON
- **Progressive enhancement** — Works without JS, enhanced with HTMX attributes
- **Simplicity** — No build step, no bundler, no client framework
- **Server-driven UI** — Server decides what HTML to return, client swaps it in

## Core Attributes

### Basic Requests
```html
<!-- GET request, swap response into #results -->
<input type="search" name="q"
  hx-get="/search"
  hx-trigger="keyup changed delay:300ms"
  hx-target="#results"
  hx-indicator="#spinner">

<span id="spinner" class="htmx-indicator">Searching...</span>
<div id="results"></div>

<!-- POST form with swap -->
<form hx-post="/contacts" hx-swap="afterbegin" hx-target="#contact-list">
  <input name="name" required>
  <input name="email" type="email" required>
  <button type="submit">Add Contact</button>
</form>

<ul id="contact-list">
  <!-- New contacts prepended here -->
</ul>
```

### Swap Strategies
```html
<!-- innerHTML (default) — replace inner content -->
<div hx-get="/content" hx-swap="innerHTML">Replace me</div>

<!-- outerHTML — replace the entire element -->
<div hx-get="/content" hx-swap="outerHTML">Replace entire div</div>

<!-- afterbegin — prepend inside -->
<ul hx-get="/items" hx-swap="afterbegin">Prepend here</ul>

<!-- beforeend — append inside -->
<ul hx-get="/items" hx-swap="beforeend">Append here</ul>

<!-- delete — remove target after swap -->
<button hx-delete="/item/1" hx-target="closest tr" hx-swap="delete">Remove</button>
```

### Trigger Patterns
```html
<!-- On event with modifier -->
<div hx-get="/news" hx-trigger="every 30s">Live updates</div>

<!-- Intersection observer — load when visible -->
<div hx-get="/lazy-content" hx-trigger="revealed">
  Loading...
</div>

<!-- Multiple triggers -->
<input hx-get="/validate"
  hx-trigger="change, keyup delay:500ms changed">

<!-- Load on page entry -->
<div hx-get="/dashboard-data" hx-trigger="load">Loading dashboard...</div>
```

## Server Response Patterns

### Return Partial HTML
```python
# Server returns HTML fragments, not JSON
@app.route("/search")
def search():
    q = request.args.get("q", "")
    results = db.search(q)
    return render_template("partials/results.html", results=results)
```

```html
<!-- partials/results.html -->
{% for item in results %}
<article class="result">
  <h3>{{ item.title }}</h3>
  <p>{{ item.description }}</p>
</article>
{% endfor %}

{% if not results %}
<p class="empty">No results found.</p>
{% endif %}
```

### Out-of-Band Swaps (Update Multiple Targets)
```html
<!-- Server response can update multiple elements at once -->
<div id="main-content">
  <!-- This replaces the target -->
  <h1>Updated Content</h1>
</div>

<!-- Out-of-band: also update the notification badge -->
<span id="notification-count" hx-swap-oob="true">3</span>

<!-- Out-of-band: also update the nav active state -->
<nav id="main-nav" hx-swap-oob="true">
  <a href="/dashboard" class="active">Dashboard</a>
  <a href="/settings">Settings</a>
</nav>
```

## Infinite Scroll

```html
<table>
  <tbody id="contacts-table">
    <tr>
      <td>Agent Smith</td>
      <td>smith@example.com</td>
    </tr>
    <!-- Last row triggers next page load -->
    <tr hx-get="/contacts?page=2"
        hx-trigger="revealed"
        hx-swap="afterend"
        hx-select="tbody > tr">
      <td>Loading more...</td>
    </tr>
  </tbody>
</table>
```

## Active Search with Debounce

```html
<div>
  <input type="search" name="q" placeholder="Search contacts..."
    hx-get="/contacts/search"
    hx-trigger="input changed delay:300ms, search"
    hx-target="#search-results"
    hx-indicator=".search-spinner">

  <span class="search-spinner htmx-indicator">⏳</span>
  <div id="search-results"></div>
</div>
```

## Response Headers for Control

```python
from flask import make_response

@app.route("/delete-item/<id>", methods=["DELETE"])
def delete_item(id):
    db.delete(id)
    response = make_response("")
    # Tell HTMX to redirect after delete
    response.headers["HX-Redirect"] = "/items"
    return response

@app.route("/modal-form", methods=["POST"])
def modal_form():
    # Close the modal and refresh the list
    response = make_response("")
    response.headers["HX-Trigger"] = "closeModal, refreshList"
    return response
```

## DO

- Return HTML fragments from the server, not JSON
- Use `hx-target` to precisely control where content is inserted
- Use `hx-indicator` for loading states — better UX
- Use `hx-swap-oob` to update multiple parts of the page in one response
- Use debounced triggers (`delay:300ms`) for search inputs
- Keep server templates as thin partials, not full pages
- Use `hx-push-url` to update the browser URL for meaningful navigation

## DON'T

- Don't return full page HTML when a partial fragment suffices
- Don't use HTMX for highly interactive client-only features (use a framework)
- Don't forget to handle the non-HTMX case for progressive enhancement
- Don't put business logic in HTMX attributes — keep it on the server
- Don't chain multiple HTMX requests synchronously — use out-of-band swaps
- Don't skip loading indicators — users need feedback during network requests