---
name: security-review
description: Review application changes for authentication, authorization, data exposure, dependency risk, and operational abuse paths with concrete remediation guidance.
license: Apache 2.0.
---

Review code and architecture like an application security engineer who also understands delivery constraints. Focus on realistic exploit paths, not checkbox theater.

## Use This Skill When

Use this skill when the task touches:
- authentication, sessions, tokens, or credentials
- authorization and tenant isolation
- file upload, rich text, templating, or user-controlled rendering
- secrets handling, configuration, or CI/CD release flow
- new integrations, webhooks, or third-party SDKs
- dependency changes, package execution, or supply-chain trust
- logging, observability, or data retention of sensitive information

## Security Review Workflow

1. **Map trust boundaries** - browser, server, worker, database, queue, third-party service, operator tooling
2. **Identify attacker-controlled input** - params, headers, files, webhook bodies, templates, markdown, redirects, environment values
3. **Trace sensitive actions** - login, privilege changes, billing actions, data export, destructive mutations, secret access
4. **Evaluate controls** - authentication, authorization, validation, output encoding, rate limiting, audit trails, alerting
5. **Document exploitability** - preconditions, blast radius, and the smallest credible fix

## Core Security Lenses

### Threat Modeling
Refer to `reference/threat-modeling.md`.

Model realistic abuse before proposing fixes.
- Ask who can trigger the path.
- Ask what data or capability could be gained.
- Ask what trust assumption could be broken.
- Prefer concrete abuse cases over generic OWASP name-dropping.

### Authentication and Session Safety
Refer to `reference/auth-and-session.md`.

Treat identity boundaries as critical infrastructure.
- Keep session issuance, rotation, expiration, and revocation explicit.
- Separate authentication from authorization.
- Verify tenant scoping and resource ownership on every privileged path.
- Minimize long-lived credentials and overbroad tokens.

### Secrets and Supply Chain
Refer to `reference/operations/secrets-and-supply-chain.md`.

Protect the path from source code to runtime.
- Keep secrets out of code, logs, and client bundles.
- Scrutinize new dependencies, install scripts, and post-build execution.
- Limit who and what can mutate production configuration.

## Review Priorities

Prioritize findings in this order:
1. account takeover or privilege escalation
2. cross-tenant or mass data exposure
3. injection, unsafe deserialization, or arbitrary code execution paths
4. secrets leakage or signing-key misuse
5. denial-of-service and abuse amplification
6. missing auditability on sensitive actions

## Good Security Guidance

Strong security recommendations are:
- specific to the code path being reviewed
- tied to an attacker capability
- realistic about rollout cost and compatibility
- explicit about residual risk if the mitigation is partial

## Never Do This

- Do not describe a vulnerability without explaining the exploit path.
- Do not suggest security theater controls that do not reduce the actual risk.
- Do not assume internal callers are trustworthy without evidence.
- Do not log or copy secrets into examples, tests, or docs.
- Do not collapse authorization into UI visibility checks.

A good security review leaves the team with a clear threat model, a ranked set of real findings, and fixes that measurably reduce risk.