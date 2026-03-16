"""
ML Service: loads trained models and provides prediction methods.
"""

import json
from functools import lru_cache
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

MODELS_DIR = Path(__file__).resolve().parent.parent.parent / "ml" / "models"
DATA_DIR = Path(__file__).resolve().parent.parent.parent / "ml" / "data"
REPORT_PATH = MODELS_DIR / "comparison_report.json"

_reg_model = None
_cls_model = None
_label_encoder = None
_report = None


def _load_models():
    global _reg_model, _cls_model, _label_encoder, _report
    if _reg_model is not None:
        return

    _reg_model = joblib.load(MODELS_DIR / "best_regression.joblib")
    _cls_model = joblib.load(MODELS_DIR / "best_classification.joblib")
    _label_encoder = joblib.load(MODELS_DIR / "label_encoder.joblib")

    with open(REPORT_PATH, "r", encoding="utf-8") as f:
        _report = json.load(f)


@lru_cache(maxsize=1)
def _load_processed_df() -> pd.DataFrame:
    return pd.read_csv(DATA_DIR / "processed_housing.csv")


def predict_price(area: float, bedrooms: int, toilets: int, district: str,
                  direction: str = "Unknown", views: int = 50) -> dict:
    _load_models()
    room_density = (bedrooms + toilets) / area if area > 0 else 0

    input_df = pd.DataFrame([{
        "area": area,
        "bedrooms": bedrooms,
        "toilets": toilets,
        "views": views,
        "room_density": room_density,
        "district": district,
        "direction": direction,
    }])

    predicted = float(_reg_model.predict(input_df)[0])
    predicted = max(0.5, round(predicted, 2))

    best_model_name = _report["regression"]["best_model"]
    r2 = _report["regression"]["models"][best_model_name]["r2"]

    return {
        "predicted_price": predicted,
        "model_used": best_model_name,
        "confidence_r2": r2,
    }


def predict_quality(area: float, bedrooms: int, toilets: int, district: str,
                    direction: str = "Unknown", views: int = 50) -> dict:
    _load_models()
    room_density = (bedrooms + toilets) / area if area > 0 else 0

    input_df = pd.DataFrame([{
        "area": area,
        "bedrooms": bedrooms,
        "toilets": toilets,
        "views": views,
        "room_density": room_density,
        "district": district,
        "direction": direction,
    }])

    pred_encoded = _cls_model.predict(input_df)[0]
    label = _label_encoder.inverse_transform([pred_encoded])[0]

    best_model_name = _report["classification"]["best_model"]
    f1 = _report["classification"]["models"][best_model_name]["f1_score"]

    return {
        "quality_label": label,
        "model_used": best_model_name,
        "confidence_f1": f1,
    }


def predict_hybrid(area: float, bedrooms: int, toilets: int, district: str,
                   direction: str = "Unknown", views: int = 50) -> dict:
    price_result = predict_price(area, bedrooms, toilets, district, direction, views)
    quality_result = predict_quality(area, bedrooms, toilets, district, direction, views)
    return {"price": price_result, "quality": quality_result}


def get_model_comparison() -> dict:
    _load_models()
    return _report


def get_dataset_stats() -> dict:
    df = _load_processed_df()

    top_districts = df["district"].value_counts().head(10).to_dict()
    quality_dist = df["quality_label"].value_counts().to_dict()

    return {
        "total_records": len(df),
        "price_min": round(float(df["price"].min()), 2),
        "price_max": round(float(df["price"].max()), 2),
        "price_mean": round(float(df["price"].mean()), 2),
        "price_median": round(float(df["price"].median()), 2),
        "area_min": round(float(df["area"].min()), 2),
        "area_max": round(float(df["area"].max()), 2),
        "area_mean": round(float(df["area"].mean()), 2),
        "top_districts": top_districts,
        "quality_distribution": quality_dist,
    }


def get_available_districts() -> list[str]:
    df = _load_processed_df()
    return sorted(df["district"].unique().tolist())
