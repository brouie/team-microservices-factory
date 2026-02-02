# Agent-Launched Microservices Factory - Roadmap

## 0. PM Kickoff (Now)
- Define MVP scope and success criteria.
- Align on stack and deployment targets.
- Identify risks (security, cost, token compliance).

## 1. Product Definition
- Write PRD with user flows and acceptance criteria.
- Define API contract for service access gating via token.
- Define data model and multi-tenant boundaries.

## 2. Architecture & UX
- System architecture (agents, service factory, token service, gateway).
- Frontend UX: idea submission, status, token access.
- Security model: auth, rate limits, API key issuance.

## 3. MVP Implementation
- Backend service factory + deploy pipeline.
- Token/bonding-curve contract with access gating.
- API gateway that checks token holdings.
- Frontend for submission + status + access.

## 4. Integration & Testing
- End-to-end flow: submit -> deploy -> token -> access.
- Unit/integration tests for core modules.
- Security review for token gating + deploy steps.

## 5. Launch Readiness
- Observability, costs, quotas.
- Docs, onboarding, and demo scenario.

---

## Role Assignments

### PM (Owner)
- Define MVP scope, milestones, and acceptance tests.
- Maintain PRD and architecture docs.
- Keep task board and risk log.

### Frontend
- Implement UI for idea submission + status.
- Token access dashboard and API key retrieval.
- Integrate with backend APIs.

### Backend
- Service factory + deploy orchestration.
- API gateway for token-gated access.
- User auth, project status, and storage.

### Contract
- ERC20 token + bonding curve mechanism.
- Access gating interface or on-chain proof.
- Contract tests and deployment scripts.

---

## Execution Start (Initial Tasks)

### PM
- Create `docs/PRD.md` and `docs/ARCHITECTURE.md`.
- Define API contract draft.

### Backend
- Scaffold `backend/` with config + basic service skeleton.

### Frontend
- Scaffold `frontend/` with layout and placeholder pages.

### Contract
- Scaffold `contracts/` with token interface and test setup.
