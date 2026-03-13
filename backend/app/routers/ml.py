from fastapi import APIRouter, HTTPException

from app.schemas.ml import (
    DatasetStatsResponse,
    HybridPrediction,
    ModelComparisonResponse,
    PredictRequest,
    PricePrediction,
    QualityPrediction,
)
from app.services.ml_service import (
    get_available_districts,
    get_dataset_stats,
    get_model_comparison,
    predict_hybrid,
    predict_price,
    predict_quality,
)

router = APIRouter(prefix="/api/ml", tags=["Machine Learning"])


@router.post("/predict/price", response_model=PricePrediction)
async def api_predict_price(req: PredictRequest):
    try:
        return predict_price(
            area=req.area, bedrooms=req.bedrooms, toilets=req.toilets,
            district=req.district, direction=req.direction, views=req.views,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/predict/quality", response_model=QualityPrediction)
async def api_predict_quality(req: PredictRequest):
    try:
        return predict_quality(
            area=req.area, bedrooms=req.bedrooms, toilets=req.toilets,
            district=req.district, direction=req.direction, views=req.views,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/predict/hybrid", response_model=HybridPrediction)
async def api_predict_hybrid(req: PredictRequest):
    try:
        return predict_hybrid(
            area=req.area, bedrooms=req.bedrooms, toilets=req.toilets,
            district=req.district, direction=req.direction, views=req.views,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.get("/models/comparison", response_model=ModelComparisonResponse)
async def api_model_comparison():
    try:
        return get_model_comparison()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load report: {str(e)}")


@router.get("/dataset/stats", response_model=DatasetStatsResponse)
async def api_dataset_stats():
    try:
        return get_dataset_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load stats: {str(e)}")


@router.get("/districts")
async def api_get_districts():
    try:
        return {"districts": get_available_districts()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed: {str(e)}")
