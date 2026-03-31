# Release Risk

Release confidence is a judgment backed by evidence. It is not the same thing as a fully green CI dashboard.

## Risk Framing

Before release, ask:
- what changed technically
- what business workflows are exposed
- what dependencies or environments are involved
- what defect would hurt users most if this fails
- what evidence would show the defect early

## Confidence Sources

Useful confidence signals include:
- new or updated tests closest to the changed logic
- integration coverage for changed boundaries
- production-like verification of config, data shape, and feature flags
- exploratory checks on the highest-risk journeys
- observability or canary signals after rollout begins

## When Confidence Is Weak

Call it out explicitly if:
- the change crosses many layers but only one layer is tested
- a critical path is covered only by manual memory
- acceptance criteria are subjective or unobservable
- bug-prone areas changed without targeted regression coverage
- test results are green only after retries or quarantines

## Review Questions

- what is the smallest credible regression this change could introduce
- which check would catch it first
- what still remains unverified after all planned tests pass
- who will notice if the issue appears in production instead
