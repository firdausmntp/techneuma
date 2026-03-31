# Secrets and Supply Chain

Security failures often start long before runtime logic.

## Secrets Handling

- Keep secrets in dedicated secret stores or protected environment configuration.
- Never commit private keys, tokens, or plaintext credentials.
- Do not expose server-only configuration to client bundles or build logs.
- Rotate credentials when ownership changes or exposure is suspected.
- Scope secrets per environment and per service when possible.

## Build and Dependency Trust

Review dependency changes with the same skepticism as code changes.
- inspect new packages for install scripts and unusual postinstall behavior
- prefer pinned or well-governed dependencies for critical paths
- verify lockfile changes match the intended package update
- understand transitive packages added to sensitive surfaces

## CI/CD and Runtime Controls

- limit who can trigger deploys or mutate production secrets
- protect release pipelines from untrusted pull request execution
- separate build-time secrets from runtime secrets where possible
- verify artifact provenance if the environment supports it

## Logging and Diagnostics

Operational tooling can leak as much as product code.
- scrub secrets from logs, traces, crash reports, and analytics
- avoid printing environment dumps in support scripts
- treat signed URLs, API keys, and session material as secrets even if short-lived

## Review Questions

Ask:
- what new code or package can execute during install, build, or release?
- what credential does this path need, and can it be narrowed?
- if a build log leaked publicly, what would be compromised?
- how would we detect and rotate a secret exposed by this change?
