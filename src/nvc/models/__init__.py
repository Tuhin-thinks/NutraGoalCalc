"""Pydantic models for the nutrition backend.

The package groups two distinct concerns:
- `catalogue`: domain models that mirror `nutrition-values.json`.
- `api`: request/response DTOs for the REST surface.
"""

from nvc.models.api import (
    CalculationItem,
    CalculationRequest,
    CalculationResponse,
    CategoriesResponse,
    CategorySummary,
    FoodCreate,
    FoodDetail,
    FoodSummary,
    FoodsListResponse,
    ItemBreakdown,
    NutritionTotals,
)
from nvc.models.catalogue import (
    Category,
    Catalogue,
    CatalogueMetadata,
    Food,
    NutritionPerUnit,
    Unit,
)

__all__ = [
    "CalculationItem",
    "CalculationRequest",
    "CalculationResponse",
    "CategoriesResponse",
    "Category",
    "CategorySummary",
    "Catalogue",
    "CatalogueMetadata",
    "Food",
    "FoodCreate",
    "FoodDetail",
    "FoodSummary",
    "FoodsListResponse",
    "ItemBreakdown",
    "NutritionPerUnit",
    "NutritionTotals",
    "Unit",
]
