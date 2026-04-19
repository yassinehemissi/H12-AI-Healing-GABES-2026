import pandas as pd
import json
from pathlib import Path

DATA_DIR = Path(__file__).parent

# These aliases let user-facing names such as "Gabes" resolve to the internal dataset zones.
CITY_WIDE_ALIASES = {"gabes", "gabes_city", "gابس"}


def normalize_location(location: str | None) -> str | None:
    if not location:
        return None
    return location.strip().replace(" ", "_")


def is_city_wide_location(location: str | None) -> bool:
    normalized = normalize_location(location)
    return normalized is not None and normalized.lower() in CITY_WIDE_ALIASES

def load_pollution_data(location: str = None, date: str = None) -> list[dict]:
    df = pd.read_csv(DATA_DIR / "pollution_data.csv")
    normalized_location = normalize_location(location)
    # City-wide requests should return all Gabes zones instead of failing on an exact string match.
    if normalized_location and not is_city_wide_location(normalized_location):
        df = df[df["location"] == normalized_location]
    if date:
        df = df[df["date"] == date]
    return df.to_dict(orient="records")

def load_citizen_reports(location: str = None) -> list[dict]:
    with open(DATA_DIR / "citizen_reports.json", encoding="utf-8") as f:
        reports = json.load(f)
    normalized_location = normalize_location(location)
    # We mirror the pollution-data behavior so the dashboard and analysis stay consistent.
    if normalized_location and not is_city_wide_location(normalized_location):
        reports = [r for r in reports if normalize_location(r["location"]) == normalized_location]
    return reports

def save_citizen_report(report: dict) -> dict:
    with open(DATA_DIR / "citizen_reports.json", encoding="utf-8") as f:
        reports = json.load(f)
    reports.append(report)
    with open(DATA_DIR / "citizen_reports.json", "w", encoding="utf-8") as f:
        json.dump(reports, f, indent=2, ensure_ascii=False)
    return report
