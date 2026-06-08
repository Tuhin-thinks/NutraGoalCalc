"""Calculation endpoint aggregating nutritional totals from food entries."""

from fastapi import APIRouter, Depends, HTTPException, status

from nvc.dependencies import get_calculator, get_repository
from nvc.models.api import CalculationRequest, CalculationResponse
from nvc.repositories.protocol import NutritionRepository
from nvc.services.protocol import NutritionCalculator

router = APIRouter(tags=["calculate"])


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
