import secrets

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .analytics import load_events_from_path
from .models import (
    AccessResponse,
    IdeaSubmission,
    ServiceEvent,
    ServiceRecord,
    ServiceStatus,
)
from .store import ServiceStore

app = FastAPI(title="Microservice Factory API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
store = ServiceStore()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/")
def root() -> dict[str, str]:
    return {"name": "Microservice Factory API", "status": "ok"}


@app.post("/ideas", response_model=ServiceRecord)
def submit_idea(payload: IdeaSubmission) -> ServiceRecord:
    return store.create_service(
        payload.idea,
        requester_id=payload.requester_id,
        metadata=payload.metadata,
    )


@app.get("/services", response_model=list[ServiceRecord])
def list_services() -> list[ServiceRecord]:
    return store.list_services()


@app.get("/services/{service_id}", response_model=ServiceRecord)
def get_service(service_id: str) -> ServiceRecord:
    record = store.get_service(service_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Service not found")
    return record


@app.get("/services/{service_id}/events", response_model=list[ServiceEvent])
def list_service_events(service_id: str) -> list[ServiceEvent]:
    record = store.get_service(service_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Service not found")
    return store.list_events(service_id)


@app.get("/services/{service_id}/events/summary")
def get_event_summary(service_id: str) -> dict[str, object]:
    record = store.get_service(service_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Service not found")

    events = store.list_events(service_id)
    if not events:
        persisted = load_events_from_path()
        events = persisted.get(service_id, [])

    counts: dict[str, int] = {}
    for event in events:
        counts[event.status.value] = counts.get(event.status.value, 0) + 1

    last_event = events[-1].model_dump(mode="json") if events else None
    return {
        "service_id": service_id,
        "total_events": len(events),
        "counts": counts,
        "last_event": last_event,
    }


@app.post("/services/{service_id}/deploy", response_model=ServiceRecord)
def deploy_service(service_id: str) -> ServiceRecord:
    record = store.get_service(service_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Service not found")

    store.update_status(service_id, ServiceStatus.DEPLOYING, "Deployment started")
    store.update_status(service_id, ServiceStatus.DEPLOYED, "Deployment finished")
    return store.set_api_base_url(service_id, f"https://api.example.com/{service_id}")


@app.post("/services/{service_id}/token", response_model=ServiceRecord)
def create_token(service_id: str) -> ServiceRecord:
    record = store.get_service(service_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Service not found")

    token_address = f"0x{secrets.token_hex(20)}"
    record = store.set_token_address(service_id, token_address)
    store.update_status(service_id, record.status, "Token created")
    return record


@app.post("/services/{service_id}/access", response_model=AccessResponse)
def create_access(service_id: str) -> AccessResponse:
    record = store.get_service(service_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Service not found")
    if not record.token_address:
        raise HTTPException(status_code=400, detail="Token not created for service")
    if not record.api_base_url:
        raise HTTPException(status_code=400, detail="Service not deployed yet")

    api_key = store.ensure_api_key(service_id)
    return AccessResponse(
        api_key=api_key,
        api_base_url=record.api_base_url,
        token_address=record.token_address,
    )


@app.get("/stats")
def get_stats() -> dict[str, object]:
    """Get aggregate statistics about services in the system."""
    services = store.list_services()
    status_counts: dict[str, int] = {}
    for service in services:
        status_counts[service.status.value] = status_counts.get(service.status.value, 0) + 1

    deployed_count = sum(1 for s in services if s.api_base_url)
    tokenized_count = sum(1 for s in services if s.token_address)

    return {
        "total_services": len(services),
        "status_counts": status_counts,
        "deployed_count": deployed_count,
        "tokenized_count": tokenized_count,
    }


@app.get("/services/{service_id}/status")
def get_service_status(service_id: str) -> dict[str, object]:
    """Get detailed status information for a service."""
    record = store.get_service(service_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Service not found")

    events = store.list_events(service_id)
    return {
        "service_id": service_id,
        "status": record.status.value,
        "is_deployed": record.api_base_url is not None,
        "is_tokenized": record.token_address is not None,
        "event_count": len(events),
        "last_updated": record.updated_at.isoformat(),
    }