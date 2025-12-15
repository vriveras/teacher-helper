# GitHub Issues Migration Guide

This document provides a comprehensive guide and script templates for migrating all backlog items and project plans to GitHub issues.

## Summary of Items to Migrate

### 1. Project Management Files
- `.claude/in-progress/backlog.md` - 39 tasks across 7 epics (Phase 0)
- `.claude/in-progress/status.md` - Current status tracking
- `.claude/in-progress/completed.md` - 2 completed tasks

### 2. Project Plans
- `project-plans/docs/PRD.md` - Product Requirements Document
- `project-plans/docs/Roadmap-Phases.md` - 5 phases (0-4)
- `project-plans/phases/` - 5 phase detail files
- `project-plans/epics/` - 15 epic specifications

### 3. Phase Breakdown
- **Phase 0**: Hello World Slice - 39 tasks
- **Phase 1**: MVP - Lesson Plan + Item Bank
- **Phase 2**: Exams + Stronger QA
- **Phase 3**: Teacher Style Learning
- **Phase 4**: Scale + Integrations

## Recommended GitHub Issue Structure

### Labels to Create
```bash
gh label create "phase-0" --description "Phase 0: Hello World Slice" --color "0E8A16"
gh label create "phase-1" --description "Phase 1: MVP" --color "1D76DB"
gh label create "phase-2" --description "Phase 2: Exams + QA" --color "5319E7"
gh label create "phase-3" --description "Phase 3: Teacher Style" --color "B60205"
gh label create "phase-4" --description "Phase 4: Scale + Integrations" --color "D93F0B"
gh label create "epic" --description "Epic-level work" --color "0052CC"
gh label create "kb-ingestion" --description "Knowledge Base Ingestion" --color "C2E0C6"
gh label create "generation" --description "Document Generation" --color "BFD4F2"
gh label create "verification" --description "Source Verification" --color "D4C5F9"
gh label create "qa-agent" --description "QA Agent work" --color "FEF2C0"
gh label create "orchestrator" --description "Agent Orchestration" --color "FCE3D6"
gh label create "export" --description "Export functionality" --color "D1ECFF"
gh label create "security" --description "Security & RBAC" --color "E99695"
gh label create "observability" --description "Observability & Cost Controls" --color "F9D0C4"
gh label create "dev-agent" --description "Assigned to dev-agent" --color "EDEDED"
gh label create "qa-test" --description "QA testing task" --color "EDEDED"
```

### Milestones to Create
```bash
gh milestone create "Phase 0 - Hello World" --description "End-to-end quiz from one book with citations and minimal QA gating" --due-date "2026-01-15"
gh milestone create "Phase 1 - MVP" --description "Teacher-usable quiz + lesson plan with item bank" --due-date "2026-03-01"
gh milestone create "Phase 2 - Exams + QA" --description "Exams with versions and deeper QA quality enforcement" --due-date "2026-05-01"
gh milestone create "Phase 3 - Teacher Style" --description "Personalize outputs to teacher style without copying" --due-date "2026-07-01"
gh milestone create "Phase 4 - Scale" --description "Operational maturity and school/district adoption" --due-date "2026-09-01"
```

## Migration Script Template

### Epic Issues (15 total)

Create meta-issues for each epic with checkboxes linking to individual tasks:

```bash
# Epic: KB Ingestion
gh issue create --title "Epic: Knowledge Base Ingestion v1" --body "$(cat <<'EOF'
## Goal
Ingest licensed books into a structured KB for retrieval with strong policy enforcement.

## Scope
- PDF/EPUB/DOCX ingestion
- TOC/headings extraction
- Chunking (structure-aware)
- Lexical + vector indexing
- License metadata and excerpt controls

## Requirements
- Chunk metadata includes: book_id, chapter, section, page_start/end (if available), hash
- Excerpt display limits enforced at UI/service boundary
- Re-ingestion is idempotent; versioned by edition/upload

## Deliverables
- [ ] #4 Define Book and Chunk data models/schemas
- [ ] #5 Implement PDF parser for text extraction
- [ ] #6 Implement structure-aware chunking (300-800 tokens)
- [ ] #7 Create chunk store with metadata
- [ ] #8 Implement vector embeddings generation
- [ ] #9 Create lexical + vector index for search
- [ ] #10 Build ingestion API endpoint
- [ ] #11 Test KB ingestion with sample book

## Acceptance Criteria
- [ ] Search returns relevant chunks for known queries
- [ ] Citations can reference chunk IDs and page ranges
- [ ] Excerpt limits are enforced in UI previews and exports

## Risks
- Poor structure extraction leads to low-quality chunking and retrieval
- Page mapping unavailable/inconsistent; must degrade gracefully

---
**Phase**: Phase 0
**Related Epics**: DGA, Retrieval, SVA
**Source**: `project-plans/epics/Epic-KB-Ingestion-v1.md`
EOF
)" --label "epic,kb-ingestion,phase-0" --milestone "Phase 0 - Hello World"
```

