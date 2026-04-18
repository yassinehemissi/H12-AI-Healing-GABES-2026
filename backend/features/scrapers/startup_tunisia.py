# scrapers/startup_tunisia.py

import requests
from bs4 import BeautifulSoup
from db import save_raw, save_clean
from utils.cleaning import build_company_record

from typing import Any

def scrape_startups(run_id: str | None = None, max_retries: int = 2, timeout: int = 10) -> dict[str, Any]:
    url = "https://www.startup.gov.tn/startups"
    headers = {"User-Agent": "Mozilla/5.0"}
    count = 0
    errors = []
    for attempt in range(max_retries):
        try:
            res = requests.get(url, headers=headers, timeout=timeout)
            soup = BeautifulSoup(res.text, "html.parser")
            break
        except Exception as e:
            if attempt == max_retries - 1:
                errors.append(f"Failed to fetch HTML: {e}")
                return {"count": count, "errors": errors}
    try:
        cards = soup.select(".startup-card")
        for card in cards:
            try:
                name = card.select_one(".startup-name")
                sector = card.select_one(".startup-sector")
                raw_data = {
                    "name": name.text if name else None,
                    "sector": sector.text if sector else None
                }
                save_raw("startup_tunisia", raw_data, scraping_run_id=run_id)
                clean = build_company_record(
                    name=raw_data["name"],
                    sector=raw_data["sector"],
                    location="tunisia",
                    source="startup_tunisia"
                )
                save_clean(clean)
                count += 1
            except Exception as e:
                errors.append(f"Card error: {e}")
    except Exception as e:
        errors.append(f"Parse error: {e}")
    return {"count": count, "errors": errors}