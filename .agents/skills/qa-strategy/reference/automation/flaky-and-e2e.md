# Flaky and End-to-End Testing

End-to-end coverage is valuable only when failures mean something. Flake destroys that trust.

## Common Causes of Flake

- shared mutable test data across runs
- selectors tied to layout or presentation instead of stable semantics
- arbitrary sleeps instead of waiting on meaningful conditions
- background jobs, polling, or eventual consistency with no synchronization strategy
- test environments that drift from one run to the next

## Stabilization Tactics

- create deterministic fixtures with explicit ownership and cleanup
- wait on domain events, network completion, or visible state transitions
- isolate tests so parallelism does not create hidden coupling
- mock only the dependency layers that are not relevant to the behavior under test
- fail with diagnostics that help distinguish app bugs from test harness bugs

## E2E Scope Control

Keep end-to-end suites small and sharp:
- cover sign-in, checkout, permissions, critical creation flows, and other cross-system journeys
- avoid validating every branch of business logic through the browser when lower layers can do it faster
- prefer one robust happy-path test plus a few high-value failure modes over exhaustive UI enumeration

## Red Flags

- rerun-until-green as the default flake strategy
- quarantined tests that never return to active maintenance
- tests that pass locally but fail in CI because timing assumptions are implicit
- browser tests used to detect bugs that actually originate in stable backend contracts
