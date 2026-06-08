"""Read + write endpoints for the food catalogue."""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from nvc.dependencies import get_repository
from nvc.models.api import (
    CategoriesResponse,
    CategorySummary,
    FoodCreate,
    FoodDetail,
    FoodSummary,
    FoodsListResponse,
)
from nvc.repositories.protocol import NutritionRepository

router = APIRouter(tags=["catalogue"])


def _to_summary(food):  # noqa: ANN001, ANN202
    return FoodSummary(
        id=food.id,
        name=food.name,
        category=food.category,
        unit=food.unit,
        min_increment=food.min_increment,
        is_custom=food.is_custom,
    )


def _to_detail(food):  # noqa: ANN001, ANN202
    return FoodDetail(
        id=food.id,
        name=food.name,
        category=food.category,
        unit=food.unit,
        reference_weight_g=food.reference_weight_g,
        protein_g=food.nutrition_per_unit.protein_g,
        carbs_g=food.nutrition_per_unit.carbs_g,
        fat_g=food.nutrition_per_unit.fat_g,
        calories_kcal=food.nutrition_per_unit.calories_kcal,
        fiber_g=food.nutrition_per_unit.fiber_g,
        min_increment=food.min_increment,
        is_custom=food.is_custom,
        notes=food.notes,
    )


@router.get("/foods", response_model=FoodsListResponse)
def list_foods(
    category: str | None = Query(default=None, description="Optional category filter (case-insensitive)."),
    repo: NutritionRepository = Depends(get_repository),
) -> FoodsListResponse:
    """List all foods in the catalogue, optionally narrowed to one category."""
    foods = repo.list_foods(category=category)
    summaries = [_to_summary(f) for f in foods]
    return FoodsListResponse(count=len(summaries), foods=summaries)


@router.get("/foods/{food_id}", response_model=FoodDetail)
def get_food(
    food_id: str,
    repo: NutritionRepository = Depends(get_repository),
) -> FoodDetail:
    """Fetch a single food by its catalogue id; 404 when not found."""
    try:
        food = repo.get_food(food_id)
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"food '{food_id}' not found") from exc
    return _to_detail(food)


@router.post("/foods", response_model=FoodDetail, status_code=status.HTTP_201_CREATED)
def create_food(
    body: FoodCreate,
    repo: NutritionRepository = Depends(get_repository),
) -> FoodDetail:
    """Create a new custom food entry."""
    food = repo.create_food(body)
    return _to_detail(food)


@router.put("/foods/{food_id}", response_model=FoodDetail)
def update_food(
    food_id: str,
    body: FoodCreate,
    repo: NutritionRepository = Depends(get_repository),
) -> FoodDetail:
    """Full replacement update of a food entry; 404 when not found."""
    try:
        food = repo.update_food(food_id, body)
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"food '{food_id}' not found") from exc
    return _to_detail(food)


@router.delete("/foods/{food_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_food(
    food_id: str,
    repo: NutritionRepository = Depends(get_repository),
) -> None:
    """Delete a food entry; 404 when not found."""
    try:
        repo.delete_food(food_id)
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"food '{food_id}' not found") from exc


@router.get("/categories", response_model=CategoriesResponse)
def list_categories(repo: NutritionRepository = Depends(get_repository)) -> CategoriesResponse:
    """List distinct food categories with the number of foods in each."""
    counts = repo.categories()
    items = [CategorySummary(category=name, count=count) for name, count in counts.items()]
    return CategoriesResponse(count=len(items), categories=items)
