# services/scraper_service.py

import uuid
from datetime import datetime, timezone
from features.scrapers.open_data import scrape_open_data
from features.scrapers.startup_tunisia import scrape_startups
from features.scrapers.rss_news import scrape_rss
from features.scrapers.gabes_env import scrape_gabes_env
from db import log_scraping_run
from typing import Any

def run_all_scrapers(triggered_by: str | None = None) -> dict[str, Any]:
    run_id = str(uuid.uuid4())
    started_at = datetime.now(timezone.utc)
    sources = ["open_data", "startup_tunisia", "rss_news", "gabes_env"]
    status = "running"
    error_logs: dict[str, Any] = {}
    records_processed: dict[str, int] = {}

    log_scraping_run({
        "run_id": run_id,
        "started_at": started_at,
        "sources": sources,
        "status": status,
        "triggered_by": triggered_by
    })

    results = {}
    for source, func in zip(sources, [scrape_open_data, scrape_startups, scrape_rss, scrape_gabes_env]):
        try:
            res = func(run_id=run_id)
            results[source] = res
            records_processed[source] = res.get("count", 0)
            if res.get("errors"):
                error_logs[source] = res["errors"]
        except Exception as e:
            error_logs[source] = str(e)
            records_processed[source] = 0

    finished_at = datetime.now(timezone.utc)
    status = "success" if not error_logs else "partial_failure"
    log_scraping_run({
        "run_id": run_id,
        "started_at": started_at,
        "finished_at": finished_at,
        "sources": sources,
        "status": status,
        "error_logs": error_logs,
        "records_processed": records_processed,
        "triggered_by": triggered_by
    })
    return {
        "run_id": run_id,
        "status": status,
        "error_logs": error_logs,
        "records_processed": records_processed,
        "started_at": started_at,
        "finished_at": finished_at
    }