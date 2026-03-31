# Data and State

Backend changes usually fail at the boundaries between writes, retries, and concurrency.

## Model Invariants First

Name the invariants before editing code or schema.
Examples:
- an invoice can be paid once
- a webhook delivery should not create duplicate side effects
- a deployment cannot move from failed to completed without a fresh run

If you cannot state the invariant in one sentence, the model is probably still muddy.

## Persistence Strategy

Pick storage behavior that matches the domain:
- use transactions for tightly coupled state changes
- use append-only events when history matters more than overwriting
- use background reconciliation when external systems confirm work later
- use unique constraints and natural keys to stop duplicate writes

## Concurrency and Retries

Assume requests race and jobs retry.
- design idempotent handlers where possible
- guard critical sections with constraints or explicit locking only where necessary
- avoid read-modify-write logic without concurrency protection
- make retry boundaries obvious in code and logs

## Migrations

Prefer staged migrations for live systems:
1. add new shape
2. dual-write or backfill
3. switch reads
4. remove old shape after verification

Avoid big-bang migrations unless the dataset and downtime window are both trivial.

## External Side Effects

Databases are durable; downstream side effects often are not.
- record intent before making irreversible external calls
- capture correlation ids for each downstream interaction
- make reconciliation possible if the final acknowledgment never arrives
- design dead-letter handling for work that cannot complete automatically

## Review Questions

Ask these before shipping:
- what happens if this request is sent twice?
- what happens if the process crashes between write A and side effect B?
- what happens if two workers process the same entity at once?
- what evidence will prove the state machine still behaves correctly?
