# Architecture (MVP)

## Components
- Frontend: idea submission, status, token access UI.
- Backend API: orchestration, status, user auth.
- Service Factory: generates service skeletons and deploys.
- Token Service: deploys bonding-curve token per service.
- API Gateway: checks token ownership before proxying.

## Data Flow
1. Frontend submits idea -> Backend API.
2. Backend triggers Service Factory -> Deploy.
3. Backend triggers Token Service -> Token deployed.
4. Backend updates status -> Frontend.
5. API Gateway validates token ownership -> Service API.

## Security
- Auth tokens for users.
- Token-gated access enforced at gateway.
- Rate limits per service + user.

## Tech Stack (Proposed)
- Frontend: Next.js.
- Backend: FastAPI (Python).
- Contracts: Solidity + Foundry.
- Gateway: lightweight reverse proxy with token checks.
