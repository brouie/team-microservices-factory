# Architecture (MVP)

## Goals
- Turn an idea into a deployed microservice with minimal user input.
- Create a bonding-curve token per service.
- Gate service API access based on token holdings.

## Components
- Frontend: idea submission, status, token access UI.
- Backend API: orchestration, status, user auth.
- Service Factory: generates service skeletons and deploys.
- Token Service: deploys bonding-curve token per service.
- API Gateway: checks token ownership before proxying.

## Core Data Model
- Service: idea, status, token_address, api_base_url, timestamps.
- Access: api_key scoped to service + user.
- Deployment: pipeline metadata and logs (later).

## Data Flow
1. Frontend submits idea -> Backend API.
2. Backend triggers Service Factory -> Deploy.
3. Backend triggers Token Service -> Token deployed.
4. Backend updates status -> Frontend.
5. API Gateway validates token ownership -> Service API.

## Status Lifecycle
- `queued` -> `deploying` -> `deployed`
- `failed` on any pipeline error (with retry later)

## Security
- Auth tokens for users.
- Token-gated access enforced at gateway.
- Rate limits per service + user.
- API keys are scoped to a service and rotated as needed.

## Token Gating Approach
- Gateway checks the user's wallet token balance via `balanceOf`.
- If balance > 0, requests are proxied to the service API.
- API key is used for service-level quota tracking and revocation.

## Tech Stack (Proposed)
- Frontend: Next.js.
- Backend: FastAPI (Python).
- Contracts: Solidity + Foundry.
- Gateway: lightweight reverse proxy with token checks.

## Future Extensions
- Async job queue for deploy/token pipelines.
- Audit logs + observability dashboards.
- Multi-tenant service isolation and cost limits.
