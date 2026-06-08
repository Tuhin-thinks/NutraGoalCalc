"""Calculation endpoint aggregating nutritional totals from food entries."""

from fastapi import APIRouter, Depends, HTTPException, status

from nvc.dependencies import get_calculator, get_repository
from nvc.models.api import (
    CalculationRequest,
    CalculationResponse,
    TargetComparisonEntry,
    TargetComparisonResponse,
)
from nvc.repositories.protocol import NutritionRepository
from nvc.services.protocol import NutritionCalculator

router = APIRouter(tags=["calculate"])

_NUTRIENT_MAP: list[tuple[str, str]] = [
    ("calories_kcal", "calories_kcal"),
    ("protein_g", "protein_g"),
    ("carbs_g", "carbs_g"),
    ("fat_g", "fat_g"),
]


@router.post("/calculate", response_model=CalculationResponse)
def calculate(
    body: CalculationRequest,
    repo: NutritionRepository = Depends(get_repository),
    calc: NutritionCalculator = Depends(get_calculator),
) -> CalculationResponse:
    """Compute total nutritional values for a list of food entries.

    Each item's `quantity` is interpreted in the food's native unit as defined
    in the catalogue (grams for weight-based foods, counts for piece-based).

    Examples:
        Request:
            {
              "items": [
                {"food_id": "chicken_breast_100g", "quantity": 200},
                {"food_id": "whey_isolate_1_scoop", "quantity": 1}
              ]
            }
        Response:
            {
              "totals": {"protein_g": 85.0, "carbs_g": 1.5, "fat_g": 7.5, "calories_kcal": 445.0, "fiber_g": 0.0},
              "items": [...]
            }
    """
    try:
        return calc.calculate(body.items, repo)
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"food '{exc.args[0]}' not found") from exc


@router.post("/calculate/with-targets", response_model=TargetComparisonResponse)
def calculate_with_targets(
    body: CalculationRequest,
    repo: NutritionRepository = Depends(get_repository),
    calc: NutritionCalculator = Depends(get_calculator),
) -> TargetComparisonResponse:
    """Compute totals, per-item breakdowns, and daily target comparisons.

    Each nutrient's `percent_of_midpoint` indicates how much of the daily
    target midpoint the current intake represents.
    """
    try:
        result = calc.calculate(body.items, repo)
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"food '{exc.args[0]}' not found") from exc

    targets = repo.targets()
    comparison: list[TargetComparisonEntry] = []
    for nutrient, attr in _NUTRIENT_MAP:
        current = getattr(result.totals, attr)
        target_range = getattr(targets, nutrient)
        midpoint = (target_range.min + target_range.max) / 2.0
        pct = (current / midpoint * 100) if midpoint > 0 else 0.0
        comparison.append(
            TargetComparisonEntry(
                nutrient=nutrient,
                current=current,
                min=target_range.min,
                max=target_range.max,
                percent_of_midpoint=round(pct, 1),
            )
        )

    return TargetComparisonResponse(
        totals=result.totals,
        items=result.items,
        target_comparison=comparison,
    )
