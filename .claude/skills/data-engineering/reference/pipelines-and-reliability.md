# Pipelines and Reliability

Reliable data pipelines are designed for replay, drift, and late truth.

## Ingestion Design

- Know whether the source is append-only, mutable, snapshot-based, or event-driven.
- Use ingestion metadata such as load time, source version, and batch id when it helps reconciliation.
- Preserve raw source payloads long enough to debug parsing and reprocessing issues.

## Idempotency and Replay

- Make batch and streaming jobs safe to rerun.
- Use deterministic merge or dedupe rules.
- Separate checkpointing from business correctness checks.
- Plan how partial writes are detected and repaired.

## Freshness and Completeness

Track:
- when data was expected
- when it actually arrived
- whether the record count or distribution deviates materially
- whether critical dimensions or partitions are missing

Freshness alone is not enough if the pipeline delivers incomplete data quickly.

## Backfills

Before running a backfill, define:
- time range and business reason
- downstream tables and dashboards affected
- whether normal incremental jobs continue in parallel
- validation and rollback or re-run steps

## Failure Questions

- what happens if the source replays old records
- what happens if schema drift adds a new required field
- what happens if a backfill overlaps yesterday's incremental job
- how will consumers know the data is stale, partial, or under repair
