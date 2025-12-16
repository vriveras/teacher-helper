# Backlog

## Phase 0 - Hello World Vertical Slice
**Goal:** End-to-end quiz from one book with citations and minimal QA gating.

### Epic: Project Setup
| # | Task | Agent | Dependencies | Status |
|---|------|-------|--------------|--------|
| 1 | Initialize Node.js/TypeScript project with package.json, tsconfig | dev-agent | none | **DONE** |
| 2 | Set up project structure (src/, tests/, configs) | dev-agent | 1 | **DONE** |
| 3 | Configure OpenRouter client for AI gateway | dev-agent | 1 | **DONE** |

### Epic: KB-Ingestion (Book Upload → Chunk → Index)
| # | Task | Agent | Dependencies | Status |
|---|------|-------|--------------|--------|
| 4 | Define Book and Chunk data models/schemas | dev-agent | 2 | **DONE** |
| 5 | Implement PDF parser for text extraction | dev-agent | 4 | **DONE** |
| 6 | Implement structure-aware chunking (300-800 tokens) | dev-agent | 5 | pending |
| 7 | Create chunk store with metadata (book_id, chapter, section, page) | dev-agent | 6 | pending |
| 8 | Implement vector embeddings generation | dev-agent | 3, 7 | pending |
| 9 | Create lexical + vector index for search | dev-agent | 8 | pending |
| 10 | Build ingestion API endpoint | dev-agent | 9 | pending |
| 11 | Test KB ingestion with sample book | qa-agent | 10 | pending |

### Epic: DGA (Quiz Generation Agent)
| # | Task | Agent | Dependencies | Status |
|---|------|-------|--------------|--------|
| 12 | Define Quiz artifact schema (items, citations, blueprint) | dev-agent | 4 | pending |
| 13 | Implement retrieval service (search chunks by topic/section) | dev-agent | 9 | pending |
| 14 | Create DGA prompt templates for quiz generation | dev-agent | 3 | pending |
| 15 | Implement quiz generation with citation mapping | dev-agent | 12, 13, 14 | pending |
| 16 | Add MCQ generation with distractors and rationales | dev-agent | 15 | pending |
| 17 | Test quiz generation quality | qa-agent | 16 | pending |

### Epic: SVA (Source Verification Agent)
| # | Task | Agent | Dependencies | Status |
|---|------|-------|--------------|--------|
| 18 | Define VerificationReport schema | dev-agent | 12 | pending |
| 19 | Implement citation presence checks | dev-agent | 18 | pending |
| 20 | Implement citation relevance validation | dev-agent | 19 | pending |
| 21 | Create blocking issue classification | dev-agent | 20 | pending |
| 22 | Test SVA catches unsupported claims | qa-agent | 21 | pending |

### Epic: QAA (QA Scoring Agent)
| # | Task | Agent | Dependencies | Status |
|---|------|-------|--------------|--------|
| 23 | Define QAReport schema (scores, issues, recommendations) | dev-agent | 18 | pending |
| 24 | Implement Grounding score (0-100) | dev-agent | 23 | pending |
| 25 | Implement MCQ validity score | dev-agent | 24 | pending |
| 26 | Create issue ranking by severity | dev-agent | 25 | pending |
| 27 | Test QAA scoring consistency | qa-agent | 26 | pending |

### Epic: Agent Orchestration
| # | Task | Agent | Dependencies | Status |
|---|------|-------|--------------|--------|
| 28 | Create agent orchestrator to run DGA → SVA → QAA pipeline | dev-agent | 21, 26 | pending |
| 29 | Implement gating logic (block export on blocking issues) | dev-agent | 28 | pending |
| 30 | Add telemetry (model used, latency, pass/fail) | dev-agent | 29 | pending |
| 31 | Test full agent pipeline end-to-end | qa-agent | 30 | pending |

### Epic: Export PDF
| # | Task | Agent | Dependencies | Status |
|---|------|-------|--------------|--------|
| 32 | Implement PDF generation from quiz artifact | dev-agent | 12 | pending |
| 33 | Add citations as footnotes/appendix | dev-agent | 32 | pending |
| 34 | Implement export blocking when QA blockers exist | dev-agent | 29, 33 | pending |
| 35 | Test PDF export formatting | qa-agent | 34 | pending |

### Epic: Basic UI/CLI
| # | Task | Agent | Dependencies | Status |
|---|------|-------|--------------|--------|
| 36 | Create CLI for book upload | dev-agent | 10 | pending |
| 37 | Create CLI for quiz generation from sections | dev-agent | 28 | pending |
| 38 | Display QA report in CLI | dev-agent | 30 | pending |
| 39 | End-to-end CLI flow test | qa-agent | 38 | pending |

---

## Summary
- **Total Tasks:** 39
- **dev-agent:** 31 tasks
- **qa-agent:** 8 tasks
- **Critical Path:** 1 → 2 → 4 → 5 → 6 → 7 → 8 → 9 → 13 → 15 → 21 → 28 → 29 → 34

## Upcoming Phases
- Phase 1: MVP - Lesson Plan + Item Bank
- Phase 2: Exams + Stronger QA
- Phase 3: Teacher Style Learning
- Phase 4: Scale + Integrations
