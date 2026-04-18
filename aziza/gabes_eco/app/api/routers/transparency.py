from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.api.schemas.transparency import (
    TransparencyRequest, TransparencyResponse, 
    TransparencyReportRequest, TransparencyReportResponse,
    TransparencyDashboardResponse
)
from app.data.data_loader import save_citizen_report, load_pollution_data, load_citizen_reports
from app.agents.transparency.graph import run_transparency_agent

router = APIRouter()

@router.post("/analyze", response_model=TransparencyResponse)
async def analyze_pollution(request: TransparencyRequest):
    try:
        result = await run_transparency_agent(request.dict())
        return result["final_response"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/report", response_model=TransparencyReportResponse)
async def submit_report(request: TransparencyReportRequest):
    import uuid
    report_id = f"RPT-{str(uuid.uuid4())[:8]}"
    timestamp = datetime.now().isoformat()
    
    report_data = {
        "id": report_id,
        "timestamp": timestamp,
        "location": request.location,
        "citizen_id": "anonymous", # Simplification
        "type": request.type,
        "description": request.description,
        "severity": request.severity,
        "verified": False
    }
    
    save_citizen_report(report_data)
    
    return TransparencyReportResponse(
        report_id=report_id,
        status="enregistré",
        message="Merci pour votre signalement. Il a été enregistré et sera pris en compte dans l'analyse de votre zone.",
        timestamp=timestamp
    )

@router.get("/dashboard/{location}", response_model=TransparencyDashboardResponse)
async def get_dashboard(location: str):
    data = load_pollution_data(location)
    reports = load_citizen_reports(location)
    
    if not data:
        raise HTTPException(status_code=404, detail="No data found for this location")
        
    last_data = data[-1]
    
    return TransparencyDashboardResponse(
        location=location,
        last_updated=datetime.now().isoformat(),
        current_alert_level="Inconnu", # Will be computed by agent usually
        trend_7days="stable",
        recent_data=data[-7:],
        total_citizen_reports=len(reports)
    )
