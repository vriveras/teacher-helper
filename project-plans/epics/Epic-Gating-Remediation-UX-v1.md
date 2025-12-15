# Epic — Gating + Remediation UX v1
## Goal
Make QA actionable and enforce quality before export.

## Scope
- Approval disabled when blocking issues exist
- Issue list with click-through to highlighted field
- “Regenerate from issue” actions (targeted regeneration)

## Requirements
- Clear separation of blockers vs warnings
- Policy-based overrides (admin/teacher) if enabled

## Acceptance Criteria
- Users can resolve blockers without restarting the artifact.
- Export cannot occur when blockers exist.
