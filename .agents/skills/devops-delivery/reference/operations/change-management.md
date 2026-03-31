# Change Management

Operational maturity is the discipline of making risky change understandable before production discovers the gaps.

## Pre-Change Framing

For meaningful releases, note:
- what is changing
- why the change is needed now
- affected services, jobs, data stores, or customer workflows
- prereqs such as migrations, secrets, or feature flags
- expected signals after release

This does not require bureaucracy. It requires clarity.

## Execution Controls

- Use approvals for high-risk or high-blast-radius changes, not for every trivial commit.
- Keep deploy automation idempotent where possible.
- Separate configuration changes from code deploys when they need different rollback paths.
- Use maintenance windows only when the system truly needs coordinated operator attention.

## Incident Readiness

Operators should know:
- who owns the service during rollout
- where to check dashboards and logs first
- how to disable or roll back the change
- what user impact threshold requires escalation
- how to record follow-up actions after stabilization

## Anti-Patterns

- approval gates with no defined review criteria
- alerts that fire during every deploy and teach teams to ignore them
- undocumented hotfix procedures known by only one person
- postmortems that describe symptoms but never tighten the release process
- release checklists so large that no one can distinguish critical steps from noise
