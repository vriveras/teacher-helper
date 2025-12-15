# Epic — OpenRouter AI Gateway v1
## Goal
Centralize AI calls via OpenRouter with routing policies, fallback, and telemetry.

## Scope
- Single client library/service for DGA/SVA/QAA
- Task-based model routing
- Retry/fallback logic
- Telemetry and basic cost controls

## Requirements
- Configurable per tenant: allowed models, max cost, timeouts, fallback order.
- Prompt minimization and redaction rules enforced upstream.
- Store request IDs and model selection results for audit/debug.

## Acceptance Criteria
- DGA/SVA/QAA calls are fully routed through OpenRouter.
- Failures degrade gracefully with clear user messaging and safe retries.
