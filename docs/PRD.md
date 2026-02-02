# Agent-Launched Microservices Factory - PRD (MVP)

## Problem
Users want to turn a software idea into a deployed microservice quickly, with a funding/usage model that aligns access to token ownership.

## Goals
- Users can submit an idea and receive a deployed microservice.
- System mints a bonding-curve token per service.
- Token holders can access the service API.

## Non-Goals (MVP)
- Complex DAO governance.
- Multi-chain deployments.
- Paid fiat checkout.

## Primary Users
- Builders experimenting with microservices.
- Early adopters seeking token-gated access.

## User Journey
1. User submits an idea.
2. System generates and deploys service.
3. Token is created for that service.
4. User acquires tokens and gains API access.

## MVP Features
- Idea submission form.
- Service status tracking.
- Token creation & bonding curve.
- Token-gated API access.
- Basic admin observability.

## Success Criteria
- End-to-end flow works in a demo environment.
- Token-gated API responds only to eligible users.

## Risks
- Security of deploy pipeline.
- Token compliance and legal constraints.
- Cost of running generated services.
