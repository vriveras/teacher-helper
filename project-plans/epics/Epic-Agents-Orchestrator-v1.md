# Epic — Agents Orchestrator v1
## Goal
Implement an orchestrated pipeline: DGA → SVA → QAA with gating and remediation loop.

## Scope
- Run orchestration per artifact generation and per “re-check”
- Store AgentRun, VerificationReport, QAReport
- Enforce blocking rules before approval/export

## Requirements
- Idempotent runs tied to artifact version IDs.
- Policy-driven thresholds (tenant-configurable).
- Retries and fallback for AI calls with safe degradation.

## Acceptance Criteria
- Blocking issues prevent approval/export.
- UI displays reports with location pointers and recommended actions.