### Individual Task Issues (Phase 0: 39 tasks)

```bash
# Task 1 - COMPLETED (for reference)
gh issue create --title "Task #1: Initialize Node.js/TypeScript project" --body "$(cat <<'EOF'
## Description
Initialize Node.js/TypeScript project with package.json, tsconfig.

## Acceptance Criteria
- [x] Monorepo structure with npm workspaces
- [x] packages/api (Fastify + Prisma)
- [x] packages/web (Next.js + Tailwind)
- [x] packages/shared (TypeScript types)
- [x] Docker + docker-compose (PostgreSQL, Neo4j, Redis)
- [x] ESLint + Prettier

## Dependencies
None

## Status
COMPLETED on 2025-12-15

## Notes
Initial project setup successful. Dev environment ready.
EOF
)" --label "phase-0,dev-agent" --milestone "Phase 0 - Hello World" --state "closed"

# Task 2
gh issue create --title "Task #2: Set up project structure (src/, tests/, configs)" --body "$(cat <<'EOF'
## Description
Organize project structure with proper directories for source code, tests, and configurations.

## Acceptance Criteria
- [ ] Create `src/` directories in api and web packages
- [ ] Create `tests/` directories with initial test setup
- [ ] Configure TypeScript paths and module resolution
- [ ] Set up test framework (Vitest)
- [ ] Add basic smoke tests

## Dependencies
- #1 (Task 1: Initialize Node.js/TypeScript project)

## Assigned
dev-agent

## Epic
Project Setup

---
**Source**: `.claude/in-progress/backlog.md`
EOF
)" --label "phase-0,dev-agent" --milestone "Phase 0 - Hello World"

# Task 3
gh issue create --title "Task #3: Configure OpenRouter client for AI gateway" --body "$(cat <<'EOF'
## Description
Set up OpenRouter client integration for AI model access with routing and fallback capabilities.

## Acceptance Criteria
- [ ] Install and configure OpenRouter SDK
- [ ] Create configuration for API keys and endpoints
- [ ] Implement basic client wrapper with error handling
- [ ] Add connection health check
- [ ] Document usage examples

## Dependencies
- #1 (Task 1: Initialize Node.js/TypeScript project)

## Assigned
dev-agent

## Epic
Project Setup

## Related
- Epic: OpenRouter AI Gateway Integration

---
**Source**: `.claude/in-progress/backlog.md`
EOF
)" --label "phase-0,dev-agent,orchestrator" --milestone "Phase 0 - Hello World"

# Task 4
gh issue create --title "Task #4: Define Book and Chunk data models/schemas" --body "$(cat <<'EOF'
## Description
Define TypeScript interfaces and Prisma schemas for Book and Chunk entities.

## Acceptance Criteria
- [ ] Create Prisma schema for Book model (book_id, title, edition, subject, grade_band, language, license_policy, toc)
- [ ] Create Prisma schema for Chunk model (chunk_id, book_id, chapter, section, page_start, page_end, text, embedding, hash)
- [ ] Add TypeScript types in shared package
- [ ] Generate Prisma client
- [ ] Run database migrations

## Dependencies
- #2 (Task 2: Set up project structure)

## Assigned
dev-agent

## Epic
KB Ingestion

---
**Source**: `.claude/in-progress/backlog.md`
EOF
)" --label "phase-0,dev-agent,kb-ingestion" --milestone "Phase 0 - Hello World"

# Task 5
gh issue create --title "Task #5: Implement PDF parser for text extraction" --body "$(cat <<'EOF'
## Description
Implement PDF parsing functionality to extract text content with structure preservation.

## Acceptance Criteria
- [ ] Install PDF parsing library (pdf-parse or similar)
- [ ] Extract text content from PDF files
- [ ] Preserve page boundaries and numbers
- [ ] Handle multi-column layouts gracefully
- [ ] Add error handling for corrupted PDFs
- [ ] Create unit tests with sample PDF

## Dependencies
- #4 (Task 4: Define Book and Chunk data models/schemas)

## Assigned
dev-agent

## Epic
KB Ingestion

---
**Source**: `.claude/in-progress/backlog.md`
EOF
)" --label "phase-0,dev-agent,kb-ingestion" --milestone "Phase 0 - Hello World"

# Continue for all 39 tasks...
# (Showing pattern - full script would include all tasks)
```

