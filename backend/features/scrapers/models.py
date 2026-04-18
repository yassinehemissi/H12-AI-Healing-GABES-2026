from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime

class Company(BaseModel):
    name: str
    source: str
    timestamp: datetime
    confidence_score: float
    normalized_name: Optional[str] = None
    extra: Optional[dict] = None
    scraping_run_id: Optional[str] = None

class Startup(BaseModel):
    name: str
    source: str
    timestamp: datetime
    confidence_score: float
    normalized_name: Optional[str] = None
    extra: Optional[dict] = None
    scraping_run_id: Optional[str] = None

class NewsSignal(BaseModel):
    title: str
    url: str
    source: str
    timestamp: datetime
    confidence_score: float
    normalized_title: Optional[str] = None
    extra: Optional[dict] = None
    scraping_run_id: Optional[str] = None

class ScrapingRunMetadata(BaseModel):
    run_id: str
    started_at: datetime
    finished_at: Optional[datetime] = None
    sources: List[str]
    status: str
    error_logs: Optional[dict] = None
    records_processed: Optional[dict] = None
    triggered_by: Optional[str] = None
