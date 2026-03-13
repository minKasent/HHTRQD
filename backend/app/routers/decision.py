from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.decision import SessionCreate
from app.services.decision_service import DecisionService
from app.services.housing_service import HousingService
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/sessions", tags=["Decision Sessions"])


@router.get("")
async def get_sessions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await DecisionService.get_sessions(db, current_user.id)


@router.post("", status_code=201)
async def create_session(
    data: SessionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await DecisionService.create_session(db, current_user.id, data)


@router.get("/dashboard-stats")
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    housing_count = await HousingService.count(db)
    session_count = await DecisionService.count_sessions(db, current_user.id)
    sessions = await DecisionService.get_sessions(db, current_user.id)
    completed = [s for s in sessions if s["status"] == "completed"]
    return {
        "housing_count": housing_count,
        "session_count": session_count,
        "completed_count": len(completed),
        "recent_sessions": sessions[:5],
    }


@router.get("/{session_id}")
async def get_session(
    session_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await DecisionService.get_session(db, session_id, current_user.id)


@router.delete("/{session_id}", status_code=204)
async def delete_session(
    session_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await DecisionService.delete_session(db, session_id, current_user.id)


@router.post("/{session_id}/calculate")
async def calculate_ahp(
    session_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await DecisionService.calculate(db, session_id, current_user.id)


@router.get("/{session_id}/results")
async def get_results(
    session_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await DecisionService.get_results(db, session_id, current_user.id)
