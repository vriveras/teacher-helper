# TeacherHelper PRD
**Product:** TeacherHelper — Lesson Plans, Exams, and Quizzes grounded in a Book Knowledge Base (KB), personalized to teacher style, with multi-agent verification + QA  
**Version:** v1.1  
**Owner:** (TBD)  
**Last Updated:** (TBD)

---

## 1. Executive Summary
TeacherHelper is an authoring, review, and export system that helps educators create lesson plans and assessments (quizzes/exams) using an approved, licensed library of books. The system uses retrieval-assisted generation to produce artifacts that are:
- **Grounded** in the books (KB),
- **Traceable** with **citations** to book sections/pages/chunks,
- **Editable and reusable** (templates + item bank),
- **Personalized** to each teacher’s style (opt-in, based on existing teacher documents),
- **Verified and scored** by an agent pipeline (generation, source verification, QA scoring/report).

The product uses AI APIs via **OpenRouter** as a model gateway, enabling provider/model routing with fallback and cost controls.

---

## 2. Target Users
### Primary
- **K–12 Teachers:** weekly planning; frequent quizzes; differentiation; standards alignment; low time budget.
- **Higher-Ed Instructors:** rigorous exams; multiple versions; rubrics; textbook alignment.

### Secondary
- **Instructional Coaches / Leads:** consistency, shared templates, quality governance.
- **Admins / Curriculum Teams:** manage book library, policies, RBAC, compliance.

---

## 3. Problem Statement
Teachers spend significant time converting book content into plans and assessments. Existing tools often fail due to hallucinations, lack of provenance, weak question quality, poor formatting fit, and absent QA/governance.

---

## 4. Goals, Non-Goals, Principles
### 4.1 Goals
1. Generate lesson plans and assessments grounded in licensed Book KB.
2. Provide citations for objectives, key concepts, and assessment stems/rationales.
3. Support teacher editing, versioning, reuse (templates + item bank).
4. Learn/apply teacher style from existing documents (opt-in) without verbatim copying.
5. Enforce quality through an agent pipeline:
   - **DGA** (Document Generation Agent)
   - **SVA** (Source Verification Agent)
   - **QAA** (QA Agent with scoring + report)

### 4.2 Non-Goals (initial)
- Student-facing tutoring across the full corpus.
- Fully automated grading for all response types.
- Arbitrary web ingestion beyond governed/licensed sources.

### 4.3 Principles
- Teacher in control (draft → review → approve).
- Grounded by default; non-KB content labeled “teacher-supplied.”
- Provenance is first-class; auditability end-to-end.
- Personalize without copying; anti-copy enforcement.
- Defense-in-depth QA using specialized agents.

---

## 5. Scope
### 5.1 Outputs (Artifacts)
- Lesson plans (single lesson / weekly / unit)
- Quizzes and exams (including Form A/B)
- Answer keys, rationales, rubrics
- Blueprints/coverage maps
- QA scorecard + issues report

### 5.2 Inputs
- Licensed books (PDF/EPUB/DOCX)
- Teacher docs (PDF/DOCX) for style learning (opt-in)
- Optional: teacher-defined objectives/standards

---

## 6. Key Concepts
- **Book KB:** chunked and indexed licensed books + metadata + license policies.
- **Chunk:** structured segment (book/chapter/section/page range) with embeddings.
- **Citation:** reference to chunk(s) supporting a claim/item/rationale.
- **Item Bank:** repository of approved assessment items with tags and citations.
- **Teacher Style Profile:** learned formatting/tone/question-mix preferences.
- **Agent Pipeline:** orchestrated agents that generate, verify, and QA.

---

## 7. User Journeys
### 7.1 Create Lesson Plan
1. Teacher selects class/topic/timeframe + books/sections + style mode.
2. System drafts plan with citations.
3. Teacher edits/regenerates sections.
4. SVA/QAA run; report shown; blocking issues must be fixed.
5. Approve and export (DOCX/PDF).

### 7.2 Create Quiz/Exam
1. Teacher selects scope + constraints (duration, types, difficulty) + style mode.
2. System generates blueprint + items + keys/rationales + citations.
3. Teacher edits, uses item bank.
4. SVA/QAA run; report; fix/regenerate loop.
5. Approve and export.

### 7.3 Import Teacher Docs (Style Learning)
1. Upload and label document types.
2. PII redaction + structure extraction + style profile update (opt-in).
3. Teacher reviews style summary and toggles.

---

## 8. Functional Requirements
### 8.1 Book KB Ingestion
- **FR-KB-1:** Upload book formats: PDF/EPUB/DOCX (MVP).
- **FR-KB-2:** Extract structure (TOC/headings), page mapping when available.
- **FR-KB-3:** Chunk with structure-aware segmentation (e.g., 300–800 tokens).
- **FR-KB-4:** Store metadata + license policy per book.
- **FR-KB-5:** Index lexical + vector.
- **FR-KB-6:** Enforce excerpt limits, watermark/export policies, usage logging.

### 8.2 Lesson Plan Generation
- **FR-LP-1:** Lesson/unit templates (MVP: lesson plan).
- **FR-LP-2:** Objectives and factual claims must have citations or be labeled teacher-supplied.
- **FR-LP-3:** Differentiation: ELL/SPED + extensions.
- **FR-LP-4:** Formative checks grounded in KB.
- **FR-LP-5:** Coverage view by chapter/section/objective.

