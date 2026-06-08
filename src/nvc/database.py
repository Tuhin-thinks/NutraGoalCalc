"""SQLAlchemy models, engine, and seed logic."""

import json
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import Engine, Float, Integer, String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

from nvc.models.catalogue import Catalogue


class Base(DeclarativeBase):
    pass


class FoodRecord(Base):
    __tablename__ = "foods"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(50))
    unit: Mapped[str] = mapped_column(String(20))
    reference_weight_g: Mapped[float] = mapped_column(Float)
    protein_g: Mapped[float] = mapped_column(Float)
    carbs_g: Mapped[float] = mapped_column(Float)
    fat_g: Mapped[float] = mapped_column(Float)
    calories_kcal: Mapped[float] = mapped_column(Float)
    fiber_g: Mapped[float] = mapped_column(Float, default=0.0)
    min_increment: Mapped[float] = mapped_column(Float, default=1.0)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_custom: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[str] = mapped_column(String(30))
    updated_at: Mapped[str] = mapped_column(String(30))


CATALOGUE_NAME = "Body Recomposition Nutrition Tracker"
CATALOGUE_VERSION = "1.0"
UNITS_SUPPORTED: list[str] = ["g", "each", "bowl", "scoop", "cup", "tbsp", "tsp", "medium", "large"]


def get_engine(db_path: Path) -> Engine:
    return create_engine(f"sqlite:///{db_path}", echo=False)


def init_db(engine: Engine) -> None:
    Base.metadata.create_all(engine)


def seed_from_json(engine: Engine, json_path: Path) -> None:
    with Session(engine) as session:
        existing = session.query(FoodRecord).limit(1).first()
        if existing is not None:
            return

    raw = json_path.read_text(encoding="utf-8")
    catalogue = Catalogue.model_validate(json.loads(raw))

    now = datetime.now(timezone.utc).isoformat()
    with Session(engine) as session:
        for food in catalogue.foods:
            record = FoodRecord(
                id=food.id,
                name=food.name,
                category=food.category,
                unit=food.unit,
                reference_weight_g=food.reference_weight_g,
                protein_g=food.nutrition_per_unit.protein_g,
                carbs_g=food.nutrition_per_unit.carbs_g,
                fat_g=food.nutrition_per_unit.fat_g,
                calories_kcal=food.nutrition_per_unit.calories_kcal,
                fiber_g=food.nutrition_per_unit.fiber_g,
                min_increment=food.min_increment,
                notes=food.notes,
                is_custom=0,
                created_at=now,
                updated_at=now,
            )
            session.add(record)

        session.commit()
