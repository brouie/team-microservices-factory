# Deployment Guide

## Quick Deploy with Render

1. Fork this repository
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" > "Blueprint"
4. Connect your GitHub and select the forked repository
5. Render will auto-detect the `render.yaml` and deploy both services

The `render.yaml` configures:
- **msf-backend**: FastAPI backend on port $PORT
- **msf-gateway**: Token-gated API gateway

## Manual Deployment

### Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

Environment variables:
- `SERVICE_STORE_PATH`: Path to persist service data (e.g., `/tmp/store.json`)
- `SERVICE_EVENTS_PATH`: Path to persist events (e.g., `/tmp/events.json`)
- `VERCEL_TOKEN`: (Optional) For deploying generated services to Vercel

### Gateway (Token-Gated Proxy)

```bash
cd gateway
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 9000
```

Environment variables:
- `BACKEND_BASE`: URL of the backend API (e.g., `https://msf-backend.onrender.com`)
- `RPC_URL`: Ethereum RPC endpoint (e.g., Alchemy, Infura)
- `TOKEN_ADDRESS`: ServiceToken contract address for access gating
- `WALLET_HEADER`: Header name for wallet address (default: `X-Wallet-Address`)

### Frontend (Next.js)

Already deployed on Vercel at: https://team-microservices-factory-gamma.vercel.app

Configure environment variables in Vercel dashboard:
- `NEXT_PUBLIC_API_BASE`: Backend URL
- `NEXT_PUBLIC_GATEWAY_BASE`: Gateway URL

### Contracts (Foundry)

Prerequisites:
- Install [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Get testnet ETH from faucet

Deploy to Sepolia:

```bash
cd contracts

# Set environment variables
export PRIVATE_KEY=your_private_key
export SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
export ETHERSCAN_API_KEY=your_etherscan_key

# Install dependencies
forge install

# Deploy Factory
forge script script/DeployFactory.s.sol --rpc-url sepolia --broadcast --verify

# Create a token for a service
export FACTORY_ADDRESS=deployed_factory_address
export SERVICE_ID=my-service
export TOKEN_NAME="My Service Token"
export TOKEN_SYMBOL="MST"
export SERVICE_OWNER=your_wallet_address

forge script script/CreateServiceToken.s.sol --rpc-url sepolia --broadcast
```

## Architecture

```
                    +-------------------+
                    |    Frontend       |
                    |  (Vercel/Next.js) |
                    +---------+---------+
                              |
              +---------------+---------------+
              |                               |
    +---------v---------+         +-----------v-----------+
    |     Backend       |         |       Gateway         |
    |   (FastAPI)       |         |  (Token-Gated Proxy)  |
    |  - Idea submission|         |  - Checks token balance|
    |  - Service CRUD   |<--------+  - Proxies to services |
    |  - Deployment     |         |                       |
    +-------------------+         +-----------+-----------+
                                              |
                                  +-----------v-----------+
                                  |   Generated Services  |
                                  |   (Vercel Serverless) |
                                  +-----------------------+
```

## Post-Deployment Checklist

1. [ ] Backend deployed and accessible
2. [ ] Gateway deployed with correct BACKEND_BASE
3. [ ] Contracts deployed to testnet
4. [ ] Frontend env vars updated with production URLs
5. [ ] Gateway configured with RPC_URL and TOKEN_ADDRESS
6. [ ] Test end-to-end flow: Submit idea -> Deploy -> Create Token -> Access API
