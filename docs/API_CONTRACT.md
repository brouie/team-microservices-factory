# API Contract (MVP)

Base URL: `/`

## Health
- `GET /health`
  - Response: `{ "status": "ok" }`

## Idea Submission
- `POST /ideas`
  - Request:
    - `idea` (string, required)
    - `requester_id` (string, optional)
    - `metadata` (object, optional)
  - Response: `ServiceRecord`

## Services
- `GET /services`
  - Response: `ServiceRecord[]`
- `GET /services/{service_id}`
  - Response: `ServiceRecord`

## Deployment
- `POST /services/{service_id}/deploy`
  - Response: `ServiceRecord`

## Token
- `POST /services/{service_id}/token`
  - Response: `ServiceRecord`

## Access
- `POST /services/{service_id}/access`
  - Response:
    - `api_key` (string)
    - `api_base_url` (string)
    - `token_address` (string)

---

### ServiceRecord
```
{
  "id": "string",
  "idea": "string",
  "status": "queued|deploying|deployed|failed",
  "token_address": "string|null",
  "api_base_url": "string|null",
  "created_at": "string (ISO-8601)",
  "updated_at": "string (ISO-8601)"
}
```
