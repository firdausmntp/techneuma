---
name: backend-design
description: Design and refine backend services, APIs, jobs, and integration boundaries with production-grade contracts, failure handling, and operability.
---

Design backend systems that stay understandable under change, fail predictably, and are easy for other engineers to extend.

## Use This Skill When

Use this skill when the task involves:
- API design or endpoint changes
- service boundaries and module decomposition
- background jobs, queues, schedulers, or event flows
- database write paths, consistency, or migration planning
- integration contracts between services or external providers
- reliability, observability, or operational safety for backend code

## Working Style

Start by mapping the request into four things:
1. **Entry points** - routes, handlers, jobs, workers, webhooks, or CLI commands
2. **Core domain flow** - validation, authorization, orchestration, persistence, side effects
3. **Failure modes** - bad input, duplicates, retries, partial success, timeouts, downstream outages
4. **Operational signals** - logs, metrics, tracing, alerts, and admin visibility

Then make the smallest architecture change that keeps those concerns explicit.

## Backend Quality Bar

### Contracts First
Refer to `reference/api-contracts.md`.

Prefer explicit request and response contracts over implied shapes.
- Validate inputs at the boundary.
- Return stable error formats.
- Make idempotency, pagination, filtering, and versioning decisions intentional.
- Distinguish client errors from server errors.

### State and Consistency
Refer to `reference/data-and-state.md`.

Treat writes, retries, and concurrent updates as first-order concerns.
- Name invariants before changing persistence logic.
- Keep transactions narrow.
- Be honest about eventual consistency.
- Design reconciliation paths for jobs and integrations.

### Observability and Operations
Refer to `reference/operations/observability.md`.

Every important backend path should be inspectable in production.
- Log with stable fields, not prose-only strings.
- Emit metrics for throughput, latency, failure rate, and queue depth where relevant.
- Preserve enough context to debug a request without leaking secrets.
- Add operator-facing runbooks or comments only when behavior is otherwise hard to infer.

## Decision Heuristics

When multiple implementations are possible:
- Prefer boring, local code over abstract frameworks.
- Prefer explicit orchestration over clever magic.
- Prefer append-only events or durable state transitions over hidden side effects.
- Prefer one clear owner for a workflow over split responsibility across layers.
- Prefer compatibility-preserving changes unless the task explicitly asks for a breaking redesign.

## Failure Handling

Design the unhappy path as carefully as the happy path.
- Define which operations are retry-safe.
- Handle duplicate deliveries and repeated requests.
- Bound timeouts and surface degraded behavior clearly.
- Avoid silent drops; if work cannot finish, expose that state.
- When partial failure is possible, leave the system in a recoverable condition.

## Output Expectations

When you implement or review backend work:
- explain the entry point, state change, and side effects clearly
- call out invariants that must remain true
- note migration or rollout concerns before changing data shapes
- include operational follow-through such as logging, metrics, and admin visibility when it materially affects supportability

## Never Do This

- Do not collapse validation, authorization, persistence, and formatting into one opaque function when separable boundaries would be clearer.
- Do not add asynchronous work without defining retry, deduplication, and dead-letter behavior.
- Do not hide breaking API changes behind unchanged routes or field names.
- Do not log credentials, tokens, raw secrets, or full PII payloads.
- Do not assume downstream systems are fast, correct, or always available.

A strong backend change reads like a controlled system design document in code form: clear boundary, clear invariants, clear failure behavior, clear observability.