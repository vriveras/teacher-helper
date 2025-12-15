# Epic — SVA (Source Verification Agent) v1
## Goal
Verify that claims/items are supported by cited KB chunks.

## Scope
- Phase 0/1: citation presence + relevance checks
- Phase 2: contradiction, overreach, citation drift

## Requirements
- Returns VerificationReport with verdict and issues[] using artifact location pointers.
- Blocking classification for unsupported claims and invalid citations.
- Deterministic pre-checks where possible (e.g., missing citation rules).

## Acceptance Criteria
- Unsupported claims reliably flagged with actionable fix suggestions.
- False positives manageable and overrideable only by policy.
