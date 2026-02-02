# Gateway

Lightweight proxy that enforces token-gated access before forwarding requests
to a service API.

## Run (local)
1. Install deps: `pip install -r requirements.txt`
2. Start: `uvicorn main:app --reload --port 9000`

## Config
- `BACKEND_BASE` (default `http://localhost:8000`)

## Access Checks (MVP)
- Allow if `X-Token-Balance` header is a number > 0.
- Allow if `X-Dev-Bypass: 1` for local testing.
