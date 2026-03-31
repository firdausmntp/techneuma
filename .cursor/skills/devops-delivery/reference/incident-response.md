# Incident Response

Incident response quality is determined before the page goes off. A resilient delivery system shortens detection, diagnosis, containment, and recovery.

## First Questions

At incident start, establish:
- what users or systems are impacted
- what changed recently
- whether the system is failing hard, degrading, or producing incorrect results
- which mitigations are safe immediately
- who owns coordination and technical recovery

## Containment

- Stop the blast radius before chasing every root cause detail.
- Roll back, disable, rate-limit, or isolate the failing path when that reduces user harm.
- Prefer reversible mitigations over risky live surgery during active impact.
- Record what was changed so later diagnosis is not guesswork.

## Diagnosis

Use evidence in this order:
- timeline of deploys, config changes, dependency incidents, and alerts
- logs, traces, and metrics tied to the affected workflow
- comparison between healthy and failing cohorts, regions, or versions
- confirmation that the apparent symptom is not just a secondary effect

## Recovery and Follow-Through

- Define what service health looks like before declaring the incident resolved.
- Verify recovery in customer-visible signals, not just infrastructure status.
- Capture missing dashboards, automation gaps, and confusing runbook steps while the details are fresh.
- Turn repeated manual recovery steps into explicit automation or safer controls.

## Anti-Patterns

- debating root cause while the blast radius is still expanding
- changing many variables at once with no timeline discipline
- resolving the page without confirming that queued or delayed work has recovered
- writing postmortems that do not change alerting, rollout safety, or operator tooling
