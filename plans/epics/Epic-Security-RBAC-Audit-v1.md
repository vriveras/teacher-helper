# Epic — Security, RBAC, Audit v1
## Goal
Enable safe multi-tenant operation with clear roles and traceability.

## Scope
- Tenant isolation (data separation)
- RBAC roles: Teacher, Coach/Lead, Admin
- Audit logs for artifact edits, approvals, exports, and agent runs
- Encryption at rest/in transit

## Requirements
- Least privilege access patterns for services.
- Retention policies for logs and uploaded docs.
- PII handling and redaction workflow audited.

## Acceptance Criteria
- Role-based access is enforced in UI and APIs.
- Audit logs show who generated/edited/approved/exported and which agent runs occurred.
