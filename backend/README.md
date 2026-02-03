# Backend

FastAPI service for orchestrating microservice generation and deployment.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn src.main:app --reload --port 8000

# Verify
curl http://localhost:8000/health
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/` | GET | Service info |
| `/ideas` | POST | Submit new idea |
| `/services` | GET | List all services |
| `/services/{id}` | GET | Get service by ID |
| `/services/{id}/events` | GET | Get service events |
| `/services/{id}/events/summary` | GET | Get event summary |
| `/services/{id}/generate` | POST | Generate service code |
| `/services/{id}/deploy` | POST | Deploy service |
| `/services/{id}/token` | POST | Create token |
| `/services/{id}/access` | POST | Get API credentials |
| `/stats` | GET | Platform statistics |
| `/services/{id}/status` | GET | Detailed service status |

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `SERVICE_STORE_PATH` | JSON file for persisting all data | None (in-memory) |
| `SERVICE_EVENTS_PATH` | JSON file for events only | None |
| `VERCEL_TOKEN` | Token for deploying generated services | None |
| `OPENAI_API_KEY` | API key for LLM code generation | None |

## Project Structure

```
backend/
├── src/
│   ├── __init__.py
│   ├── main.py          # FastAPI app and routes
│   ├── models.py        # Pydantic models
│   ├── store.py         # Service registry and persistence
│   ├── generator.py     # Code generation logic
│   ├── deployer.py      # Deployment to Vercel
│   └── analytics.py     # Event analytics
├── requirements.txt
├── Procfile             # Heroku/Render deployment
└── vercel.json          # Vercel serverless config
```

## Data Models

### ServiceRecord
```python
{
    "id": "abc123",
    "idea": "A service that...",
    "requester_id": "user-123",
    "metadata": {},
    "status": "queued",  # queued|generating|generated|deploying|deployed|failed
    "token_address": null,
    "api_base_url": null,
    "created_at": "2026-02-03T...",
    "updated_at": "2026-02-03T..."
}
```

### ServiceEvent
```python
{
    "service_id": "abc123",
    "status": "queued",
    "message": "Service created",
    "created_at": "2026-02-03T..."
}
```

## Usage Examples

### Submit an Idea

```bash
curl -X POST http://localhost:8000/ideas \
  -H "Content-Type: application/json" \
  -d '{"idea": "A service that summarizes text"}'
```

### List Services

```bash
curl http://localhost:8000/services
```

### Deploy a Service

```bash
curl -X POST http://localhost:8000/services/{service_id}/deploy
```

### Create Token

```bash
curl -X POST http://localhost:8000/services/{service_id}/token
```

### Get Platform Stats

```bash
curl http://localhost:8000/stats
```

## Development

### Run with Auto-Reload

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### Enable Persistence

```bash
export SERVICE_STORE_PATH=/tmp/store.json
uvicorn src.main:app --reload
```

### View Logs

FastAPI logs requests automatically. For verbose logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Deployment

### Render

Uses `Procfile`:
```
web: uvicorn src.main:app --host 0.0.0.0 --port $PORT
```

### Vercel

Uses `vercel.json` for serverless Python deployment.

### Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY src/ ./src/
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Testing

```bash
# Install test dependencies
pip install pytest httpx

# Run tests
pytest -v
```

See [TESTING.md](../TESTING.md) for full test instructions.
