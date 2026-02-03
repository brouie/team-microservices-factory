# Gateway

Token-gated API proxy that enforces token ownership before forwarding requests to deployed microservices.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn main:app --reload --port 9000

# Verify
curl http://localhost:9000/health
```

## How It Works

1. Client sends request with wallet address in header
2. Gateway checks on-chain token balance via RPC
3. If balance > 0, request is proxied to the service
4. If balance = 0, request is rejected with 403

```
Client Request
      │
      ▼
┌─────────────┐
│   Gateway   │ ──── Check Token Balance ────> Blockchain
└─────────────┘                                    │
      │                                            │
      │ <──────────── Balance > 0 ─────────────────┘
      │
      ▼
┌─────────────┐
│   Service   │
└─────────────┘
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/proxy/{service_id}/{path}` | ANY | Proxy to service (requires token) |

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `BACKEND_BASE` | Backend API URL | `http://localhost:8000` |
| `RPC_URL` | Ethereum JSON-RPC endpoint | None |
| `TOKEN_ADDRESS` | ServiceToken contract address | None |
| `WALLET_HEADER` | Header containing wallet address | `X-Wallet-Address` |

## Request Headers

| Header | Description | Required |
|--------|-------------|----------|
| `X-Wallet-Address` | Ethereum wallet address (0x...) | Yes* |
| `X-Dev-Bypass` | Set to "1" to bypass token check | No |

*Required unless `X-Dev-Bypass: 1` is set.

## Usage Examples

### Health Check

```bash
curl http://localhost:9000/health
```

### Proxy Request (with token)

```bash
curl http://localhost:9000/proxy/abc123/process \
  -H "X-Wallet-Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f2bD10" \
  -H "Content-Type: application/json" \
  -d '{"input": "hello"}'
```

### Proxy Request (dev bypass)

```bash
curl http://localhost:9000/proxy/abc123/health \
  -H "X-Dev-Bypass: 1"
```

### Rejected Request (no token)

```bash
curl http://localhost:9000/proxy/abc123/health
# Returns: 403 Forbidden - Token access required
```

## Token Balance Check

The gateway calls the token contract's `balanceOf(address)` function:

```python
# Encoded function call
data = "0x70a08231" + wallet_address[2:].rjust(64, '0')

# JSON-RPC request
{
    "jsonrpc": "2.0",
    "method": "eth_call",
    "params": [{"to": TOKEN_ADDRESS, "data": data}, "latest"]
}
```

## Development

### Run with Backend

```bash
# Terminal 1: Backend
cd backend && uvicorn src.main:app --port 8000

# Terminal 2: Gateway
cd gateway && uvicorn main:app --port 9000

# Test proxy
curl -H "X-Dev-Bypass: 1" http://localhost:9000/proxy/test/health
```

### Configure RPC

```bash
export RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
export TOKEN_ADDRESS=0xYourTokenContract
uvicorn main:app --port 9000
```

## Deployment

### Render

Uses `Procfile`:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

Environment variables to set in Render dashboard:
- `BACKEND_BASE`: URL of deployed backend
- `RPC_URL`: Ethereum RPC endpoint
- `TOKEN_ADDRESS`: Deployed token contract

### Vercel

Uses `vercel.json` for serverless deployment.

### Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY main.py .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "9000"]
```

## Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| 403 | Token access required | Missing wallet or zero balance |
| 404 | Service not found | Invalid service ID |
| 400 | Service not deployed | Service has no API URL |
| 502 | Bad Gateway | Service unreachable |

## Security Notes

- `X-Dev-Bypass` should be disabled in production
- Validate wallet addresses (0x + 40 hex chars)
- Use HTTPS for RPC endpoints
- Rate limiting recommended for production
