---
name: qa-strategy
description: Design and review test strategy, release confidence, and defect prevention across unit, integration, end-to-end, exploratory, and operational quality checks.
domains:
  - qa
  - testing
  - reliability
license: Apache 2.0.
---

Approach quality like an engineer who needs fast feedback, trustworthy releases, and defect signals that lead to action instead of ritual.

## Use This Skill When

Use this skill when the task touches:
- automated test coverage, missing test layers, or brittle test suites
- release confidence, regression risk, or defect triage
- flaky end-to-end tests, test environment drift, or fixture instability
- acceptance criteria, exploratory testing, or edge-case planning
- quality gates in CI, pull request checks, or pre-release verification
- bug reproduction, isolation, and prevention after incidents or regressions

## QA Workflow

1. **Map the product risk** - critical journeys, high-change surfaces, money flows, permissions, integrations, data integrity
2. **Locate existing signal** - unit tests, integration tests, e2e checks, observability, support trends, bug history
3. **Find the gap** - missing layer, weak oracle, unstable fixture, untested edge case, slow feedback loop
4. **Choose the cheapest trustworthy check** - smallest test or review step that can reliably catch the risk
5. **Define release confidence** - what must pass, what can be sampled, and what still requires exploratory judgment

## Core QA Lenses

### Test Strategy
Refer to `reference/test-strategy.md`.

Coverage quality matters more than raw test count.
- Match test depth to business and technical risk.
- Keep fast feedback near the code that changes most often.
- Use integration tests for contracts and state interactions.
- Reserve end-to-end tests for critical cross-system journeys.

### Release Risk
Refer to `reference/release-risk.md`.

Release confidence should be based on evidence, not habit.
- Weight coverage by blast radius and change complexity.
- Call out what is unverified, not just what passed.
- Make acceptance criteria observable in test output or manual checks.
- Treat bug clusters as strategy feedback, not isolated accidents.

### Automation and Flake Control
Refer to `reference/automation/flaky-and-e2e.md`.

Unstable tests erode trust faster than missing tests.
- Design stable selectors, fixtures, and environment assumptions.
- Remove hidden timing races and shared mutable state.
- Track flake as a reliability problem, not a nuisance metric.
- Prefer fewer trustworthy end-to-end tests over large noisy suites.

## Decision Heuristics

When several testing approaches are possible:
- prefer the fastest test that exercises the actual failure mode
- prefer explicit assertions over snapshot noise or vague golden files
- prefer contract and integration checks for system boundaries over UI-heavy duplication
- prefer focused regression coverage for known bug classes over sprawling generic suites
- prefer deleting untrusted tests over keeping ceremonial checks that teams ignore

## Quality Bar

A strong QA change should make it clear:
- which risks are covered by automated checks and which still need human judgment
- why each test layer exists and what defect class it catches
- how failures are triaged without guesswork
- how the suite avoids duplicating the same assertion across slower layers
- what evidence supports shipping after a risky change

## Never Do This

- Do not chase coverage percentages without asking what failures still escape.
- Do not put every scenario into end-to-end tests because unit or integration work feels harder.
- Do not normalize flaky tests by rerunning until green and calling that stability.
- Do not write assertions so weak that they only prove a screen rendered.
- Do not treat exploratory testing as random clicking without risk framing or note-taking.

A strong QA practice turns quality into a system of credible signals, not a pile of green checkmarks.
