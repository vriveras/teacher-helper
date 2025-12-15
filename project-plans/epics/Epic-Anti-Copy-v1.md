# Epic — Anti-Copy v1
## Goal
Prevent verbatim reproduction of teacher-uploaded documents in generated outputs.

## Scope
- Similarity detection against teacher docs (redacted text)
- Blocking gate on export/approval when exceeding threshold
- Explainable reports to user (where possible)

## Requirements
- Define similarity metric and thresholds (tenant-configurable).
- Provide remediation: regenerate with stronger paraphrase constraints, reduce exemplar use.

## Acceptance Criteria
- System blocks high-overlap outputs reliably.
- Low false-blocking rate in normal operation; override policy optional.
