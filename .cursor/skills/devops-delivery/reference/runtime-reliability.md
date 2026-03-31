# Runtime Reliability

Many outages begin after a technically successful deploy. Reliability depends on how the system behaves under load, dependency failure, and operator intervention.

## Health Signals

Distinguish:
- liveness: should the process restart
- readiness: can this instance safely receive traffic
- dependency health: are critical downstream systems available enough to serve correctly

Readiness checks should fail when the service would only produce fast errors.

## Capacity and Concurrency

- Tie worker counts, connection pools, and queue consumers to real resource limits.
- Watch saturation signals, not just CPU averages.
- Avoid autoscaling rules that amplify downstream overload.
- Make queue backlog age and retry growth visible when async work matters.

## Failure Containment

- Bound retries with timeouts, backoff, and circuit-breaking behavior where appropriate.
- Prefer degraded service over total collapse when dependencies are optional.
- Shed non-critical work before critical request paths fail.
- Keep bulk operations from starving latency-sensitive traffic.

## Observability for Operators

Useful runtime signals include:
- request and job throughput
- latency percentiles
- error rate by operation and dependency
- queue depth and age
- saturation of threads, memory, CPU, or connection pools
- restart frequency and rollout correlation

## Review Questions

Ask before shipping:
- what happens if traffic doubles during rollout
- what happens if one dependency becomes slow but not fully down
- which signal shows that scaling is masking a leak or retry storm
- how quickly can an operator tell whether the system is degrading or recovering
