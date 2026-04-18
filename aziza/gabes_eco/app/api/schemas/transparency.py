from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class UserProfile(BaseModel):
    age_group: str = Field(..., description="enfant, adulte, senior")
    vulnerabilities: List[str] = Field(default_factory=list, description="Liste de vulnérabilités, ex: asthme")

class TransparencyRequest(BaseModel):
    location: str
    date: Optional[str] = None
    user_profile: UserProfile

class PollutantDetails(BaseModel):
    value: float
    unit: str
    status: str
    seuil_OMS: float

class TransparencyResponse(BaseModel):
    location: str
    date: str
    alert_level: str
    alert_message: str
    aqi_score: float
    pollution_summary: Dict[str, PollutantDetails]
    anomalies: List[str]
    citizen_reports_count: int
    health_recommendations: List[str]
    citizen_reports_summary: str
    hotzone_clusters: List[dict] = []
    heatmap_geojson: dict = {}

class TransparencyReportRequest(BaseModel):
    location: str
    type: str
    description: str
    severity: str

class TransparencyReportResponse(BaseModel):
    report_id: str
    status: str
    message: str
    timestamp: str

class TransparencyDashboardResponse(BaseModel):
    location: str
    last_updated: str
    current_alert_level: str
    trend_7days: str
    recent_data: List[dict]
    total_citizen_reports: int
