"""In-memory `NutritionRepository` implementation backed by a JSON file."""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

from nvc.models.catalogue import (
    Catalogue,
    CatalogueMetadata,
    DailyTargets,
    Food,
)
from nvc.repositories.protocol import NutritionRepository


class JSONCatalogueRepository:
    """Loads `nutrition-values.json` once and serves read-only lookups.

    The repository holds a fully-validated `Catalogue` in memory; queries are
    O(n) list scans, which is fine for the static catalogue size.
    """

    def __init__(self, catalogue_path: Path) -> None:
        """Parse and validate the catalogue file at `catalogue_path`."""
        self._path = catalogue_path
        self._catalogue = self._load(catalogue_path)

    @staticmethod
    def _load(path: Path) -> Catalogue:
        """Read JSON from `path` and validate it against the `Catalogue` schema."""
        raw = path.read_text(encoding="utf-8")
        return Catalogue.model_validate(json.loads(raw))

    def list_foods(self, category: str | None = None) -> list[Food]:
        """Return all foods, optionally filtered by `category` (case-insensitive)."""
        if category is None:
            return list(self._catalogue.foods)
        needle = category.lower()
        return [food for food in self._catalogue.foods if food.category == needle]

    def get_food(self, food_id: str) -> Food:
        """Return the food with the given id, or raise `KeyError`."""
        for food in self._catalogue.foods:
            if food.id == food_id:
                return food
        raise KeyError(food_id)

    def categories(self) -> dict[str, int]:
        """Return a mapping of category name to food count, sorted by name."""
        counts: dict[str, int] = dict(Counter(food.category for food in self._catalogue.foods))
        return dict(sorted(counts.items()))

    def metadata(self) -> CatalogueMetadata:
        """Return the catalogue's metadata block (name, version, units, targets)."""
        return self._catalogue.metadata

    def targets(self) -> DailyTargets:
        """Return the daily macro targets for convenience."""
        return self._catalogue.metadata.daily_targets
