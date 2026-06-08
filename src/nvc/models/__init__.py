"""Pydantic models for the nutrition backend.

The package groups two distinct concerns:
- `catalogue`: domain models that mirror `nutrition-values.json`.
- `api`: request/response DTOs for the REST surface.
"""

from nvc.models.api import (
    CategoriesResponse,
    CategorySummary,
    FoodSummary,
    FoodsListResponse,
    TargetsResponse,
)
from nvc.models.catalogue import (
    Category,
    Catalogue,
    CatalogueMetadata,
    DailyTargets,
    Food,
    MacroRange,
    NutritionPerUnit,
    Unit,
)

__all__ = [
    "CategoriesResponse",
    "Category",
    "CategorySummary",
    "Catalogue",
    "CatalogueMetadata",
    "DailyTargets",
    "Food",
    "FoodSummary",
    "FoodsListResponse",
    "MacroRange",
    "NutritionPerUnit",
    "TargetsResponse",
    "Unit",
]
