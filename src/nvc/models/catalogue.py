"""Pydantic models for the nutrition catalogue (nutrition-values.json)."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Unit = Literal["g", "each", "bowl", "scoop", "cup", "tbsp", "tsp", "medium", "large"]
Category = Literal["protein", "carbs", "fruit", "vegetable", "fiber", "fat"]


class NutritionPerUnit(BaseModel):
    """Macronutrient values for the food's reference quantity.

    Examples:
        >>> NutritionPerUnit(protein_g=30, carbs_g=0, fat_g=3.5, calories_kcal=165)
        NutritionPerUnit(protein_g=30.0, carbs_g=0.0, fat_g=3.5, calories_kcal=165.0)
    """

    model_config = ConfigDict(extra="forbid")

    protein_g: float
    carbs_g: float
    fat_g: float
    calories_kcal: float
    fiber_g: float = 0.0


class MacroRange(BaseModel):
    """Inclusive [min, max] daily target range for a single nutrient."""

    model_config = ConfigDict(extra="forbid")

    min: float
    max: float


class DailyTargets(BaseModel):
    """Per-day macro targets used by the with-targets comparison endpoint."""

    model_config = ConfigDict(extra="forbid")

    calories_kcal: MacroRange
    protein_g: MacroRange
    carbs_g: MacroRange
    fat_g: MacroRange


class CatalogueMetadata(BaseModel):
    """Top-level metadata block from the JSON file."""

    model_config = ConfigDict(extra="forbid")

    name: str
    version: str
    daily_targets: DailyTargets
    units_supported: list[Unit] = Field(default_factory=list)


class Food(BaseModel):
    """A single food entry from the catalogue.

    `nutrition_per_unit` is the macro profile for the food's `reference_weight_g`
    when `unit == "g"`, or for a single count of the unit otherwise.
    """

    model_config = ConfigDict(extra="forbid")

    id: str
    name: str
    category: Category
    unit: Unit
    reference_weight_g: float
    nutrition_per_unit: NutritionPerUnit
    notes: str | None = None


class Catalogue(BaseModel):
    """Root of the nutrition-values.json file."""

    model_config = ConfigDict(extra="forbid")

    metadata: CatalogueMetadata
    foods: list[Food]
