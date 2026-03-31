# Lineage and Access

Data governance is operational discipline, not paperwork. Teams need to know where data came from, who owns it, and who should see it.

## Ownership

Every important dataset should have:
- a technical owner for pipeline health
- a business owner for semantic correctness
- a defined escalation path when data is late or wrong

## Lineage

Lineage should make it possible to trace:
- source systems feeding the dataset
- transformations that materially change semantics
- downstream dashboards, models, or exports that depend on it
- validation points where correctness is checked

## Access Control

- grant the minimum access needed for the task
- separate raw sensitive zones from curated consumer-friendly zones
- mask, hash, or tokenize sensitive fields where full values are unnecessary
- review broad analyst or service access on a regular schedule

## Retention and Deletion

- define how long raw, curated, and exported data should live
- ensure deletion or suppression requests propagate through derived datasets when required
- avoid archived copies that silently bypass retention policy

## Red Flags

- no owner for a business-critical table
- dashboards built on tables whose lineage no one can explain
- unrestricted access to direct identifiers in general-purpose analytics spaces
- policy docs that exist, but no operational checks enforce them