## Complete Task List for Phase 0

### Epic: Project Setup
- [x] #1 - Initialize Node.js/TypeScript project (DONE)
- [ ] #2 - Set up project structure (src/, tests/, configs)
- [ ] #3 - Configure OpenRouter client for AI gateway

### Epic: KB-Ingestion
- [ ] #4 - Define Book and Chunk data models/schemas
- [ ] #5 - Implement PDF parser for text extraction
- [ ] #6 - Implement structure-aware chunking (300-800 tokens)
- [ ] #7 - Create chunk store with metadata
- [ ] #8 - Implement vector embeddings generation
- [ ] #9 - Create lexical + vector index for search
- [ ] #10 - Build ingestion API endpoint
- [ ] #11 - Test KB ingestion with sample book

### Epic: DGA (Quiz Generation Agent)
- [ ] #12 - Define Quiz artifact schema
- [ ] #13 - Implement retrieval service
- [ ] #14 - Create DGA prompt templates
- [ ] #15 - Implement quiz generation with citation mapping
- [ ] #16 - Add MCQ generation with distractors and rationales
- [ ] #17 - Test quiz generation quality

### Epic: SVA (Source Verification Agent)
- [ ] #18 - Define VerificationReport schema
- [ ] #19 - Implement citation presence checks
- [ ] #20 - Implement citation relevance validation
- [ ] #21 - Create blocking issue classification
- [ ] #22 - Test SVA catches unsupported claims

### Epic: QAA (QA Scoring Agent)
- [ ] #23 - Define QAReport schema
- [ ] #24 - Implement Grounding score (0-100)
- [ ] #25 - Implement MCQ validity score
- [ ] #26 - Create issue ranking by severity
- [ ] #27 - Test QAA scoring consistency

### Epic: Agent Orchestration
- [ ] #28 - Create agent orchestrator pipeline
- [ ] #29 - Implement gating logic
- [ ] #30 - Add telemetry
- [ ] #31 - Test full agent pipeline end-to-end

### Epic: Export PDF
- [ ] #32 - Implement PDF generation from quiz artifact
- [ ] #33 - Add citations as footnotes/appendix
- [ ] #34 - Implement export blocking when QA blockers exist
- [ ] #35 - Test PDF export formatting

### Epic: Basic UI/CLI
- [ ] #36 - Create CLI for book upload
- [ ] #37 - Create CLI for quiz generation from sections
- [ ] #38 - Display QA report in CLI
- [ ] #39 - End-to-end CLI flow test

## Post-Migration Tasks

After creating all GitHub issues:

1. **Update references in code**
   - Replace backlog.md references with GitHub issue URLs
   - Update status.md to reference GitHub project board

2. **Create GitHub Project Board**
   ```bash
   gh project create --title "TeacherHelper Development" --body "Multi-phase development roadmap"
   ```

3. **Archive local planning files**
   - Move `.claude/in-progress/backlog.md` to `.claude/archive/`
   - Keep status.md as a pointer to GitHub

4. **Set up automation**
   - GitHub Actions for task dependencies
   - Auto-labeling based on file paths
   - Progress tracking in project board

## GitHub CLI Commands Reference

```bash
# List all issues
gh issue list --limit 100

# View specific issue
gh issue view 1

# Update issue
gh issue edit 1 --add-label "bug"

# Close issue
gh issue close 1

# Reopen issue
gh issue reopen 1

# Create comment
gh issue comment 1 --body "Update on progress..."

# Link issues
gh issue comment 1 --body "Blocks #2, #3"
```

## Estimated Time for Migration

- Creating labels and milestones: 10 minutes
- Creating 15 epic issues: 30 minutes
- Creating 39 task issues (Phase 0): 60 minutes
- Creating Phase 1-4 planning issues: 30 minutes
- **Total**: ~2.5 hours for complete migration

## Automation Script

You can create a full automation script using the GitHub MCP server or gh CLI. See `github-migration-script.sh` for a complete implementation.
