import logging

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

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ml", tags=["Machine Learning"])


@router.post("/predict/price", response_model=PricePrediction)
async def api_predict_price(req: PredictRequest):
    try:
        return predict_price(
            area=req.area, bedrooms=req.bedrooms, toilets=req.toilets,
            district=req.district, direction=req.direction, views=req.views,
        )
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail="Model chưa được huấn luyện")
    except Exception:
        logger.exception("Price prediction failed")
        raise HTTPException(status_code=500, detail="Dự đoán giá thất bại")


@router.post("/predict/quality", response_model=QualityPrediction)
async def api_predict_quality(req: PredictRequest):
    try:
        return predict_quality(
            area=req.area, bedrooms=req.bedrooms, toilets=req.toilets,
            district=req.district, direction=req.direction, views=req.views,
        )
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail="Model chưa được huấn luyện")
    except Exception:
        logger.exception("Quality prediction failed")
        raise HTTPException(status_code=500, detail="Dự đoán chất lượng thất bại")


@router.post("/predict/hybrid", response_model=HybridPrediction)
async def api_predict_hybrid(req: PredictRequest):
    try:
        return predict_hybrid(
            area=req.area, bedrooms=req.bedrooms, toilets=req.toilets,
            district=req.district, direction=req.direction, views=req.views,
        )
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail="Model chưa được huấn luyện")
    except Exception:
        logger.exception("Hybrid prediction failed")
        raise HTTPException(status_code=500, detail="Dự đoán thất bại")


@router.get("/models/comparison", response_model=ModelComparisonResponse)
async def api_model_comparison():
    try:
        return get_model_comparison()
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail="Chưa có báo cáo so sánh model")
    except Exception:
        logger.exception("Model comparison failed")
        raise HTTPException(status_code=500, detail="Không thể tải báo cáo model")


@router.get("/dataset/stats", response_model=DatasetStatsResponse)
async def api_dataset_stats():
    try:
        return get_dataset_stats()
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail="Không tìm thấy dữ liệu")
    except Exception:
        logger.exception("Dataset stats failed")
        raise HTTPException(status_code=500, detail="Không thể tải thống kê dataset")


@router.get("/districts")
async def api_get_districts():
    try:
        return {"districts": get_available_districts()}
    except Exception:
        logger.exception("Get districts failed")
        raise HTTPException(status_code=500, detail="Không thể tải danh sách quận")
