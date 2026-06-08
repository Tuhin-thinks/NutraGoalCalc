"""Read endpoint exposing the catalogue's daily macro targets."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from nvc.dependencies import get_repository
from nvc.models.api import TargetsResponse
from nvc.repositories.protocol import NutritionRepository

router = APIRouter(tags=["catalogue"])


@router.get("/targets", response_model=TargetsResponse)
def get_targets(repo: NutritionRepository = Depends(get_repository)) -> TargetsResponse:
    """Return the metadata block and the daily macro targets for the catalogue."""
    metadata = repo.metadata()
    return TargetsResponse(metadata=metadata, daily_targets=repo.targets())
