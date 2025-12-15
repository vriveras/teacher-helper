# Phase 1 — MVP: Teacher-Usable Quiz + Lesson Plan
**Objective:** deliver reliable lesson plan + quiz creation with reuse and stronger UX.

## Adds
- Lesson plan (single lesson template) with citations
- Blueprint/coverage summary improvements
- Editor: regenerate section, inline citations, issue-linked fixes
- Item Bank v1: save items + basic tags + search
- OpenRouter routing policy v1 (task-based)
- Versioning + audit trail v1

## Exit Criteria
- Teacher can create/edit/approve/export lesson plan + quiz.
- QA scorecard consistently generated; gating enforced.

## Operational Requirements
- Autosave, idempotent generation jobs, safe retries
- Basic RBAC: teacher vs admin
