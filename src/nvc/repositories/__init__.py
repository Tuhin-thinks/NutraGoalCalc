"""Repository layer for the catalogue."""

from nvc.repositories.protocol import NutritionRepository
from nvc.repositories.sql_repository import SQLAlchemyCatalogueRepository

__all__ = ["SQLAlchemyCatalogueRepository", "NutritionRepository"]
