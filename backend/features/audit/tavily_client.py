import logging
import os
from typing import Any, Dict, List

import httpx

logger = logging.getLogger(__name__)


class TavilyClient:
    """Lightweight Tavily API client with safe fallbacks."""

    def __init__(self):
        self.api_key = os.getenv("TAVILY_API_KEY")
        self.base_url = "https://api.tavily.com/search"

    def search(self, query: str, max_results: int = 5) -> List[Dict[str, str]]:
        if not self.api_key:
            return []

        payload = {
            "api_key": self.api_key,
            "query": query,
            "search_depth": "advanced",
            "max_results": max_results,
            "include_answer": False,
            "include_raw_content": False,
        }

        try:
            with httpx.Client(timeout=12.0) as client:
                response = client.post(self.base_url, json=payload)
                response.raise_for_status()
                data = response.json()
        except Exception:
            logger.exception("Tavily lookup failed for query='%s'", query)
            return []

        results = data.get("results", [])
        normalized: List[Dict[str, str]] = []
        for item in results:
            normalized.append(
                {
                    "title": item.get("title", "Untitled"),
                    "url": item.get("url", ""),
                    "snippet": item.get("content", "")[:500],
                }
            )
        return normalized
