# scrapers/rss_news.py

import feedparser
from db import save_raw, save_clean
from utils.cleaning import normalize_text

from typing import Any

def scrape_rss(run_id: str | None = None, max_retries: int = 2, timeout: int = 10) -> dict[str, Any]:
    import time
    url = "https://news.google.com/rss/search?q=Tunisia+startup"
    count = 0
    errors = []
    for attempt in range(max_retries):
        try:
            feed = feedparser.parse(url)
            if not hasattr(feed, "entries"):
                raise Exception("No entries in feed")
            break
        except Exception as e:
            if attempt == max_retries - 1:
                errors.append(f"Failed to fetch RSS: {e}")
                return {"count": count, "errors": errors}
            time.sleep(1)
    try:
        for entry in feed.entries:
            try:
                raw_data = {
                    "title": entry.title,
                    "link": entry.link,
                    "published": getattr(entry, "published", None)
                }
                save_raw("rss_news", raw_data, scraping_run_id=run_id)
                clean = {
                    "title": normalize_text(entry.title),
                    "link": entry.link,
                    "published": getattr(entry, "published", None),
                    "source": "rss_news"
                }
                save_clean(clean)
                count += 1
            except Exception as e:
                errors.append(f"Entry error: {e}")
    except Exception as e:
        errors.append(f"Parse error: {e}")
    return {"count": count, "errors": errors}