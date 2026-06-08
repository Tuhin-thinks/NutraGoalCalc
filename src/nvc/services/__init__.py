"""Service layer for nutritional calculations."""

from nvc.services.calculator import DefaultNutritionCalculator
from nvc.services.protocol import NutritionCalculator

__all__ = ["DefaultNutritionCalculator", "NutritionCalculator"]
