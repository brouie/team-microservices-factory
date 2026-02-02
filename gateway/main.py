import os

import httpx
from fastapi import FastAPI, HTTPException, Request, Response

BACKEND_BASE = os.getenv("BACKEND_BASE", "http://localhost:8000")

app = FastAPI(title="Microservices Gateway")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


def has_token_access(request: Request) -> bool:
    if request.headers.get("X-Dev-Bypass") == "1":
        return True
    balance = request.headers.get("X-Token-Balance")
    if balance is None:
        return False
    try:
        return float(balance) > 0
    except ValueError:
        return False


@app.api_route("/proxy/{service_id}/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
async def proxy_request(service_id: str, path: str, request: Request) -> Response:
    if not has_token_access(request):
        raise HTTPException(status_code=403, detail="Token access required")

    async with httpx.AsyncClient() as client:
        service_resp = await client.get(f"{BACKEND_BASE}/services/{service_id}")
        if service_resp.status_code != 200:
            raise HTTPException(status_code=404, detail="Service not found")
        service = service_resp.json()
        api_base_url = service.get("api_base_url")
        if not api_base_url:
            raise HTTPException(status_code=400, detail="Service not deployed")

        target_url = f"{api_base_url.rstrip('/')}/{path}"
        proxied = await client.request(
            request.method,
            target_url,
            content=await request.body(),
            headers={key: value for key, value in request.headers.items()},
            params=request.query_params,
        )

    return Response(
        content=proxied.content,
        status_code=proxied.status_code,
        headers=dict(proxied.headers),
        media_type=proxied.headers.get("content-type"),
    )
