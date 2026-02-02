from __future__ import annotations

import json
import os
import secrets
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .models import ServiceEvent, ServiceRecord, ServiceStatus


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ServiceStore:
    def __init__(self) -> None:
        self._services: dict[str, ServiceRecord] = {}
        self._api_keys: dict[str, str] = {}
        self._events: dict[str, list[ServiceEvent]] = {}
        self._data_path = self._resolve_data_path()
        if self._data_path:
            self._load_from_disk()

    def _resolve_data_path(self) -> Path | None:
        path = os.getenv("SERVICE_STORE_PATH")
        if not path:
            return None
        return Path(path)

    def _load_from_disk(self) -> None:
        if not self._data_path or not self._data_path.exists():
            return
        data = json.loads(self._data_path.read_text(encoding="utf-8"))
        self._services = {
            service_id: ServiceRecord(**payload)
            for service_id, payload in data.get("services", {}).items()
        }
        self._events = {
            service_id: [ServiceEvent(**event) for event in events]
            for service_id, events in data.get("events", {}).items()
        }
        self._api_keys = data.get("api_keys", {})

    def _persist_to_disk(self) -> None:
        if not self._data_path:
            return
        self._data_path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "services": {
                service_id: record.model_dump(mode="json")
                for service_id, record in self._services.items()
            },
            "events": {
                service_id: [event.model_dump(mode="json") for event in events]
                for service_id, events in self._events.items()
            },
            "api_keys": self._api_keys,
        }
        self._data_path.write_text(
            json.dumps(payload, indent=2, sort_keys=True), encoding="utf-8"
        )

    def create_service(
        self,
        idea: str,
        requester_id: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> ServiceRecord:
        service_id = uuid.uuid4().hex
        record = ServiceRecord(
            id=service_id,
            idea=idea,
            requester_id=requester_id,
            metadata=metadata,
            status=ServiceStatus.QUEUED,
        )
        self._services[service_id] = record
        self._events[service_id] = [
            ServiceEvent(service_id=service_id, status=ServiceStatus.QUEUED)
        ]
        self._persist_to_disk()
        return record

    def list_services(self) -> list[ServiceRecord]:
        return list(self._services.values())

    def get_service(self, service_id: str) -> ServiceRecord | None:
        return self._services.get(service_id)

    def update_status(
        self, service_id: str, status: ServiceStatus, message: str | None = None
    ) -> ServiceRecord:
        record = self._services[service_id]
        record.status = status
        record.updated_at = utc_now()
        self._events[service_id].append(
            ServiceEvent(service_id=service_id, status=status, message=message)
        )
        self._persist_to_disk()
        return record

    def list_events(self, service_id: str) -> list[ServiceEvent]:
        return list(self._events.get(service_id, []))

    def set_api_base_url(self, service_id: str, url: str) -> ServiceRecord:
        record = self._services[service_id]
        record.api_base_url = url
        record.updated_at = utc_now()
        self._persist_to_disk()
        return record

    def set_token_address(self, service_id: str, token_address: str) -> ServiceRecord:
        record = self._services[service_id]
        record.token_address = token_address
        record.updated_at = utc_now()
        self._persist_to_disk()
        return record

    def ensure_api_key(self, service_id: str) -> str:
        if service_id not in self._api_keys:
            self._api_keys[service_id] = secrets.token_urlsafe(32)
            self._persist_to_disk()
        return self._api_keys[service_id]
