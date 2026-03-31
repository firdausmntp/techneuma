# Modeling and Contracts

Data modeling is the work of preserving business meaning in a form that survives growth, new consumers, and source-system drift.

## Grain First

State the grain in one sentence.
Examples:
- one row per order
- one row per account per billing month
- one event per user action emitted by the product client

If the grain is unclear, joins and metrics will drift quickly.

## Keys and Identity

- Prefer stable business or system identifiers with clear ownership.
- Record how duplicates are detected and resolved.
- Keep surrogate keys from hiding unresolved source identity problems.
- Distinguish entity identity from event identity when both matter.

## Contracts

Define contracts for:
- field meaning and units
- nullability and default behavior
- enum values and lifecycle states
- update cadence and freshness expectations
- breaking versus additive schema changes

## Semantic Stability

- Separate raw ingestion tables from cleaned and curated models.
- Keep derived metrics in governed transformation layers when possible.
- Avoid shipping business logic only inside dashboards or notebook fragments.
- Version or announce contract changes before downstream teams discover them by surprise
