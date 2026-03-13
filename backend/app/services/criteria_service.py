from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.criteria import Criteria
from app.schemas.criteria import CriteriaCreate, CriteriaUpdate


class CriteriaService:
    @staticmethod
    async def get_all(db: AsyncSession) -> list[Criteria]:
        result = await db.execute(select(Criteria).order_by(Criteria.code))
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(db: AsyncSession, criteria_id: int) -> Criteria:
        result = await db.execute(select(Criteria).where(Criteria.id == criteria_id))
        criteria = result.scalar_one_or_none()
        if not criteria:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tiêu chí")
        return criteria

    @staticmethod
    async def create(db: AsyncSession, data: CriteriaCreate) -> Criteria:
        existing = await db.execute(select(Criteria).where(Criteria.code == data.code))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Mã tiêu chí '{data.code}' đã tồn tại")

        criteria = Criteria(**data.model_dump())
        db.add(criteria)
        await db.flush()
        await db.refresh(criteria)
        return criteria

    @staticmethod
    async def update(db: AsyncSession, criteria_id: int, data: CriteriaUpdate) -> Criteria:
        criteria = await CriteriaService.get_by_id(db, criteria_id)
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(criteria, key, value)
        await db.flush()
        await db.refresh(criteria)
        return criteria

    @staticmethod
    async def delete(db: AsyncSession, criteria_id: int) -> None:
        criteria = await CriteriaService.get_by_id(db, criteria_id)
        await db.delete(criteria)

    @staticmethod
    async def seed_defaults(db: AsyncSession) -> list[Criteria]:
        existing = await db.execute(select(Criteria))
        if existing.scalars().first():
            return []

        defaults = [
            CriteriaCreate(name="Giá thuê", description="Giá thuê hàng tháng", code="C1", is_benefit=False, unit="VNĐ/tháng"),
            CriteriaCreate(name="Diện tích", description="Diện tích phòng trọ", code="C2", is_benefit=True, unit="m²"),
            CriteriaCreate(name="Khoảng cách", description="Khoảng cách đến trường", code="C3", is_benefit=False, unit="km"),
            CriteriaCreate(name="An ninh", description="Mức độ an ninh khu vực", code="C4", is_benefit=True, unit="điểm"),
            CriteriaCreate(name="Tiện nghi", description="Các tiện nghi đi kèm (wifi, máy lạnh, ...)", code="C5", is_benefit=True, unit="điểm"),
            CriteriaCreate(name="Môi trường", description="Môi trường xung quanh (yên tĩnh, sạch sẽ, ...)", code="C6", is_benefit=True, unit="điểm"),
        ]

        created = []
        for d in defaults:
            c = Criteria(**d.model_dump())
            db.add(c)
            created.append(c)

        await db.flush()
        return created
