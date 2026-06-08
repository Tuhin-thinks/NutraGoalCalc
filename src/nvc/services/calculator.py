"""Default `NutritionCalculator` implementation with unit-aware scaling."""

from nvc.models.api import (
    CalculationItem,
    CalculationResponse,
    ItemBreakdown,
    NutritionTotals,
)
from nvc.repositories.protocol import NutritionRepository


class DefaultNutritionCalculator:
    """Scales food nutrition by quantity and aggregates totals.

    Scaling rule:
    - If the food's native unit is `"g"`, the scaling factor is
      ``quantity / reference_weight_g``.
    - For all other units (each, scoop, bowl, cup, tbsp, tsp, medium, large),
      the scaling factor equals `quantity` (i.e. count-based).

    Examples:
        >>> repo = ...  # doctest: +SKIP
        >>> calc = DefaultNutritionCalculator()
        >>> result = calc.calculate(
        ...     [CalculationItem(food_id="chicken_breast_100g", quantity=100)], repo)
        >>> result.totals.protein_g
        30.0
    """

    def calculate(
        self,
        items: list[CalculationItem],
        repo: NutritionRepository,
    ) -> CalculationResponse:
        """Compute totals and per-item breakdowns for the given food entries.

        Each `food_id` is looked up in `repo`; `KeyError` propagates when
        a food is not found.
        """
        breakdowns: list[ItemBreakdown] = []
        totals = NutritionTotals(protein_g=0.0, carbs_g=0.0, fat_g=0.0, calories_kcal=0.0)

        for entry in items:
            food = repo.get_food(entry.food_id)

            if food.unit == "g":
                scaling = entry.quantity / food.reference_weight_g
            else:
                scaling = entry.quantity

            scaled = food.nutrition_per_unit.model_copy(deep=True)
            scaled.protein_g *= scaling
            scaled.carbs_g *= scaling
            scaled.fat_g *= scaling
            scaled.calories_kcal *= scaling
            scaled.fiber_g *= scaling

            totals.protein_g += scaled.protein_g
            totals.carbs_g += scaled.carbs_g
            totals.fat_g += scaled.fat_g
            totals.calories_kcal += scaled.calories_kcal
            totals.fiber_g += scaled.fiber_g

            breakdowns.append(
                ItemBreakdown(
                    food_id=food.id,
                    name=food.name,
                    quantity=entry.quantity,
                    unit=food.unit,
                    scaling_factor=scaling,
                    nutrition=scaled,
                )
            )

        return CalculationResponse(totals=totals, items=breakdowns)
