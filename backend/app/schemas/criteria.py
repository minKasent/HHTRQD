from datetime import datetime

from pydantic import BaseModel, Field


class CriteriaCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    code: str = Field(..., min_length=1, max_length=50)
    is_benefit: bool = True
    unit: str | None = None


class CriteriaUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    is_benefit: bool | None = None
    unit: str | None = None


class CriteriaResponse(BaseModel):
    id: int
    name: str
    description: str | None
    code: str
    is_benefit: bool
    unit: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
