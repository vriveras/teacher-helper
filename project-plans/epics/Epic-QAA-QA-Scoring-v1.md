# Epic — QAA (QA Agent) v1
## Goal
Produce quality scorecard and ranked issues with remediation guidance.

## Scope
- Phase 0: Grounding + MCQ validity scores
- Phase 1+: clarity and coverage
- Phase 2+: difficulty alignment, style adherence, accessibility heuristics

## Requirements
- Outputs QAReport with numeric scores (0–100) and issues ranked by severity.
- Must not “invent” issues unrelated to the artifact; link evidence via pointers.

## Acceptance Criteria
- Scorecard consistently produced and visible in UI.
- Recommendations map to UI actions (regenerate item/section, edit text, adjust blueprint).
