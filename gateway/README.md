# Gateway

Lightweight proxy that enforces token-gated access before forwarding requests
to a service API.

## Run (local)
1. Install deps: `pip install -r requirements.txt`
2. Start: `uvicorn main:app --reload --port 9000`

## Config
- `BACKEND_BASE` (default `http://localhost:8000`)
- `RPC_URL` (Base RPC endpoint)
- `TOKEN_ADDRESS` (service token address)
- `WALLET_HEADER` (default `X-Wallet-Address`)

## Access Checks (MVP)
- Allow if `balanceOf(wallet)` > 0 via `RPC_URL` + `TOKEN_ADDRESS`.
- Allow if `X-Dev-Bypass: 1` for local testing.
