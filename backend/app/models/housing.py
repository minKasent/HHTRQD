from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Housing(Base):
    __tablename__ = "housings"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    area: Mapped[float] = mapped_column(Float, nullable=False)
    bedrooms: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    toilets: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    direction: Mapped[str] = mapped_column(String(50), nullable=False, default="Unknown")
    district: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    address: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    street: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    views: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    price_per_m2: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    room_density: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    quality_label: Mapped[str] = mapped_column(String(20), nullable=False, default="Budget")
