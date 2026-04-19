# features/analysis/routes.py

from fastapi import APIRouter, HTTPException
from features.analysis.service import (
    get_dashboard_summary,
    get_pollution_trends,
    get_company_rankings,
    get_company_detail,
    generate_recommendations,
    ai_recommendations,
)
from features.analysis.seed import get_news_items

router = APIRouter(prefix="/analysis", tags=["Analysis"])


@router.get("/dashboard")
def dashboard_summary():
    """Top-level KPIs for the dashboard."""
    return get_dashboard_summary()


@router.get("/pollution-trends")
def pollution_trends():
    """Monthly pollution trends for charting."""
    return get_pollution_trends()


@router.get("/companies")
def company_rankings():
    """All companies ranked by RSE score."""
    return get_company_rankings()


@router.get("/companies/{company_name}")
def company_detail(company_name: str):
    """Single company detail with RSE breakdown."""
    detail = get_company_detail(company_name)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Company '{company_name}' not found")
    return detail


@router.get("/recommendations/{company_name}")
def recommendations(company_name: str):
    """Rule-based RSE improvement recommendations."""
    recs = generate_recommendations(company_name)
    # Return an empty list when no recommendations are available to avoid
    # frontend hydration/runtime errors caused by unexpected 404 responses.
    return recs or []


@router.get("/ai-recommendations/{company_name}")
async def ai_recs(company_name: str):
    """AI-powered recommendations using LLM."""
    result = await ai_recommendations(company_name)
    return {"company": company_name, "ai_response": result}


@router.get("/news")
def news_feed():
    """Environmental news feed for Gabès."""
    return get_news_items()
