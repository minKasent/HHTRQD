from datetime import datetime

from pydantic import BaseModel, Field


class SessionCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    housing_ids: list[int] = Field(..., min_length=2, max_length=7)
    criteria_ids: list[int] = Field(..., min_length=2, max_length=10)


class SessionResponse(BaseModel):
    id: int
    user_id: int
    name: str
    description: str | None
    status: str
    created_at: datetime
    completed_at: datetime | None
    housings: list[dict] = []
    criteria: list[dict] = []

    model_config = {"from_attributes": True}


class SessionListResponse(BaseModel):
    id: int
    name: str
    description: str | None
    status: str
    created_at: datetime
    completed_at: datetime | None
    housing_count: int = 0
    criteria_count: int = 0

    model_config = {"from_attributes": True}


class AHPResultResponse(BaseModel):
    housing_id: int
    housing_name: str
    final_score: float
    ranking: int
    criteria_weights: dict | None
    alternative_scores: dict | None
    consistency_ratio: float | None
    is_consistent: bool | None


class CalculationResponse(BaseModel):
    session_id: int
    session_name: str
    status: str
    criteria_weights: dict
    criteria_consistency: dict
    alternative_consistencies: dict
    rankings: list[AHPResultResponse]
    overall_consistent: bool
