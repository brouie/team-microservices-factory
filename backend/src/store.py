from __future__ import annotations

import secrets
import uuid
from datetime import datetime, timezone

from .models import ServiceRecord, ServiceStatus


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ServiceStore:
    def __init__(self) -> None:
        self._services: dict[str, ServiceRecord] = {}
        self._api_keys: dict[str, str] = {}

    def create_service(self, idea: str) -> ServiceRecord:
        service_id = uuid.uuid4().hex
        record = ServiceRecord(
            id=service_id,
            idea=idea,
            status=ServiceStatus.QUEUED,
        )
        self._services[service_id] = record
        return record

    def list_services(self) -> list[ServiceRecord]:
        return list(self._services.values())

    def get_service(self, service_id: str) -> ServiceRecord | None:
        return self._services.get(service_id)

    def update_status(self, service_id: str, status: ServiceStatus) -> ServiceRecord:
        record = self._services[service_id]
        record.status = status
        record.updated_at = utc_now()
        return record

    def set_api_base_url(self, service_id: str, url: str) -> ServiceRecord:
        record = self._services[service_id]
        record.api_base_url = url
        record.updated_at = utc_now()
        return record

    def set_token_address(self, service_id: str, token_address: str) -> ServiceRecord:
        record = self._services[service_id]
        record.token_address = token_address
        record.updated_at = utc_now()
        return record

    def ensure_api_key(self, service_id: str) -> str:
        if service_id not in self._api_keys:
            self._api_keys[service_id] = secrets.token_urlsafe(32)
        return self._api_keys[service_id]
