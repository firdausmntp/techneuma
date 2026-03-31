# Clarify Examples

Use this reference when invoking `clarify` so the request quality is high and output is production-ready.

## DO (Good)

### Good Request A

```text
Apply /clarify to the checkout area.
Context: Improve unclear UX copy, error messages, microcopy, labels, and instructions. Makes interfaces easier to understand and use.
Goal: Improve user outcomes and keep implementation maintainable.
Constraints: Keep existing architecture, preserve accessibility, include verification steps.
```

Why this is good:
- Clear target area and explicit goal.
- Defines constraints and expected quality bar.
- Encourages measurable outcomes and validation.

### Good Request B

```text
Use /clarify for onboarding flow v2.
Deliverables: risk notes, step-by-step plan, implementation changes, and test checklist.
Include edge cases, failure states, and rollback strategy.
```

Why this is good:
- Requests complete execution, not only ideas.
- Includes risk and rollback thinking for safer changes.
- Forces operational completeness and testability.

## DON'T (Not Good)

### Bad Request A

```text
Do /clarify quickly.
```

Why this is not good:
- No target scope or acceptance criteria.
- No quality constraints, so output can be generic.
- No verification, so regressions are likely.

### Bad Request B

```text
Use /clarify and make it look cool.
```

Why this is not good:
- "Look cool" is subjective and not measurable.
- Ignores user needs, system constraints, and maintainability.
- Encourages style-first decisions without functional rigor.

## Good vs Not Good Quick Check

Good signals:
- Scope, goals, constraints, and verification are explicit.
- Output includes implementation and validation details.
- Edge cases and failure handling are addressed.

Not good signals:
- Vague intent, no target scope, no success criteria.
- Cosmetic direction without product or technical context.
- No testing, no risk handling, no completion checklist.
