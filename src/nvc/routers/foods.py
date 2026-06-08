"""Read endpoints for the food catalogue."""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from nvc.dependencies import get_repository
from nvc.models.api import (
    CategoriesResponse,
    CategorySummary,
    FoodSummary,
    FoodsListResponse,
)
from nvc.repositories.protocol import NutritionRepository

router = APIRouter(tags=["catalogue"])


@router.get("/foods", response_model=FoodsListResponse)
def list_foods(
    category: str | None = Query(default=None, description="Optional category filter (case-insensitive)."),
    repo: NutritionRepository = Depends(get_repository),
) -> FoodsListResponse:
    """List all foods in the catalogue, optionally narrowed to one category."""
    foods = repo.list_foods(category=category)
    summaries = [FoodSummary(id=f.id, name=f.name, category=f.category, unit=f.unit) for f in foods]
    return FoodsListResponse(count=len(summaries), foods=summaries)


@router.get("/foods/{food_id}", response_model=FoodSummary)
def get_food(
    food_id: str,
    repo: NutritionRepository = Depends(get_repository),
) -> FoodSummary:
    """Fetch a single food by its catalogue id; 404 when not found."""
    try:
        food = repo.get_food(food_id)
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"food '{food_id}' not found") from exc
    return FoodSummary(id=food.id, name=food.name, category=food.category, unit=food.unit)


@router.get("/categories", response_model=CategoriesResponse)
def list_categories(repo: NutritionRepository = Depends(get_repository)) -> CategoriesResponse:
    """List distinct food categories with the number of foods in each."""
    counts = repo.categories()
    items = [CategorySummary(category=name, count=count) for name, count in counts.items()]
    return CategoriesResponse(count=len(items), categories=items)
