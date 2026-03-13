from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.services.auth_service import AuthService
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

GUEST_EMAIL = "guest@system.local"


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    user = await AuthService.register(db, user_data)
    return user


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    return await AuthService.login(db, user_data.email, user_data.password)


@router.post("/guest", response_model=Token)
async def guest_token(db: AsyncSession = Depends(get_db)):
    return await AuthService.get_or_create_guest(db, GUEST_EMAIL)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
