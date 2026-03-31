# Test Strategy

Testing is portfolio design. Each layer should catch a class of failures at the cheapest point that still produces confidence.

## Start With Risk

Map:
- critical user journeys
- money, auth, and data integrity paths
- high-churn modules
- external integrations and schema boundaries
- failure-prone areas from bug history or support load

If a test suite is large but none of those risks are intentionally covered, the strategy is still weak.

## Layer Selection

- unit tests for deterministic logic, branching, formatting, validation, and edge conditions
- integration tests for persistence, queueing, service contracts, and module boundaries
- end-to-end tests for a small number of user-critical journeys and cross-system handoffs
- exploratory testing for ambiguity, novel UX, or areas where the expected behavior is still being refined

## Oracles and Assertions

Strong tests assert meaningful outcomes:
- state changed correctly
- the right side effect happened once
- the error surfaced with the right semantics
- the downstream contract stayed compatible

Weak tests assert that code ran, a page loaded, or a snapshot changed.

## Maintenance Rules

- Keep fixtures understandable and local to the behavior under test.
- Avoid giant helper layers that obscure what is being verified.
- Split tests when a single failure could have many causes.
- Remove redundant slow tests that only repeat lower-layer assertions.
