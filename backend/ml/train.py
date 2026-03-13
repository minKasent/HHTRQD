"""
Train and compare ML models for housing price prediction and quality classification.
Models: Linear Regression, Random Forest, XGBoost, Gradient Boosting.
"""

import json
import time
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor, RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import (accuracy_score, f1_score, mean_absolute_error, mean_squared_error, precision_score, r2_score, recall_score)
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, StandardScaler
from xgboost import XGBClassifier, XGBRegressor

from ml.preprocess import load_and_clean, save_processed

MODELS_DIR = Path(__file__).resolve().parent / "models"
DATA_DIR = Path(__file__).resolve().parent / "data"

NUMERIC_FEATURES = ["area", "bedrooms", "toilets", "views", "price_per_m2", "room_density"]
CATEGORICAL_FEATURES = ["district", "direction"]
REGRESSION_TARGET = "price"
CLASSIFICATION_TARGET = "quality_label"


def build_preprocessor():
    return ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), NUMERIC_FEATURES),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL_FEATURES),
        ]
    )


def train_regression_models(X_train, X_test, y_train, y_test, preprocessor):
    models = {
        "Linear Regression": Pipeline([("prep", preprocessor), ("model", LinearRegression())]),
        "Random Forest": Pipeline([("prep", preprocessor), ("model", RandomForestRegressor(n_estimators=200, max_depth=15, random_state=42, n_jobs=-1))]),
        "XGBoost": Pipeline([("prep", preprocessor), ("model", XGBRegressor(n_estimators=200, max_depth=6, learning_rate=0.1, random_state=42, verbosity=0))]),
        "Gradient Boosting": Pipeline([("prep", preprocessor), ("model", GradientBoostingRegressor(n_estimators=200, max_depth=5, learning_rate=0.1, random_state=42))]),
    }

    results = {}
    best_score = -np.inf
    best_name = ""

    for name, pipeline in models.items():
        start = time.time()
        pipeline.fit(X_train, y_train)
        train_time = time.time() - start

        y_pred = pipeline.predict(X_test)
        r2 = r2_score(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        mae = mean_absolute_error(y_test, y_pred)

        cv_scores = cross_val_score(pipeline, X_train, y_train, cv=5, scoring="r2")

        results[name] = {
            "r2": round(float(r2), 4),
            "rmse": round(float(rmse), 4),
            "mae": round(float(mae), 4),
            "cv_r2_mean": round(float(cv_scores.mean()), 4),
            "cv_r2_std": round(float(cv_scores.std()), 4),
            "train_time_sec": round(train_time, 2),
        }
        print(f"  [Regression] {name}: R²={r2:.4f}, RMSE={rmse:.4f}, MAE={mae:.4f}, CV-R²={cv_scores.mean():.4f}")

        if r2 > best_score:
            best_score = r2
            best_name = name

    return models, results, best_name


def train_classification_models(X_train, X_test, y_train, y_test, preprocessor):
    models = {
        "Logistic Regression": Pipeline([("prep", preprocessor), ("model", LogisticRegression(max_iter=1000, random_state=42))]),
        "Random Forest": Pipeline([("prep", preprocessor), ("model", RandomForestClassifier(n_estimators=200, max_depth=15, random_state=42, n_jobs=-1))]),
        "XGBoost": Pipeline([("prep", preprocessor), ("model", XGBClassifier(n_estimators=200, max_depth=6, learning_rate=0.1, random_state=42, verbosity=0, eval_metric="mlogloss"))]),
        "Gradient Boosting": Pipeline([("prep", preprocessor), ("model", GradientBoostingClassifier(n_estimators=200, max_depth=5, learning_rate=0.1, random_state=42))]),
    }

    results = {}
    best_score = -np.inf
    best_name = ""

    for name, pipeline in models.items():
        start = time.time()
        pipeline.fit(X_train, y_train)
        train_time = time.time() - start

        y_pred = pipeline.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred, average="weighted")
        prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
        rec = recall_score(y_test, y_pred, average="weighted", zero_division=0)

        cv_scores = cross_val_score(pipeline, X_train, y_train, cv=5, scoring="accuracy")

        results[name] = {
            "accuracy": round(float(acc), 4),
            "f1_score": round(float(f1), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "cv_accuracy_mean": round(float(cv_scores.mean()), 4),
            "cv_accuracy_std": round(float(cv_scores.std()), 4),
            "train_time_sec": round(train_time, 2),
        }
        print(f"  [Classification] {name}: Acc={acc:.4f}, F1={f1:.4f}, CV-Acc={cv_scores.mean():.4f}")

        if f1 > best_score:
            best_score = f1
            best_name = name

    return models, results, best_name


def run_training():
    print("=" * 60)
    print("LOADING AND PREPROCESSING DATA")
    print("=" * 60)

    df = load_and_clean()
    save_processed(df)
    print(f"Dataset: {len(df)} samples, {len(df.columns)} features")

    le = LabelEncoder()
    df["quality_encoded"] = le.fit_transform(df[CLASSIFICATION_TARGET])

    features = NUMERIC_FEATURES + CATEGORICAL_FEATURES

    # --- REGRESSION ---
    print("\n" + "=" * 60)
    print("TRAINING REGRESSION MODELS (Price Prediction)")
    print("=" * 60)

    reg_features = [f for f in NUMERIC_FEATURES if f != "price_per_m2"] + CATEGORICAL_FEATURES
    reg_preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), [f for f in NUMERIC_FEATURES if f != "price_per_m2"]),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL_FEATURES),
        ]
    )

    X_reg = df[reg_features]
    y_reg = df[REGRESSION_TARGET]
    X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(X_reg, y_reg, test_size=0.2, random_state=42)

    reg_models, reg_results, best_reg = train_regression_models(X_train_r, X_test_r, y_train_r, y_test_r, reg_preprocessor)

    # --- CLASSIFICATION ---
    print("\n" + "=" * 60)
    print("TRAINING CLASSIFICATION MODELS (Quality Scoring)")
    print("=" * 60)

    # Exclude price and price_per_m2 to avoid data leakage (label is derived from price_per_m2)
    cls_num_features = ["area", "bedrooms", "toilets", "views", "room_density"]
    cls_features = cls_num_features + CATEGORICAL_FEATURES
    X_cls = df[cls_features]
    y_cls = df["quality_encoded"]
    X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(X_cls, y_cls, test_size=0.2, random_state=42)

    cls_preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), cls_num_features),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL_FEATURES),
        ]
    )
    cls_models, cls_results, best_cls = train_classification_models(X_train_c, X_test_c, y_train_c, y_test_c, cls_preprocessor)

    # --- SAVE ---
    print("\n" + "=" * 60)
    print("SAVING MODELS")
    print("=" * 60)

    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    joblib.dump(reg_models[best_reg], MODELS_DIR / "best_regression.joblib")
    joblib.dump(cls_models[best_cls], MODELS_DIR / "best_classification.joblib")
    joblib.dump(le, MODELS_DIR / "label_encoder.joblib")

    for name, pipeline in reg_models.items():
        safe_name = name.lower().replace(" ", "_")
        joblib.dump(pipeline, MODELS_DIR / f"reg_{safe_name}.joblib")
    for name, pipeline in cls_models.items():
        safe_name = name.lower().replace(" ", "_")
        joblib.dump(pipeline, MODELS_DIR / f"cls_{safe_name}.joblib")

    quality_classes = le.classes_.tolist()

    report = {
        "dataset_size": len(df),
        "train_size": len(X_train_r),
        "test_size": len(X_test_r),
        "regression": {
            "task": "Price Prediction (Triệu VNĐ/Tháng)",
            "target": REGRESSION_TARGET,
            "features": reg_features,
            "best_model": best_reg,
            "models": reg_results,
        },
        "classification": {
            "task": "Quality Classification",
            "target": CLASSIFICATION_TARGET,
            "classes": quality_classes,
            "features": cls_features,
            "best_model": best_cls,
            "models": cls_results,
        },
    }

    report_path = MODELS_DIR / "comparison_report.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print(f"\nBest Regression: {best_reg} (R²={reg_results[best_reg]['r2']})")
    print(f"Best Classification: {best_cls} (F1={cls_results[best_cls]['f1_score']})")
    print(f"Report saved: {report_path}")
    print(f"Models saved: {MODELS_DIR}")

    return report


if __name__ == "__main__":
    run_training()
