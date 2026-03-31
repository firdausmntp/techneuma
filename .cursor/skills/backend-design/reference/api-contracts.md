# API Contracts

Treat the interface as a product for other engineers.

## Boundary Design

Define each backend boundary explicitly:
- request shape and required fields
- authentication and authorization requirements
- success payload shape
- error payload shape
- rate limits, idempotency keys, or replay behavior
- pagination, filtering, sorting, and ordering guarantees

If the system already has conventions, reuse them instead of inventing a parallel contract style.

## Input Validation

Validate as close to the boundary as possible.
- Reject malformed input before domain logic runs.
- Normalize data only when the normalization rule is stable and well understood.
- Surface actionable validation errors with field-level detail when possible.
- Separate syntactic validation from business-rule validation.

## Output Design

Responses should be easy to depend on.
- Keep field names stable and intentional.
- Prefer additive evolution to breaking renames.
- Return machine-usable identifiers and statuses, not display-only strings.
- For lists, define ordering and continuation semantics.

## Error Design

Error responses should help clients recover.
- Use stable error codes.
- Include a human-readable message plus structured context when safe.
- Distinguish invalid input, unauthorized access, forbidden actions, missing resources, conflict states, and transient server failures.
- Avoid leaking internal topology, SQL fragments, or stack traces.

## Change Management

Before changing a contract, answer:
1. Who consumes this today?
2. Is the change additive, behavior-changing, or breaking?
3. Does it require versioning, deprecation, or migration support?
4. What telemetry will confirm clients adopted the new shape?

## Practical Defaults

- Prefer cursor or token pagination over offset pagination for large mutable datasets.
- Prefer explicit enums over free-form strings when the domain is bounded.
- Prefer idempotent create/update behavior when retries are likely.
- Prefer documented nullability over ambiguous missing fields.
