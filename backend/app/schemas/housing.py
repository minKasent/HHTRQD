from pydantic import BaseModel, Field


class HousingResponse(BaseModel):
    id: int
    price: float
    area: float
    bedrooms: int
    toilets: int
    direction: str
    district: str
    address: str
    street: str
    views: int
    price_per_m2: float
    room_density: float
    quality_label: str

    model_config = {"from_attributes": True}


class HousingFilter(BaseModel):
    district: str | None = None
    quality_label: str | None = None
    min_price: float | None = Field(None, ge=0)
    max_price: float | None = Field(None, ge=0)
    min_area: float | None = Field(None, ge=0)
    max_area: float | None = Field(None, ge=0)
    min_bedrooms: int | None = Field(None, ge=0)
    max_bedrooms: int | None = Field(None, ge=0)
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)


class HousingListResponse(BaseModel):
    items: list[HousingResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
