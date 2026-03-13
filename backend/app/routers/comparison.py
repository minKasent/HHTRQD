from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.comparison import CriteriaComparisonCreate, AllAlternativeComparisonsCreate
from app.services.decision_service import DecisionService
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/sessions", tags=["AHP Comparison"])


@router.post("/{session_id}/criteria-comparison")
async def save_criteria_comparison(
    session_id: int,
    data: CriteriaComparisonCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await DecisionService.save_criteria_comparisons(db, session_id, current_user.id, data)


@router.post("/{session_id}/alternative-comparison")
async def save_alternative_comparison(
    session_id: int,
    data: AllAlternativeComparisonsCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await DecisionService.save_alternative_comparisons(db, session_id, current_user.id, data)


@router.get("/{session_id}/comparisons")
async def get_comparisons(
    session_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await DecisionService.get_comparisons(db, session_id, current_user.id)
