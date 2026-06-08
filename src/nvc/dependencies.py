"""FastAPI dependency providers wired to `app.state`."""

from __future__ import annotations

from fastapi import Request

from nvc.repositories.protocol import NutritionRepository


def get_repository(request: Request) -> NutritionRepository:
    """Return the `NutritionRepository` stored on the app state during startup."""
    return request.app.state.repository
