"""Repository interface for accessing the food catalogue."""

from typing import Protocol

from nvc.models.api import FoodCreate
from nvc.models.catalogue import (
    CatalogueMetadata,
    Food,
)


class NutritionRepository(Protocol):
    """Access to the food catalogue (read + write).

    Implementations are expected to be safe to call concurrently after the
    initial load completes.
    """

    def list_foods(self, category: str | None = None) -> list[Food]:
        ...

    def get_food(self, food_id: str) -> Food:
        ...

    def categories(self) -> dict[str, int]:
        ...

    def metadata(self) -> CatalogueMetadata:
        ...

    def create_food(self, data: FoodCreate) -> Food:
        """Create a new custom food entry. Returns the created Food with auto-generated id."""
        ...

    def update_food(self, food_id: str, data: FoodCreate) -> Food:
        """Full replacement update of a food entry. Raises KeyError if not found."""
        ...

    def delete_food(self, food_id: str) -> None:
        """Delete a food entry. Raises KeyError if not found."""
        ...
