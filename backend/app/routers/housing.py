from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.housing import HousingListResponse, HousingResponse
from app.services.housing_service import HousingService

router = APIRouter(prefix="/api/housings", tags=["Housing"])


@router.get("", response_model=HousingListResponse)
async def get_housings(
    district: str | None = Query(None),
    quality_label: str | None = Query(None),
    min_price: float | None = Query(None, ge=0),
    max_price: float | None = Query(None, ge=0),
    min_area: float | None = Query(None, ge=0),
    max_area: float | None = Query(None, ge=0),
    min_bedrooms: int | None = Query(None, ge=0),
    max_bedrooms: int | None = Query(None, ge=0),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await HousingService.get_all(
        db,
        district=district,
        quality_label=quality_label,
        min_price=min_price,
        max_price=max_price,
        min_area=min_area,
        max_area=max_area,
        min_bedrooms=min_bedrooms,
        max_bedrooms=max_bedrooms,
        page=page,
        page_size=page_size,
    )


@router.get("/districts")
async def get_districts(db: AsyncSession = Depends(get_db)):
    districts = await HousingService.get_districts(db)
    return {"districts": districts}


@router.get("/{housing_id}", response_model=HousingResponse)
async def get_housing(housing_id: int, db: AsyncSession = Depends(get_db)):
    housing = await HousingService.get_by_id(db, housing_id)
    if not housing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy nhà trọ")
    return housing
