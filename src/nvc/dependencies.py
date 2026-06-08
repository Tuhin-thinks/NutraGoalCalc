"""FastAPI dependency providers wired to `app.state`."""

from fastapi import Request

from nvc.repositories.protocol import NutritionRepository
from nvc.services.protocol import NutritionCalculator


def get_repository(request: Request) -> NutritionRepository:
    """Return the `NutritionRepository` stored on the app state during startup."""
    return request.app.state.repository


def get_calculator(request: Request) -> NutritionCalculator:
    """Return the `NutritionCalculator` stored on the app state during startup."""
    return request.app.state.calculator
