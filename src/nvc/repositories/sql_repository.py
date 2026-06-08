"""SQLAlchemy-backed repository implementing NutritionRepository."""

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import Engine, func, select
from sqlalchemy.orm import Session

from nvc.database import (
    CATALOGUE_NAME,
    CATALOGUE_VERSION,
    UNITS_SUPPORTED,
    FoodRecord,
)
from nvc.models.api import FoodCreate
from nvc.models.catalogue import (
    CatalogueMetadata,
    Food,
    NutritionPerUnit,
)


class SQLAlchemyCatalogueRepository:
    """CRUD repository backed by SQLite via SQLAlchemy."""

    def __init__(self, engine: Engine) -> None:
        self.engine = engine

    def _to_food(self, r: FoodRecord) -> Food:
        return Food(
            id=r.id,
            name=r.name,
            category=r.category,
            unit=r.unit,
            reference_weight_g=r.reference_weight_g,
            nutrition_per_unit=NutritionPerUnit(
                protein_g=r.protein_g,
                carbs_g=r.carbs_g,
                fat_g=r.fat_g,
                calories_kcal=r.calories_kcal,
                fiber_g=r.fiber_g,
            ),
            min_increment=r.min_increment,
            notes=r.notes,
            is_custom=bool(r.is_custom),
        )

    def list_foods(self, category: str | None = None) -> list[Food]:
        with Session(self.engine) as session:
            query = select(FoodRecord)
            if category:
                query = query.where(FoodRecord.category == category)
            query = query.order_by(FoodRecord.created_at.desc())
            records = session.execute(query).scalars().all()
            return [self._to_food(r) for r in records]

    def get_food(self, food_id: str) -> Food:
        with Session(self.engine) as session:
            record = session.get(FoodRecord, food_id)
        if record is None:
            raise KeyError(food_id)
        return self._to_food(record)

    def categories(self) -> dict[str, int]:
        with Session(self.engine) as session:
            rows = session.execute(
                select(FoodRecord.category, func.count(FoodRecord.id)).group_by(FoodRecord.category)
            ).all()
            result = {row[0]: row[1] for row in rows}
            return dict(sorted(result.items()))

    def metadata(self) -> CatalogueMetadata:
        return CatalogueMetadata(
            name=CATALOGUE_NAME,
            version=CATALOGUE_VERSION,
            units_supported=UNITS_SUPPORTED,
        )

    def create_food(self, data: FoodCreate) -> Food:
        now = datetime.now(timezone.utc).isoformat()
        record = FoodRecord(
            id=f"custom_{uuid4().hex[:12]}",
            name=data.name,
            category=data.category,
            unit=data.unit,
            reference_weight_g=data.reference_weight_g,
            protein_g=data.protein_g,
            carbs_g=data.carbs_g,
            fat_g=data.fat_g,
            calories_kcal=data.calories_kcal,
            fiber_g=data.fiber_g,
            min_increment=data.min_increment,
            notes=data.notes,
            is_custom=1,
            created_at=now,
            updated_at=now,
        )
        with Session(self.engine) as session:
            session.add(record)
            session.commit()
            session.refresh(record)
        return self._to_food(record)

    def update_food(self, food_id: str, data: FoodCreate) -> Food:
        now = datetime.now(timezone.utc).isoformat()
        with Session(self.engine) as session:
            record = session.get(FoodRecord, food_id)
            if record is None:
                raise KeyError(food_id)
            record.name = data.name
            record.category = data.category
            record.unit = data.unit
            record.reference_weight_g = data.reference_weight_g
            record.protein_g = data.protein_g
            record.carbs_g = data.carbs_g
            record.fat_g = data.fat_g
            record.calories_kcal = data.calories_kcal
            record.fiber_g = data.fiber_g
            record.min_increment = data.min_increment
            record.notes = data.notes
            record.updated_at = now
            session.commit()
            session.refresh(record)
        return self._to_food(record)

    def delete_food(self, food_id: str) -> None:
        with Session(self.engine) as session:
            record = session.get(FoodRecord, food_id)
            if record is None:
                raise KeyError(food_id)
            session.delete(record)
            session.commit()
