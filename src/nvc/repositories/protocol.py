"""Repository interface for accessing the static food catalogue."""

from __future__ import annotations

from typing import Protocol

from nvc.models.catalogue import (
    CatalogueMetadata,
    DailyTargets,
    Food,
)


class NutritionRepository(Protocol):
    """Read-only access to the food catalogue loaded from `nutrition-values.json`.

    Implementations are expected to be safe to call concurrently after the
    initial load completes.
    """

    def list_foods(self, category: str | None = None) -> list[Food]:
        """Return all foods, optionally filtered by `category` (case-insensitive)."""
        ...

    def get_food(self, food_id: str) -> Food:
        """Return the food with the given id, or raise `KeyError`."""
        ...

    def categories(self) -> dict[str, int]:
        """Return a mapping of category name to food count (sorted by name)."""
        ...

    def metadata(self) -> CatalogueMetadata:
        """Return the catalogue's metadata block (name, version, units, targets)."""
        ...

    def targets(self) -> DailyTargets:
        """Return the daily macro targets for convenience."""
        ...
