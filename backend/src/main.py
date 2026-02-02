import secrets

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .models import AccessResponse, IdeaSubmission, ServiceRecord, ServiceStatus
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
    return store.create_service(payload.idea)


@app.get("/services", response_model=list[ServiceRecord])
def list_services() -> list[ServiceRecord]:
    return store.list_services()


@app.get("/services/{service_id}", response_model=ServiceRecord)
def get_service(service_id: str) -> ServiceRecord:
    record = store.get_service(service_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Service not found")
    return record


@app.post("/services/{service_id}/deploy", response_model=ServiceRecord)
def deploy_service(service_id: str) -> ServiceRecord:
    record = store.get_service(service_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Service not found")

    store.update_status(service_id, ServiceStatus.DEPLOYING)
    store.update_status(service_id, ServiceStatus.DEPLOYED)
    return store.set_api_base_url(service_id, f"https://api.example.com/{service_id}")


@app.post("/services/{service_id}/token", response_model=ServiceRecord)
def create_token(service_id: str) -> ServiceRecord:
    record = store.get_service(service_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Service not found")

    token_address = f"0x{secrets.token_hex(20)}"
    return store.set_token_address(service_id, token_address)


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
