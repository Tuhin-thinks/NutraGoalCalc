"""API DTOs for catalogue read/write endpoints and calculation."""

from pydantic import BaseModel, ConfigDict, Field

from nvc.models.catalogue import (
    Food,
    NutritionPerUnit,
    Category,
    Unit,
)


class FoodCreate(BaseModel):
    """Payload for creating or fully updating a food entry."""

    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=255)
    category: Category
    unit: Unit
    reference_weight_g: float = Field(gt=0)
    protein_g: float = Field(ge=0)
    carbs_g: float = Field(ge=0)
    fat_g: float = Field(ge=0)
    calories_kcal: float = Field(gt=0)
    fiber_g: float = 0.0
    min_increment: float = 1.0
    notes: str | None = None


class FoodDetail(BaseModel):
    """Full food projection with nutrition data."""

    model_config = ConfigDict(extra="forbid")

    id: str
    name: str
    category: str
    unit: str
    reference_weight_g: float
    protein_g: float
    carbs_g: float
    fat_g: float
    calories_kcal: float
    fiber_g: float
    min_increment: float
    is_custom: bool
    notes: str | None = None


class CategorySummary(BaseModel):
    """A category and how many foods belong to it."""

    model_config = ConfigDict(extra="forbid")

    category: str
    count: int


class FoodSummary(BaseModel):
    """Lightweight food projection used by list endpoints."""

    model_config = ConfigDict(extra="forbid")

    id: str
    name: str
    category: str
    unit: str
    min_increment: float
    is_custom: bool = False


class FoodsListResponse(BaseModel):
    """Response envelope for `GET /foods`."""

    model_config = ConfigDict(extra="forbid")

    count: int
    foods: list[FoodSummary]


class CategoriesResponse(BaseModel):
    """Response envelope for `GET /categories`."""

    model_config = ConfigDict(extra="forbid")

    count: int
    categories: list[CategorySummary]


class CalculationItem(BaseModel):
    """A single food entry in a calculation request.

    `quantity` is expressed in the food's native unit as defined in the catalogue
    (e.g. 200 for 200g chicken, 1 for 1 scoop whey, 2 for 2 eggs).
    """

    model_config = ConfigDict(extra="forbid")

    food_id: str
    quantity: float = Field(gt=0)


class CalculationRequest(BaseModel):
    """The request body for `POST /calculate`.

    Examples:
        >>> CalculationRequest(items=[
        ...     CalculationItem(food_id="chicken_breast_100g", quantity=200),
        ...     CalculationItem(food_id="whey_isolate_1_scoop", quantity=1),
        ... ])
    """

    model_config = ConfigDict(extra="forbid")

    items: list[CalculationItem] = Field(min_length=1)


class NutritionTotals(BaseModel):
    """Aggregated macronutrient totals across all items.

    Examples:
        >>> NutritionTotals(protein_g=85.0, carbs_g=1.5, fat_g=7.5, calories_kcal=445.0)
    """

    model_config = ConfigDict(extra="forbid")

    protein_g: float
    carbs_g: float
    fat_g: float
    calories_kcal: float
    fiber_g: float = 0.0


class ItemBreakdown(BaseModel):
    """Per-food breakdown after scaling.

    `nutrition` contains the food's reference nutrition scaled by the quantity
    entered by the user.
    """

    model_config = ConfigDict(extra="forbid")

    food_id: str
    name: str
    quantity: float
    unit: str
    scaling_factor: float
    nutrition: NutritionPerUnit


class CalculationResponse(BaseModel):
    """Response envelope for `POST /calculate`."""

    model_config = ConfigDict(extra="forbid")

    totals: NutritionTotals
    items: list[ItemBreakdown]


class ParsedRecipe(BaseModel):
    """Nutritional data extracted from unstructured recipe text by an LLM."""

    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=255)
    category: str
    unit: str
    reference_weight_g: float = Field(gt=0)
    protein_g: float = Field(ge=0)
    carbs_g: float = Field(ge=0)
    fat_g: float = Field(ge=0)
    calories_kcal: float = Field(gt=0)
    fiber_g: float = 0.0
    min_increment: float = 1.0
    notes: str | None = None


class LLMStatusResponse(BaseModel):
    """Response for the LLM configuration status endpoint."""

    model_config = ConfigDict(extra="forbid")

    configured: bool
    provider: str | None = None


class RecipeParseRequest(BaseModel):
    """Request body for the recipe parsing endpoint."""

    model_config = ConfigDict(extra="forbid")

    text: str = Field(min_length=1)



