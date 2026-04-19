# features/analytics/routes.py

from fastapi import APIRouter, HTTPException

from .schemas import AnalyticsQueryRequest, AnalyticsResponse
from .service import generate_analytics

router = APIRouter(tags=["Analytics"])


@router.post("/generate", response_model=AnalyticsResponse)
def generate(request: AnalyticsQueryRequest) -> AnalyticsResponse:
    """Generate chart visualizations and insights from a natural language prompt."""
    if not request.user_prompt or not request.user_prompt.strip():
        raise HTTPException(
            status_code=400,
            detail="user_prompt must be a non-empty, non-whitespace string.",
        )
    return generate_analytics(request.user_prompt)


@router.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "healthy"}
