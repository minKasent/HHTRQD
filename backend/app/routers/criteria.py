from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.criteria import CriteriaCreate, CriteriaResponse, CriteriaUpdate
from app.services.criteria_service import CriteriaService
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/criteria", tags=["Criteria"])


@router.get("", response_model=list[CriteriaResponse])
async def get_criteria(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return await CriteriaService.get_all(db)


@router.post("", response_model=CriteriaResponse, status_code=201)
async def create_criteria(
    data: CriteriaCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return await CriteriaService.create(db, data)


@router.put("/{criteria_id}", response_model=CriteriaResponse)
async def update_criteria(
    criteria_id: int,
    data: CriteriaUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return await CriteriaService.update(db, criteria_id, data)


@router.delete("/{criteria_id}", status_code=204)
async def delete_criteria(
    criteria_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    await CriteriaService.delete(db, criteria_id)
