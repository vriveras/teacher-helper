# Phase 0 — Hello World Vertical Slice
**Objective:** ship an end-to-end quiz flow with citations and minimal QA gating.

## Deliverable Slice
- Upload one book → ingest → chunk → index
- Create quiz from selected sections
- Show citations (chunk-level)
- Generate QA report (minimal) and enforce gating
- Export PDF

## Minimum Agent Pipeline
- DGA: generates quiz + citation map
- SVA: verifies citation presence and rough relevance (basic checks)
- QAA: produces two scores: Grounding and MCQ Validity + top issues

## Exit Criteria
- A teacher can produce a printable quiz with citations.
- Blocking issues prevent approval/export.
- Telemetry shows model used, latency, and pass/fail.

## Key Risks
- Citation drift: citations included but not supportive.
- MCQ validity: ambiguous or multiple-correct answers.
- License excerpt limits not enforced.
