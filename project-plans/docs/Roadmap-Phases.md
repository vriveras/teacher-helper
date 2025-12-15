# Roadmap and Phases
This roadmap preserves “always functional” increments. Each phase is a vertical slice that ships usable value end-to-end.

---

## Phase 0 — Hello World Vertical Slice (Ship Early)
**Goal:** end-to-end quiz from one book with citations and minimal QA gating.
- KB ingestion (single book)
- Generate quiz from selected sections
- Citations shown (chunk-level)
- PDF export
- Agent pipeline minimal: DGA + SVA (citation presence/relevance) + QAA (grounding + MCQ validity score)

**Exit criteria:**
- User can produce a printable quiz with citations and a QA report.
- Blocking issues prevent approval/export.

---

## Phase 1 — MVP: Teacher-Usable Quiz + Lesson Plan
**Goal:** teacher can reliably produce lesson plan + quiz and reuse items.
- Lesson plan (single lesson template)
- Better blueprint/coverage summary
- Editor improvements (regenerate section; inline citations)
- Item bank v1 (save/tag/search basic)
- OpenRouter routing policy v1 (task-based)
- Audit trail/versions v1

**Exit criteria:**
- Teachers can create, edit, approve, export lesson plan + quiz.
- QA scorecard consistently generated; gating enforced.

---

## Phase 2 — Exams + Stronger Verification and QA
**Goal:** exams with versions and deeper QA quality enforcement.
- Exam generation (longer, sectioned)
- Form A/B
- SVA expanded: contradiction/overreach/citation drift
- QAA expanded: coverage, clarity, difficulty alignment scoring
- More robust remediation UX (fix-by-issue)

**Exit criteria:**
- Exam outputs meet structured validity constraints and pass verification.
- QA report includes numeric scorecard across multiple dimensions.

---

## Phase 3 — Teacher Style Learning (Opt-in)
**Goal:** personalize outputs to teacher style without copying.
- Teacher doc upload + PII redaction
- Style profile + exemplar retrieval
- Style-conditioned generation + style adherence score
- Anti-copy gating
- Continuous learning from edits (opt-in) + rollback

**Exit criteria:**
- Users can enable style, see profile, and generate in consistent format.
- Anti-copy protections demonstrate reliable blocking behavior.

---

## Phase 4 — Scale, Integrations, and Governance
**Goal:** operational maturity and school/district adoption.
- OCR for scanned PDFs
- LMS export formats (CSV/QTI where feasible)
- Department templates + shared item bank governance
- Advanced item types and rubrics
- Cost controls, caching, admin analytics and dashboards

**Exit criteria:**
- Multi-tenant readiness with admin controls and predictable costs.
- Integration exports used in pilot environments.
