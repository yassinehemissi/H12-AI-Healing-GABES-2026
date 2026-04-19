from pydantic import BaseModel
from typing import Any, Dict, List, Literal, Optional


class AnalyticsQueryRequest(BaseModel):
    user_prompt: str


class ChartVisualization(BaseModel):
    chart_type: Literal["bar", "line", "pie", "area", "scatter"]
    title: str
    description: Optional[str] = None
    data_points: List[Dict[str, Any]]
    x_axis: Optional[str] = None
    y_axis: Optional[str] = None
    colors: Optional[List[str]] = None


class AnalyticsResponse(BaseModel):
    success: bool
    query_interpretation: str
    visualizations: List[ChartVisualization]
    insights: str
    summary: Optional[str] = None
    data_sources: Optional[List[str]] = None
    error: Optional[str] = None
