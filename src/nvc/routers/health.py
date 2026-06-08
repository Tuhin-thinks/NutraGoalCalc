"""Liveness probe for orchestration / health checks."""

from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/healthz")
def healthz() -> dict[str, str]:
    """Return a fixed `status: ok` payload indicating the service is alive."""
    return {"status": "ok"}
