import math

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.housing import Housing


class HousingService:
    @staticmethod
    async def get_all(
        db: AsyncSession,
        district: str | None = None,
        quality_label: str | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        min_area: float | None = None,
        max_area: float | None = None,
        min_bedrooms: int | None = None,
        max_bedrooms: int | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> dict:
        query = select(Housing)
        count_query = select(func.count(Housing.id))

        if district:
            query = query.where(Housing.district == district)
            count_query = count_query.where(Housing.district == district)
        if quality_label:
            query = query.where(Housing.quality_label == quality_label)
            count_query = count_query.where(Housing.quality_label == quality_label)
        if min_price is not None:
            query = query.where(Housing.price >= min_price)
            count_query = count_query.where(Housing.price >= min_price)
        if max_price is not None:
            query = query.where(Housing.price <= max_price)
            count_query = count_query.where(Housing.price <= max_price)
        if min_area is not None:
            query = query.where(Housing.area >= min_area)
            count_query = count_query.where(Housing.area >= min_area)
        if max_area is not None:
            query = query.where(Housing.area <= max_area)
            count_query = count_query.where(Housing.area <= max_area)
        if min_bedrooms is not None:
            query = query.where(Housing.bedrooms >= min_bedrooms)
            count_query = count_query.where(Housing.bedrooms >= min_bedrooms)
        if max_bedrooms is not None:
            query = query.where(Housing.bedrooms <= max_bedrooms)
            count_query = count_query.where(Housing.bedrooms <= max_bedrooms)

        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        offset = (page - 1) * page_size
        query = query.order_by(Housing.id).offset(offset).limit(page_size)

        result = await db.execute(query)
        items = list(result.scalars().all())

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": math.ceil(total / page_size) if total > 0 else 0,
        }

    @staticmethod
    async def get_by_id(db: AsyncSession, housing_id: int) -> Housing | None:
        result = await db.execute(select(Housing).where(Housing.id == housing_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_ids(db: AsyncSession, housing_ids: list[int]) -> list[Housing]:
        result = await db.execute(select(Housing).where(Housing.id.in_(housing_ids)))
        return list(result.scalars().all())

    @staticmethod
    async def get_districts(db: AsyncSession) -> list[str]:
        result = await db.execute(
            select(Housing.district).distinct().order_by(Housing.district)
        )
        return [row[0] for row in result.all()]

    @staticmethod
    async def count(db: AsyncSession) -> int:
        result = await db.execute(select(func.count(Housing.id)))
        return result.scalar() or 0
