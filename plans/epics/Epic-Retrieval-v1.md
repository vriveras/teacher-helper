# Epic — Retrieval v1 (Hybrid)
## Goal
Retrieve the best KB chunks for a given objective/section query reliably.

## Scope
- Hybrid retrieval: lexical + vector
- Scope controls: selected books/chapters/sections only
- Top-k chunk selection and de-duplication
- Retrieval bundle output for agents

## Requirements
- Deterministic retrieval bundle schema.
- Configurable k and diversity (avoid near-duplicates).
- Return metadata needed for citations and excerpt policy.

## Acceptance Criteria
- For selected sections, retrieval includes the correct supporting chunks.
- Retrieval results are stable under repeated calls with same inputs (within model/index updates policy).
