"""API DTOs for catalogue read endpoints."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict

from nvc.models.catalogue import (
    CatalogueMetadata,
    DailyTargets,
    Food,
)


class CategorySummary(BaseModel):
    """A category and how many foods belong to it."""

    model_config = ConfigDict(extra="forbid")

    category: str
    count: int


class FoodSummary(BaseModel):
    """Lightweight food projection used by list endpoints."""

    model_config = ConfigDict(extra="forbid")

    id: str
    name: str
    category: str
    unit: str


class FoodsListResponse(BaseModel):
    """Response envelope for `GET /foods`."""

    model_config = ConfigDict(extra="forbid")

    count: int
    foods: list[FoodSummary]


class CategoriesResponse(BaseModel):
    """Response envelope for `GET /categories`."""

    model_config = ConfigDict(extra="forbid")

    count: int
    categories: list[CategorySummary]


class TargetsResponse(BaseModel):
    """Response envelope for `GET /targets`."""

    model_config = ConfigDict(extra="forbid")

    metadata: CatalogueMetadata
    daily_targets: DailyTargets
