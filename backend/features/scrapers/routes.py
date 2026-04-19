# features/scraping/routes.py


from fastapi import APIRouter, BackgroundTasks
from features.scrapers.service import run_all_scrapers
from db import get_last_scraping_run, get_clean
from features.scrapers.models import Company, NewsSignal

router = APIRouter(prefix="/scraping", tags=["Scraping"])


@router.post("/run")
def trigger_scraping(background_tasks: BackgroundTasks):
    # Start scraping in background, return a run_id for tracking
    def run_and_log():
        run_all_scrapers(triggered_by="api")
    background_tasks.add_task(run_and_log)
    return {"status": "Scraping started in background"}

# features/scraping/routes.py


from typing import Any

@router.get("/status", response_model=dict)
def scraping_status() -> dict[str, Any]:
    last_run = get_last_scraping_run()
    if not last_run:
        return {"status": "idle", "last_run": None}
    return {
        "status": last_run.get("status", "unknown"),
        "last_run": str(last_run.get("finished_at")),
        "records_processed": last_run.get("records_processed"),
        "error_logs": last_run.get("error_logs"),
        "run_id": last_run.get("run_id")
    }

# Data endpoints
@router.get("/data/companies", response_model=list[Company])
def get_companies():
    # Return cleaned companies
    docs = get_clean({"source": {"$in": ["open_data", "startup_tunisia"]}})
    # Remove Mongo _id for Pydantic
    for d in docs:
        d.pop("_id", None)
    return docs

@router.get("/data/news", response_model=list[NewsSignal])
def get_news():
    docs = get_clean({"source": {"$in": ["rss_news", "gabes_env"]}})
    for d in docs:
        d.pop("_id", None)
    return docs