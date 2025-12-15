# Epic — KB Ingestion v1
## Goal
Ingest licensed books into a structured KB for retrieval with strong policy enforcement.

## Scope
- PDF/EPUB/DOCX ingestion
- TOC/headings extraction
- Chunking (structure-aware)
- Lexical + vector indexing
- License metadata and excerpt controls

## Requirements
- Chunk metadata includes: book_id, chapter, section, page_start/end (if available), hash.
- Excerpt display limits enforced at UI/service boundary.
- Re-ingestion is idempotent; versioned by edition/upload.

## Deliverables
- Ingestion API + async job status
- Chunk store + indexes
- Admin UI or CLI for uploading and seeing ingestion status

## Acceptance Criteria
- Search returns relevant chunks for known queries.
- Citations can reference chunk IDs and page ranges.
- Excerpt limits are enforced in UI previews and exports.

## Risks
- Poor structure extraction leads to low-quality chunking and retrieval.
- Page mapping unavailable/inconsistent; must degrade gracefully.
