# scrapers/open_data.py

import requests
import pandas as pd
from db import save_raw, save_clean
from utils.cleaning import build_company_record

from typing import Any

def scrape_open_data(run_id: str | None = None, max_retries: int = 2, timeout: int = 10) -> dict[str, Any]:
    url = "https://data.gov.tn/dataset/sample.csv"
    count = 0
    errors = []
    try:
        for attempt in range(max_retries):
            try:
                df = pd.read_csv(url, timeout=timeout)
                break
            except Exception as e:
                if attempt == max_retries - 1:
                    errors.append(f"Failed to fetch CSV: {e}")
                    return {"count": count, "errors": errors}
    except Exception as e:
        errors.append(str(e))
        return {"count": count, "errors": errors}

    for _, row in df.iterrows():
        try:
            raw_data = row.to_dict()
            save_raw("open_data", raw_data, scraping_run_id=run_id)
            clean = build_company_record(
                name=row.get("name"),
                sector=row.get("sector"),
                location=row.get("region"),
                source="open_data"
            )
            save_clean(clean)
            count += 1
        except Exception as e:
            errors.append(f"Row error: {e}")
    return {"count": count, "errors": errors}