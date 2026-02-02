# API Contract (MVP)

Base URL: `/`

## Auth
- `Authorization: Bearer <user_token>` for protected routes (MVP can be optional).
- `X-Api-Key: <api_key>` for gateway access to service APIs.

## Error Response
```
{
  "error": "string",
  "detail": "string"
}
```

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
  "requester_id": "string|null",
  "metadata": "object|null",
  "status": "queued|deploying|deployed|failed",
  "token_address": "string|null",
  "api_base_url": "string|null",
  "created_at": "string (ISO-8601)",
  "updated_at": "string (ISO-8601)"
}
```

### Status Codes
- `200` success
- `400` bad request or invalid state
- `404` service not found
- `500` server error
