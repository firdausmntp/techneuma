---
name: data-engineering
description: Design and review analytical pipelines, data models, transformation jobs, and governance controls so data stays trustworthy, traceable, and useful under continuous change.
license: Apache 2.0.
---

Approach data work like an engineer responsible for both correctness and downstream trust. The goal is not just to move data, but to preserve meaning, lineage, and decision quality as systems evolve.

## Use This Skill When

Use this skill when the task involves:
- warehouse modeling, semantic layers, marts, or canonical datasets
- ETL or ELT pipelines, batch jobs, streaming ingestion, or backfills
- schema evolution, data contracts, or breaking downstream model changes
- metric definition, dimensional consistency, or cross-source reconciliation
- lineage, access control, retention, privacy, or compliance-sensitive datasets
- incident response for stale, duplicated, missing, or corrupt analytical data

## Data Workflow

1. **Identify producers and consumers** - source systems, transformations, dashboards, ML features, exports, finance or ops stakeholders
2. **Define the truth boundary** - canonical ids, event time, business grain, ownership, and accepted latency
3. **Trace the pipeline** - ingestion, normalization, joins, aggregation, storage, serving, and recovery paths
4. **Check failure behavior** - late data, schema drift, duplicates, null explosions, replay, backfill collisions, permission leaks
5. **Protect trust** - validation, lineage, reconciliation, documentation, and change management for downstream consumers

## Core Data Lenses

### Modeling and Contracts
Refer to `reference/modeling-and-contracts.md`.

Good data systems preserve business meaning under change.
- Model at a clear grain with explicit keys.
- Define contracts for schemas, nullability, and field semantics.
- Separate raw capture from curated business-ready models.
- Make metric definitions stable and reviewable.

### Pipeline Reliability
Refer to `reference/pipelines-and-reliability.md`.

Data pipelines fail through drift, retries, and partial processing as often as through obvious crashes.
- Design loads to be replayable and bounded.
- Handle late-arriving and duplicate records intentionally.
- Make freshness and completeness visible.
- Plan backfills and reprocessing before they become urgent.

### Lineage, Access, and Governance
Refer to `reference/governance/lineage-and-access.md`.

Trust collapses when teams cannot tell where data came from or who should see it.
- Keep dataset ownership explicit.
- Track lineage across important transformations.
- Minimize access to sensitive or high-risk data.
- Align retention and deletion behavior with business and legal expectations.

## Decision Heuristics

When multiple data designs are possible:
- prefer stable business keys and explicit grain over convenient but ambiguous joins
- prefer additive schema evolution over silent semantic rewrites
- prefer idempotent loads and replayable jobs over one-shot scripts
- prefer documented metric logic over duplicated dashboard calculations
- prefer narrower trusted datasets over sprawling tables that mix incompatible meanings

## Data Quality Bar

A strong data change should make it clear:
- what the dataset represents and at what grain
- how freshness, completeness, and correctness are validated
- how downstream consumers learn about contract changes
- how replay, backfill, and partial failure are handled
- which sensitive fields exist and who should have access to them

## Never Do This

- Do not join sources with incompatible grain and call the result canonical.
- Do not silently reinterpret a metric while keeping the same column or dashboard name.
- Do not backfill production data with one-off scripts that cannot be reviewed or replayed.
- Do not expose raw sensitive fields broadly because masking feels inconvenient.
- Do not treat missing lineage or ownership as acceptable once a dataset becomes business-critical.

A strong data system gives downstream teams confidence that numbers mean what they think they mean, even after the platform changes underneath them.