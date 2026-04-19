# db.py

"""
MongoDB helpers and lightweight persistence layer.

This module reads Mongo connection settings from environment variables:
- `MONGODB_URI` (default: mongodb://localhost:27017/)
- `MONGODB_DB`  (default: h12_gabes)

It preserves existing raw/clean collections and adds application collections
for pollution metrics, RSE scores, and companies.
"""

import os
from pymongo import MongoClient, errors
from datetime import datetime, timezone
from typing import Any


MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("MONGODB_DB", "h12_gabes")

client = MongoClient(MONGODB_URI)
db = client[DB_NAME]

# Collections
raw_collection = db.get_collection("raw_data")
clean_collection = db.get_collection("cleaned_data")
scraping_runs_collection = db.get_collection("scraping_runs")

# Application collections
pollution_collection = db.get_collection("pollution_metrics")
rse_collection = db.get_collection("rse_scores")
companies_collection = db.get_collection("companies")


# Raw data helpers
def save_raw(source: str, data: dict[str, Any], scraping_run_id: str | None = None) -> None:
    doc = {
        "source": source,
        "scraped_at": datetime.now(timezone.utc),
        "data": data,
        "scraping_run_id": scraping_run_id,
    }
    raw_collection.insert_one(doc)


def get_raw(query: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    return list(raw_collection.find(query or {}))


def save_clean(data: dict[str, Any]) -> None:
    clean_collection.insert_one(data)


def get_clean(query: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    return list(clean_collection.find(query or {}))


def log_scraping_run(metadata: dict[str, Any]) -> None:
    metadata = dict(metadata)
    if "started_at" not in metadata:
        metadata["started_at"] = datetime.now(timezone.utc)
    scraping_runs_collection.insert_one(metadata)


def get_last_scraping_run() -> dict[str, Any] | None:
    return scraping_runs_collection.find_one(sort=[("started_at", -1)])


def get_scraping_runs(query: dict[str, Any] | None = None, limit: int = 10) -> list[dict[str, Any]]:
    return list(scraping_runs_collection.find(query or {}).sort("started_at", -1).limit(limit))


# --- New helpers for analysis collections ---

def save_pollution_metric(metric: dict[str, Any]) -> None:
    doc = dict(metric)
    doc.setdefault("inserted_at", datetime.now(timezone.utc))
    pollution_collection.insert_one(doc)


def get_pollution_metrics(query: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    return list(pollution_collection.find(query or {}))


def save_rse_score(score: dict[str, Any]) -> None:
    doc = dict(score)
    doc.setdefault("last_assessed", datetime.now(timezone.utc).isoformat())
    rse_collection.insert_one(doc)


def get_rse_scores(query: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    return list(rse_collection.find(query or {}))


def save_company(company: dict[str, Any]) -> None:
    companies_collection.insert_one(company)


def get_companies(query: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    return list(companies_collection.find(query or {}))


def ensure_indexes() -> None:
    try:
        companies_collection.create_index("name")
        rse_collection.create_index("company")
        pollution_collection.create_index([("timestamp", -1), ("pollutant", 1)])
    except errors.PyMongoError:
        # Fail silently — indexes are best-effort for local/dev
        pass
