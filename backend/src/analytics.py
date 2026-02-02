from __future__ import annotations

import json
import os
from pathlib import Path

from .models import ServiceEvent


def load_events_from_path() -> dict[str, list[ServiceEvent]]:
    path = os.getenv("SERVICE_EVENTS_PATH")
    if not path:
        return {}
    data_path = Path(path)
    if not data_path.exists():
        return {}
    payload = json.loads(data_path.read_text(encoding="utf-8"))
    return {
        service_id: [ServiceEvent(**event) for event in events]
        for service_id, events in payload.items()
    }
