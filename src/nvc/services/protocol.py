"""Calculator interface for aggregating nutritional totals from food entries."""

from typing import Protocol

from nvc.models.api import CalculationItem, CalculationResponse
from nvc.repositories.protocol import NutritionRepository


class NutritionCalculator(Protocol):
    """Aggregates macronutrient totals across a list of food entries.

    Implementations are stateless; the repository is passed at call time.
    """

    def calculate(
        self,
        items: list[CalculationItem],
        repo: NutritionRepository,
    ) -> CalculationResponse:
        """Return totals and per-item breakdowns for the given food entries.

        Raises `KeyError` if any `food_id` is not found in the catalogue.
        """
        ...
