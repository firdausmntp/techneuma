# Observability

A backend system is not production-ready if operators cannot explain what happened.

## Logging

Prefer structured logs with stable keys.
Include:
- request, job, or trace id
- actor or tenant id when safe
- operation name
- outcome status
- retry attempt or queue metadata when applicable

Do not log secrets, access tokens, session material, raw credentials, or full sensitive payloads.

## Metrics

Measure the shape of the workload, not just failures.
Useful backend metrics include:
- request rate
- error rate by endpoint or operation
- duration percentiles
- queue depth and age
- retry count
- downstream dependency failures
- dead-letter counts

## Tracing

Trace multi-step workflows when work crosses services, queues, or external APIs.
Span boundaries should make it clear:
- where the request entered
- which dependencies were called
- where latency accumulated
- where a failure was raised or swallowed

## Operator Experience

Support humans who debug incidents.
- error messages should say what failed and what was attempted
- admin tooling should expose stuck or failed work when the domain requires intervention
- alerts should map to user impact or data risk, not just noisy raw exceptions

## Rollout Checks

For significant backend changes, define how you will verify the release:
- expected baseline metrics
- anomaly thresholds
- log queries or dashboards to inspect
- rollback criteria if the new path misbehaves
