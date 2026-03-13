"""
Data preprocessing pipeline for HCM City rental housing dataset.
Cleans raw CSV, engineers features, and outputs train-ready dataframe.
"""

import re
from pathlib import Path

import numpy as np
import pandas as pd


RAW_CSV = Path(__file__).resolve().parent.parent.parent / "rental_housing_in_HCM_city.csv"
PROCESSED_CSV = Path(__file__).resolve().parent / "data" / "processed_housing.csv"


def parse_price(val: str) -> float | None:
    """'6.5 Triệu/Tháng' -> 6.5"""
    if not isinstance(val, str):
        return None
    m = re.search(r"([\d.,]+)", val.replace(",", "."))
    return float(m.group(1)) if m else None


def parse_area(val: str) -> float | None:
    """'14 m²' -> 14.0"""
    if not isinstance(val, str):
        return None
    m = re.search(r"([\d.,]+)", val.replace(",", "."))
    return float(m.group(1)) if m else None


def parse_bedrooms(val: str) -> int | None:
    """'2 PN' -> 2"""
    if not isinstance(val, str):
        return None
    m = re.search(r"(\d+)", val)
    return int(m.group(1)) if m else None


def parse_views(val: str) -> int | None:
    """'Lượt xem: 35' -> 35"""
    if not isinstance(val, str):
        return None
    m = re.search(r"(\d+)", val)
    return int(m.group(1)) if m else None


def clean_district(val: str) -> str:
    """Normalize district names."""
    if not isinstance(val, str):
        return "Unknown"
    return val.strip().replace("Quận ", "Q.").replace("Huyện ", "H.").replace("Thành phố ", "TP.")


def clean_address(val: str) -> str:
    """Remove 'Địa chỉ:' prefix and clean whitespace."""
    if not isinstance(val, str):
        return ""
    addr = re.sub(r"^Địa chỉ:\s*", "", val).strip()
    addr = re.sub(r",\s*Hồ Chí Minh\s*$", "", addr)
    return addr


def clean_street(val: str) -> str:
    """Remove 'Đường ' prefix."""
    if not isinstance(val, str):
        return ""
    return val.strip().replace("Đường ", "")


def load_and_clean(csv_path: Path | None = None) -> pd.DataFrame:
    """Full preprocessing pipeline."""
    path = csv_path or RAW_CSV
    df = pd.read_csv(path, encoding="utf-8")

    df["price"] = df["Giá"].apply(parse_price)
    df["area"] = df["Diện tích"].apply(parse_area)
    df["bedrooms"] = df["Số phòng ngủ"].apply(parse_bedrooms)
    df["toilets"] = pd.to_numeric(df["Số toilet"], errors="coerce")
    df["views"] = df["Lượt xem"].apply(parse_views)
    df["district"] = df["Quận"].apply(clean_district)
    df["address"] = df["Địa chỉ nhà"].apply(clean_address)
    df["street"] = df["Đường"].apply(clean_street)

    direction_map = {"Đông": "East", "Tây": "West", "Nam": "South", "Bắc": "North",
                     "Đông Nam": "SE", "Đông Bắc": "NE", "Tây Nam": "SW", "Tây Bắc": "NW"}
    df["direction"] = df["Hướng nhà"].map(direction_map).fillna("Unknown")

    df = df.dropna(subset=["price", "area"])
    df = df[df["price"] > 0]
    df = df[df["area"] > 0]

    # Filter for student-relevant range: price <= 50tr, area <= 200m2
    df = df[(df["price"] <= 50) & (df["area"] <= 200)]

    df["bedrooms"] = df["bedrooms"].fillna(0).astype(int)
    df["toilets"] = df["toilets"].fillna(0).astype(int)
    df["views"] = df["views"].fillna(df["views"].median())

    df["price_per_m2"] = df["price"] / df["area"]
    df["room_density"] = (df["bedrooms"] + df["toilets"]) / df["area"]

    # Quality label based on price_per_m2 percentiles within each district
    df["quality_label"] = pd.qcut(
        df["price_per_m2"], q=3, labels=["Budget", "Standard", "Premium"]
    )

    result = df[["price", "area", "bedrooms", "toilets", "direction",
                 "district", "address", "street", "views", "price_per_m2",
                 "room_density", "quality_label"]].copy()
    result = result.reset_index(drop=True)

    return result


def save_processed(df: pd.DataFrame, out_path: Path | None = None) -> Path:
    path = out_path or PROCESSED_CSV
    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(path, index=False, encoding="utf-8-sig")
    return path


if __name__ == "__main__":
    df = load_and_clean()
    out = save_processed(df)
    print(f"Processed {len(df)} records -> {out}")
    print(f"\nColumns: {list(df.columns)}")
    print(f"\nSample:\n{df.head()}")
    print(f"\nPrice stats:\n{df['price'].describe()}")
    print(f"\nDistrict counts:\n{df['district'].value_counts().head(10)}")
    print(f"\nQuality distribution:\n{df['quality_label'].value_counts()}")
