from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    area: float = Field(..., gt=0, le=500, description="Diện tích (m²)")
    bedrooms: int = Field(..., ge=0, le=20)
    toilets: int = Field(..., ge=0, le=20)
    district: str = Field(..., min_length=1, description="Quận (e.g. Q.1, Q.Bình Thạnh)")
    direction: str = Field("Unknown", description="Hướng nhà (East/West/North/South/SE/NE/SW/NW/Unknown)")
    views: int = Field(50, ge=0)


class PricePrediction(BaseModel):
    model_config = {"protected_namespaces": ()}

    predicted_price: float = Field(..., description="Giá dự đoán (Triệu VNĐ/Tháng)")
    model_used: str
    confidence_r2: float = Field(..., description="R² score of the model")


class QualityPrediction(BaseModel):
    model_config = {"protected_namespaces": ()}

    quality_label: str = Field(..., description="Budget / Standard / Premium")
    model_used: str
    confidence_f1: float = Field(..., description="F1 score of the model")


class HybridPrediction(BaseModel):
    price: PricePrediction
    quality: QualityPrediction


class ModelMetrics(BaseModel):
    r2: float | None = None
    rmse: float | None = None
    mae: float | None = None
    cv_r2_mean: float | None = None
    cv_r2_std: float | None = None
    accuracy: float | None = None
    f1_score: float | None = None
    precision: float | None = None
    recall: float | None = None
    cv_accuracy_mean: float | None = None
    cv_accuracy_std: float | None = None
    train_time_sec: float | None = None


class ModelComparisonResponse(BaseModel):
    dataset_size: int
    train_size: int
    test_size: int
    regression: dict
    classification: dict


class DatasetStatsResponse(BaseModel):
    total_records: int
    price_min: float
    price_max: float
    price_mean: float
    price_median: float
    area_min: float
    area_max: float
    area_mean: float
    top_districts: dict[str, int]
    quality_distribution: dict[str, int]
