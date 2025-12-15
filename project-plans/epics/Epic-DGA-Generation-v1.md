# Epic — DGA (Document Generation Agent) v1
## Goal
Generate structured artifacts (quiz first) with citations and blueprint.

## Scope
- Quiz generation MVP
- Lesson plan generation in Phase 1
- Structured outputs only (strict schema)

## Requirements
- Must only use retrieved KB chunks for factual content.
- Any non-KB content explicitly labeled teacher-supplied.
- Must output citation_map aligned to artifact pointers.

## Acceptance Criteria
- Generated artifact parses against schema every time.
- Citation_map coverage meets minimum policy threshold.
