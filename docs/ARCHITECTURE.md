# Architecture

## Overview

The Microservices Factory is a platform that transforms ideas into deployed microservices with token-gated API access.

## System Diagram

```
                                    ┌──────────────────┐
                                    │    Frontend      │
                                    │    (Next.js)     │
                                    │    Vercel        │
                                    └────────┬─────────┘
                                             │
                         ┌───────────────────┼───────────────────┐
                         │                   │                   │
                         ▼                   ▼                   ▼
              ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
              │  Submit Idea     │ │  View Services   │ │  Access API      │
              │  /ideas POST     │ │  /services GET   │ │  Gateway Proxy   │
              └────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘
                       │                    │                    │
                       └───────────┬────────┴────────────────────┘
                                   │
                                   ▼
                         ┌──────────────────┐
                         │     Backend      │
                         │    (FastAPI)     │
                         │    Render        │
                         └────────┬─────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
    ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
    │   Generator      │ │    Deployer      │ │    Store         │
    │   (LLM)          │ │   (Vercel API)   │ │   (JSON/DB)      │
    └──────────────────┘ └────────┬─────────┘ └──────────────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Generated Svc    │
                         │ (Vercel/Cloud)   │
                         └────────┬─────────┘
                                  │
                                  │
                         ┌────────┴─────────┐
                         │     Gateway      │
                         │  (Token Gate)    │
                         │    Render        │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   ServiceToken   │
                         │   (Ethereum)     │
                         │   Sepolia        │
                         └──────────────────┘
```

## Components

### Frontend (Next.js)
- **Location**: `frontend/`
- **Deployment**: Vercel
- **Purpose**: User interface for idea submission and service management
- **Features**:
  - Wallet connection (address input)
  - Idea submission form
  - Services dashboard
  - Platform statistics
  - API status indicator

### Backend (FastAPI)
- **Location**: `backend/`
- **Deployment**: Render
- **Purpose**: Orchestration and API for service lifecycle
- **Features**:
  - Service registry (CRUD)
  - Event logging
  - Code generation trigger
  - Deployment orchestration
  - Token creation
  - Statistics aggregation

### Gateway (FastAPI)
- **Location**: `gateway/`
- **Deployment**: Render
- **Purpose**: Token-gated reverse proxy
- **Features**:
  - On-chain balance check
  - Request proxying
  - Access control

### Contracts (Solidity)
- **Location**: `contracts/`
- **Deployment**: Ethereum (Sepolia testnet)
- **Purpose**: Token economics and access control
- **Contracts**:
  - `ServiceToken`: ERC20 with bonding curve
  - `ServiceTokenFactory`: Deploys tokens per service
  - `IAccessToken`: Interface for gateway

## Data Flow

### 1. Idea Submission
```
User -> Frontend -> POST /ideas -> Backend -> Store
                                      |
                                      v
                                  ServiceRecord (queued)
```

### 2. Service Generation
```
User -> Frontend -> POST /generate -> Backend -> Generator
                                         |
                                         v
                                     Generated Code
```

### 3. Deployment
```
User -> Frontend -> POST /deploy -> Backend -> Deployer -> Vercel
                                       |
                                       v
                                   ServiceRecord (deployed)
                                   api_base_url set
```

### 4. Token Creation
```
User -> Frontend -> POST /token -> Backend -> Blockchain
                                      |
                                      v
                                  ServiceRecord
                                  token_address set
```

### 5. API Access
```
User -> Gateway -> Check Balance -> Blockchain
            |           |
            |     balance > 0
            |           |
            v           v
        Proxy -----> Service
```

## Data Models

### ServiceRecord
```
{
  id: string (UUID)
  idea: string
  requester_id: string | null
  metadata: object | null
  status: enum (queued|generating|generated|deploying|deployed|failed)
  token_address: string | null
  api_base_url: string | null
  created_at: datetime
  updated_at: datetime
}
```

### ServiceEvent
```
{
  service_id: string
  status: enum
  message: string | null
  created_at: datetime
}
```

## Status Lifecycle

```
                    ┌─────────────────────────────────┐
                    │                                 │
                    ▼                                 │
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ queued  │───>│generating│───>│generated │───>│deploying │
└─────────┘    └──────────┘    └──────────┘    └────┬─────┘
                    │                               │
                    │                               ▼
                    │                          ┌──────────┐
                    └────────────────────────>│ deployed │
                                              └──────────┘
                    │
                    ▼
               ┌──────────┐
               │  failed  │
               └──────────┘
```

## Token Economics

### Bonding Curve
```
Price = BASE_PRICE + (Supply × PRICE_SLOPE)

Parameters:
- BASE_PRICE: 0.001 ETH
- PRICE_SLOPE: 0.0001 ETH per token
- MAX_SUPPLY: 1,000,000 tokens
```

### Buy Flow
```
1. User sends ETH to contract
2. Contract calculates tokens for ETH amount
3. Tokens minted to user
4. User gains API access (balance > 0)
```

### Sell Flow
```
1. User calls sell(amount, minPayout)
2. Contract calculates ETH payout
3. Tokens burned
4. ETH sent to user
```

## Security

### Authentication
- Wallet address in request header
- Token balance verification on-chain
- API keys for service-level tracking

### Gateway Checks
```python
1. Extract X-Wallet-Address header
2. Validate address format (0x + 40 hex)
3. Call balanceOf(address) on token contract
4. If balance > 0: proxy request
5. If balance = 0: return 403
```

### Dev Bypass
- Header `X-Dev-Bypass: 1` skips token check
- Should be disabled in production

## Tech Stack

| Layer | Technology | Hosting |
|-------|------------|---------|
| Frontend | Next.js 14, React 18, TypeScript | Vercel |
| Backend | FastAPI, Python 3.11, Pydantic | Render |
| Gateway | FastAPI, httpx | Render |
| Contracts | Solidity 0.8.20, Foundry | Ethereum |
| Storage | JSON files (MVP), Postgres (future) | Local/Cloud |

## Future Extensions

- [ ] Async job queue (Celery/Redis) for pipelines
- [ ] Postgres persistence with migrations
- [ ] Multi-chain support (Base, Arbitrum)
- [ ] Real wallet connection (WalletConnect)
- [ ] Service templates and customization
- [ ] Usage analytics dashboard
- [ ] Rate limiting per service
- [ ] Cost tracking and billing
