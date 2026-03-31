---
name: devops-delivery
description: Design and improve build, deploy, runtime, and incident workflows so systems ship safely, recover quickly, and stay operable under real production pressure.
domains:
  - devops
  - delivery
  - operations
license: Apache 2.0.
---

Approach delivery systems like an engineer who has to ship every week, respond to incidents at 2 a.m., and explain operational tradeoffs to the rest of the team.

## Use This Skill When

Use this skill when the task involves:
- CI/CD pipelines, release orchestration, or deploy automation
- environment promotion, configuration management, or secret injection
- container, runtime, infrastructure, or service rollout changes
- incident readiness, alerting, rollback, or operational debugging paths
- reliability controls such as health checks, autoscaling, retries, and dependency protection
- build reproducibility, artifact provenance, or change safety in shared systems

## Delivery Workflow

1. **Map the release path** - source change, build, artifact, environment, deploy target, verification, rollback
2. **Identify the blast radius** - service scope, tenant impact, data risk, downstream dependencies, operator burden
3. **Review control points** - approvals, policy gates, secrets, health signals, progressive rollout, rollback triggers
4. **Trace failure behavior** - broken build, partial rollout, bad config, dependency outage, migration mismatch, alert fatigue
5. **Design for recovery** - fast diagnosis, safe rollback, degraded mode, operator visibility, post-release follow-up

## Core DevOps Lenses

### Deployment Design
Refer to `reference/deployment-design.md`.

Treat deployments as controlled state transitions, not hopeful file copies.
- Make artifacts reproducible and environment assumptions explicit.
- Prefer promotion of the same built artifact across environments.
- Keep rollout strategy visible in code or pipeline configuration.
- Separate deploy success from true release health.

### Runtime Reliability
Refer to `reference/runtime-reliability.md`.

Production safety depends on behavior after the deploy starts.
- Define health checks around real readiness, not only process liveness.
- Expect cold starts, retries, backpressure, and partial dependency failure.
- Keep scaling and concurrency settings tied to system limits, not guesswork.
- Preserve enough telemetry to explain saturation, failure, and recovery.

### Change Management and Incidents
Refer to `reference/operations/change-management.md`.

Good operations reduce surprise before and during incidents.
- Make risky changes legible before rollout.
- Document verification steps and rollback criteria.
- Keep operator actions explicit when automation cannot fully recover.
- Prefer short incident paths over heroic tribal knowledge.

## Decision Heuristics

When several delivery designs are possible:
- prefer deterministic pipelines over manually reconstructed releases
- prefer immutable artifacts over environment-specific rebuilds
- prefer progressive rollout over all-at-once deployment when blast radius is meaningful
- prefer simple rollback mechanics over fragile forward-only optimism
- prefer explicit ownership for alerts, dashboards, and runbooks over shared ambiguity

## Operational Quality Bar

A strong DevOps change should answer:
- what is being deployed, by whom, and from which artifact
- what verifies correctness before users feel the impact
- what happens if the new version starts failing after partial rollout
- which signals tell operators whether to continue, pause, or roll back
- how secrets, config, and data migrations stay aligned across environments

## Never Do This

- Do not treat a green build as proof that production rollout is safe.
- Do not rebuild different artifacts per environment when promotion would preserve confidence.
- Do not add health checks that pass before the service can actually serve traffic safely.
- Do not hide manual release steps in tribal knowledge or chat history.
- Do not make rollback impossible by coupling code deploys, config flips, and irreversible data changes without a plan.

A strong DevOps improvement makes change safer to ship, easier to observe, and faster to recover when reality diverges from plan.
