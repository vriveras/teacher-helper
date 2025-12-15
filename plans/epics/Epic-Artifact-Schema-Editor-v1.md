# Epic — Artifact Schema + Editor v1
## Goal
Create structured artifacts that support editing, citations, and issue linking.

## Scope
- JSON schemas for LessonPlan and Assessment
- Artifact location pointers for report linking
- Editor UI for inline edits and section regeneration
- Citation inspector UI

## Requirements
- Stable IDs: section_id, item_id for pointer references.
- Support multiple versions and audit trail entries.
- Inline citations attach to specific fields (objective, stem, rationale, etc.)

## Acceptance Criteria
- Agent reports can highlight exact fields in the editor.
- Version diff available (basic) and audit trail visible.
