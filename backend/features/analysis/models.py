from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PollutionMetric(BaseModel):
    id: Optional[str] = None
    timestamp: datetime
    pollutant: str          # SO2, phosphogypsum, heavy_metals, wastewater
    value: float
    unit: str               # ppm, tonnes, mg/L, pH
    location: str
    source: str
    company: Optional[str] = None


class RSEScore(BaseModel):
    company: str
    sector: str
    location: str
    environmental_score: float   # 0-100
    social_score: float          # 0-100
    governance_score: float      # 0-100
    overall_score: float         # 0-100
    grade: str                   # A, B, C, D, E, F
    recommendations: list[str] = []
    last_assessed: datetime


class CompanyDetail(BaseModel):
    name: str
    sector: str
    location: str
    description: str
    employee_count: Optional[int] = None
    founded_year: Optional[int] = None
    rse_score: Optional[RSEScore] = None
    pollution_contribution: Optional[float] = None  # percentage


class DashboardSummary(BaseModel):
    total_companies: int
    avg_rse_score: float
    avg_grade: str
    pollution_trend: str          # "improving", "worsening", "stable"
    pollution_change_pct: float   # e.g. -5.2 means 5.2% decrease
    top_pollutants: list[dict]    # [{"name": "SO2", "value": 120, "unit": "ppm"}]
    recent_news_count: int
    data_sources: int
    last_scraping_run: Optional[str] = None


class PollutionTrendPoint(BaseModel):
    month: str          # "2025-01", "2025-02", etc.
    so2: float
    phosphogypsum: float
    heavy_metals: float
    wastewater: float


class Recommendation(BaseModel):
    category: str       # "environmental", "social", "governance"
    priority: str       # "high", "medium", "low"
    title: str
    description: str
    impact_score: float  # estimated RSE score improvement
