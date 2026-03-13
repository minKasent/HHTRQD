from contextlib import asynccontextmanager
from pathlib import Path

import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, func

from app.config import get_settings
from app.database import engine, Base, async_session_factory
from app.models.housing import Housing
from app.routers import auth, criteria, housing, comparison, decision, ml
from app.services.criteria_service import CriteriaService

settings = get_settings()

CSV_PATH = Path(__file__).resolve().parent.parent / "ml" / "data" / "processed_housing.csv"


async def seed_housing_from_csv(db):
    result = await db.execute(select(func.count(Housing.id)))
    count = result.scalar() or 0
    if count > 0:
        return

    df = pd.read_csv(CSV_PATH)
    housings = []
    for _, row in df.iterrows():
        housings.append(Housing(
            price=float(row["price"]),
            area=float(row["area"]),
            bedrooms=int(row["bedrooms"]),
            toilets=int(row["toilets"]),
            direction=str(row.get("direction", "Unknown")),
            district=str(row["district"]),
            address=str(row.get("address", "")),
            street=str(row.get("street", "")),
            views=int(row.get("views", 0)),
            price_per_m2=float(row.get("price_per_m2", 0)),
            room_density=float(row.get("room_density", 0)),
            quality_label=str(row.get("quality_label", "Budget")),
        ))

    db.add_all(housings)
    await db.flush()


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as db:
        await CriteriaService.seed_defaults(db)
        await seed_housing_from_csv(db)
        await db.commit()

    yield

    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    description="Hệ hỗ trợ ra quyết định chọn nhà trọ cho sinh viên sử dụng AHP + Machine Learning",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(criteria.router)
app.include_router(housing.router)
app.include_router(comparison.router)
app.include_router(decision.router)
app.include_router(ml.router)


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": settings.APP_NAME}