### 8.3 Assessment Generation
- **FR-AS-1:** Types (MVP): MCQ, T/F optional, short answer, matching, fill-in.
- **FR-AS-2:** Blueprint/coverage map aligned to scope and teacher weights.
- **FR-AS-3:** MCQ validity: single correct; plausible distractors; rationale + citations.
- **FR-AS-4:** Answer keys; rubrics for constructed response grounded in KB.
- **FR-AS-5:** Form A/B and shuffling.

### 8.4 Editing, Review, Provenance
- **FR-ED-1:** Inline editor + regenerate sections with constraints.
- **FR-ED-2:** Citation inspector with excerpt limits.
- **FR-ED-3:** Workflow: draft → reviewed → approved + audit trail.

### 8.5 Item Bank
- **FR-IB-1:** Save/tag/approve items with objective/section/type/difficulty/Bloom + citations.
- **FR-IB-2:** Search/filter; near-duplicate detection (phase).
- **FR-IB-3:** Usage metadata + ratings.

### 8.6 Teacher Style Learning (Opt-in)
- **FR-TS-1:** Teacher doc upload + private storage (tenant isolated).
- **FR-TS-2:** Classification + structure extraction.
- **FR-TS-3:** PII detection/redaction before indexing.
- **FR-TS-4:** Exemplar index used for style conditioning only.
- **FR-TS-5:** Anti-copy checks block export above threshold.
- **FR-TS-6:** Style Profile (versioned): tone, formatting, question mix, scoring, rubric style.
- **FR-TS-7:** Teacher controls: enable/disable; exclude docs; edit; rollback.

### 8.7 Export
- **FR-EX-1:** Export PDF (MVP) and DOCX (next).
- **FR-EX-2:** LMS export (Phase 4): CSV/QTI where feasible.

---

## 9. Agent-Based Quality System
### 9.1 Agents
1. **DGA (Document Generation Agent):** produces structured draft + citations + blueprint.
2. **SVA (Source Verification Agent):** validates grounding vs cited KB chunks; detects drift/overreach/contradictions.
3. **QAA (QA Agent):** scores and generates report: grounding, clarity, coverage, difficulty alignment, MCQ validity, style adherence, accessibility.

### 9.2 Gating Rules
**Blocking (must fix):**
- unsupported claims/items (SVA fail)
- missing citations above threshold
- MCQ invalid (multiple/no correct)
- license excerpt violations
- anti-copy threshold breach

**Warnings (overrideable by policy):**
- mild clarity issues
- minor difficulty drift
- minor style deviations

### 9.3 Reports
- **VerificationReport:** verdict + issues list with artifact pointers.
- **QAReport:** numeric scorecard + ranked issues + recommendations.

---

## 10. AI Layer via OpenRouter
- Single integration point for LLM calls (DGA/SVA/QAA).
- Task-based routing policies + fallbacks.
- Observability: model used, latency, tokens/cost estimates if available, error rates.
- Prompt data minimization and redaction (PII + excerpt limits).

---

## 11. Architecture (High-Level)
**Core services:**
- Book Ingestion → KB stores (object + metadata + lexical + vector)
- Teacher Document Service → PII redaction + style profile + exemplar indexes
- Agent Orchestrator → runs DGA → SVA → QAA and enforces gating
- Artifact Service → drafts, versions, approvals, exports, item bank
- Web App → authoring UI, citation inspector, QA report viewer
- AI Gateway Client → OpenRouter integration + routing policies

---

## 12. Data Model (Representative)
### 12.1 KB
- `Book { book_id, title, edition, subject, grade_band, language, license_policy, toc[] }`
- `Chunk { chunk_id, book_id, chapter, section, page_start, page_end, text, embedding, hash }`

### 12.2 Artifacts
- `LessonPlan { plan_id, project_id, title, sections[], citations[], status, version }`
- `Assessment { assessment_id, project_id, type, blueprint, items[], citations[], status, version }`
- `Item { item_id, stem, choices[], correct_answer, rationale, rubric?, citations[], tags, difficulty, bloom_level }`

### 12.3 Style
- `TeacherDocument { doc_id, teacher_id, type, course_tags[], redacted_text, structure_json }`
- `StyleProfile { teacher_id, version, tone_params, format_params, question_mix, rubric_params }`

### 12.4 Agent Runs
- `VerificationReport { artifact_id, run_id, verdict, issues[] }`
- `QAReport { artifact_id, run_id, scores{}, issues[], recommendations[] }`
- `AgentRun { run_id, artifact_id, models_used[], timings, telemetry }`

---

## 13. Non-Functional Requirements
- Security: RBAC, tenant isolation, encryption at rest/in transit.
- Privacy: PII redaction before indexing; prompt minimization.
- Reliability: autosave drafts; idempotent generation; safe retries.
- Compliance: license enforcement, excerpt caps, audit logs, retention policies.
- Accessibility: WCAG-aware UI and export templates.
- Cost controls: routing/caching/limits with OpenRouter telemetry.

---

## 14. MVP Definition (Functional and Shippable)
**MVP includes:**
- Book KB ingestion (PDF/EPUB/DOCX), chunking, indexing
- Quiz generation with citations, editor, PDF export
- Lesson plan (single template) generation with citations
- Agent pipeline: DGA + SVA (basic) + QAA (basic) with gating
- OpenRouter integration with task routing and fallback
- Minimal artifact versioning + audit trail

---

## 15. Open Questions
- Thresholds for blocking vs overrideable QA findings (by tenant policy).
- Similarity metric and thresholds for anti-copy (teacher docs).
- Standards alignment: integrate external standards now or phase later?
- LMS export scope and supported systems.
