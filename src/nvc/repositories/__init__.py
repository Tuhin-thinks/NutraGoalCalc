"""Repository layer for the catalogue."""

from nvc.repositories.json_repository import JSONCatalogueRepository
from nvc.repositories.protocol import NutritionRepository

__all__ = ["JSONCatalogueRepository", "NutritionRepository"]
