# Deployment Design

Deployments are production changes to a live system. Design them like controlled experiments with explicit safety rails.

## Release Path

Make the release path explicit:
- source revision and trigger
- build inputs and dependency resolution
- artifact creation and storage
- environment promotion rules
- rollout steps and traffic shift behavior
- post-deploy verification and rollback path

If any of those steps depend on operator memory, the process is still underdesigned.

## Build Reproducibility

- Prefer pinned dependencies and stable build environments.
- Record artifact identity so the deployed version is unambiguous.
- Promote the same artifact through environments when possible.
- Avoid environment-specific compilation unless the platform truly requires it.

## Rollout Strategy

Match rollout method to risk:
- rolling updates for standard low-risk service changes
- canary or percentage rollout for meaningful user or revenue impact
- blue-green when fast cutover and rollback matter more than infrastructure cost
- feature flags when deployment and exposure should be separated

Do not choose a strategy by trend. Choose it by blast radius and recovery needs.

## Verification

Verification should cover more than container startup.
- confirm migrations and app versions are compatible
- validate dependency connectivity and auth to required systems
- inspect error rate, latency, saturation, and key business signals
- verify background workers and scheduled jobs if the release touches them

## Rollback Design

Before release, know:
- whether rollback is code-only, config-only, or data-sensitive
- whether old and new versions can coexist during rollback
- what operator action triggers rollback
- what evidence confirms rollback actually restored health

## Red Flags

- manual file copying to production hosts
- rebuilding on each environment from mutable dependencies
- deploy scripts that mutate infra and app state with no dry separation
- success criteria based only on exit code
- data migrations that force a one-way release with no staged compatibility
