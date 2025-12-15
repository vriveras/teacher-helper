# Epic — Teacher Docs + Style Profile v1 (Opt-in)
## Goal
Learn teacher formatting/tone/question-mix preferences from uploaded documents.

## Scope
- Upload teacher docs (PDF/DOCX)
- Classification + structure extraction
- PII redaction before indexing
- Style profile creation and versioning
- Exemplar retrieval for style conditioning (non-authoritative)

## Requirements
- Teacher controls: enable/disable; exclude docs; edit profile; rollback.
- Style applied via constraints and templates, not verbatim copying.

## Acceptance Criteria
- Style-conditioned outputs match teacher’s typical structure (sections, points, directions).
- Users can see and edit a readable style profile.
