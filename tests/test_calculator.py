"""Unit tests for DefaultNutritionCalculator scaling and aggregation."""

import pytest

from nvc.models.api import CalculationItem
from nvc.repositories.protocol import NutritionRepository
from nvc.services.calculator import DefaultNutritionCalculator


def test_simple_g_scale(repo: NutritionRepository, calculator: DefaultNutritionCalculator):
    result = calculator.calculate(
        [CalculationItem(food_id="chicken_breast_100g", quantity=100)], repo
    )
    assert result.totals.protein_g == 30.0
    assert result.totals.carbs_g == 0.0
    assert result.totals.fat_g == 3.5
    assert result.totals.calories_kcal == 165.0


def test_double_quantity_g(repo: NutritionRepository, calculator: DefaultNutritionCalculator):
    result = calculator.calculate(
        [CalculationItem(food_id="chicken_breast_100g", quantity=200)], repo
    )
    assert result.totals.protein_g == 60.0
    assert result.totals.fat_g == 7.0
    assert result.totals.calories_kcal == 330.0


def test_count_based_scaling(repo: NutritionRepository, calculator: DefaultNutritionCalculator):
    result = calculator.calculate(
        [CalculationItem(food_id="whole_egg_1", quantity=2)], repo
    )
    assert result.totals.protein_g == 12.6
    assert result.totals.carbs_g == 1.2
    assert result.totals.fat_g == 10.0
    assert result.totals.calories_kcal == 144.0


def test_scoop_unit(repo: NutritionRepository, calculator: DefaultNutritionCalculator):
    result = calculator.calculate(
        [CalculationItem(food_id="whey_isolate_1_scoop", quantity=1)], repo
    )
    assert result.totals.protein_g == 25.0
    assert result.totals.carbs_g == 1.5
    assert result.totals.calories_kcal == 115.0


def test_bowl_unit(repo: NutritionRepository, calculator: DefaultNutritionCalculator):
    result = calculator.calculate(
        [CalculationItem(food_id="chole_1_bowl", quantity=2)], repo
    )
    assert result.totals.protein_g == 24.0
    assert result.totals.calories_kcal == 500.0


def test_mixed_items_sum(repo: NutritionRepository, calculator: DefaultNutritionCalculator):
    result = calculator.calculate(
        [
            CalculationItem(food_id="chicken_breast_100g", quantity=200),
            CalculationItem(food_id="whey_isolate_1_scoop", quantity=1),
        ],
        repo,
    )
    assert result.totals.protein_g == 85.0
    assert result.totals.carbs_g == 1.5
    assert result.totals.fat_g == 7.5
    assert result.totals.calories_kcal == 445.0


def test_fiber_is_zero_when_absent(repo: NutritionRepository, calculator: DefaultNutritionCalculator):
    result = calculator.calculate(
        [CalculationItem(food_id="chicken_breast_100g", quantity=100)], repo
    )
    assert result.totals.fiber_g == 0.0


def test_fiber_is_summed(repo: NutritionRepository, calculator: DefaultNutritionCalculator):
    result = calculator.calculate(
        [
            CalculationItem(food_id="psyllium_husk_1_tbsp", quantity=2),
            CalculationItem(food_id="flax_seeds_1_tbsp", quantity=1),
        ],
        repo,
    )
    assert result.totals.fiber_g == 13.0
    assert result.totals.calories_kcal == 95.0


def test_item_breakdown_correct(repo: NutritionRepository, calculator: DefaultNutritionCalculator):
    result = calculator.calculate(
        [CalculationItem(food_id="banana_1_medium", quantity=2)], repo
    )
    assert len(result.items) == 1
    item = result.items[0]
    assert item.food_id == "banana_1_medium"
    assert item.quantity == 2.0
    assert item.unit == "medium"
    assert item.scaling_factor == 2.0
    assert item.nutrition.protein_g == 2.6


def test_unknown_food_raises_keyerror(repo: NutritionRepository, calculator: DefaultNutritionCalculator):
    with pytest.raises(KeyError):
        calculator.calculate([CalculationItem(food_id="nonexistent_food", quantity=1)], repo)
