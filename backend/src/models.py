from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ServiceStatus(str, Enum):
    QUEUED = "queued"
    DEPLOYING = "deploying"
    DEPLOYED = "deployed"
    FAILED = "failed"


class IdeaSubmission(BaseModel):
    idea: str = Field(min_length=3, max_length=1000)
    requester_id: str | None = Field(default=None, max_length=200)
    metadata: dict[str, Any] | None = None


class ServiceRecord(BaseModel):
    id: str
    idea: str
    requester_id: str | None = None
    metadata: dict[str, Any] | None = None
    status: ServiceStatus
    token_address: str | None = None
    api_base_url: str | None = None
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)


class AccessResponse(BaseModel):
    api_key: str
    api_base_url: str
    token_address: str


class ServiceEvent(BaseModel):
    service_id: str
    status: ServiceStatus
    message: str | None = None
    created_at: datetime = Field(default_factory=utc_now)