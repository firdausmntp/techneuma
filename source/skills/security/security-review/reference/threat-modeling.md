# Threat Modeling

Threat modeling is the discipline of making abuse cases explicit before attackers do it for you.

## Start With Assets and Actors

List:
- sensitive data stores
- privileged actions
- trust boundaries
- internal and external actors
- automation that can act without a human in the loop

Then ask which actor can influence which boundary.

## Practical Abuse Cases

Prefer scenario-based questions:
- Can an attacker read another tenant's data by changing an identifier?
- Can they replay a webhook or payment callback?
- Can they trick the server into fetching internal resources?
- Can they cause an admin-only action from an untrusted context?
- Can they upload content that executes later in a browser or worker?

## Trust Boundary Checklist

Review each hop for:
- identity proof
- authorization scope
- validation and canonicalization
- output encoding or safe rendering
- replay protection
- audit trail
- rate or resource limits

## Severity Framing

When recording a finding, note:
- attacker prerequisites
- exploit steps
- impacted data or capability
- blast radius
- evidence that the issue is reachable
- smallest effective remediation

## Common Misses

Teams often miss:
- internal tooling with weak auth assumptions
- background jobs that skip the same authorization logic as HTTP routes
- signed URLs or tokens that never expire
- state changes triggered by GET requests or webhooks without replay protection
- overly broad service credentials shared across environments
