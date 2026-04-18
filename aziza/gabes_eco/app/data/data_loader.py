import pandas as pd
import json
from pathlib import Path

DATA_DIR = Path(__file__).parent

def load_pollution_data(location: str = None, date: str = None) -> list[dict]:
    df = pd.read_csv(DATA_DIR / "pollution_data.csv")
    if location:
        df = df[df["location"] == location]
    if date:
        df = df[df["date"] == date]
    return df.to_dict(orient="records")

def load_citizen_reports(location: str = None) -> list[dict]:
    with open(DATA_DIR / "citizen_reports.json", encoding="utf-8") as f:
        reports = json.load(f)
    if location:
        reports = [r for r in reports if r["location"] == location]
    return reports

def save_citizen_report(report: dict) -> dict:
    with open(DATA_DIR / "citizen_reports.json", encoding="utf-8") as f:
        reports = json.load(f)
    reports.append(report)
    with open(DATA_DIR / "citizen_reports.json", "w", encoding="utf-8") as f:
        json.dump(reports, f, indent=2, ensure_ascii=False)
    return report
