from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.api.schemas.transparency import (
    TransparencyRequest, TransparencyResponse, 
    TransparencyReportRequest, TransparencyReportResponse,
    TransparencyDashboardResponse
)
from app.data.data_loader import (
    load_citizen_reports,
    load_pollution_data,
    normalize_location,
    save_citizen_report,
)
from app.agents.transparency.graph import run_transparency_agent

router = APIRouter()

@router.post("/analyze", response_model=TransparencyResponse)
async def analyze_pollution(request: TransparencyRequest):
    try:
        payload = request.dict()
        # We normalize user-entered place names once at the API boundary so every downstream node sees the same key.
        payload["location"] = normalize_location(payload.get("location")) or "Gabes"
        result = await run_transparency_agent(payload)
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
        # Reports are stored with normalized locations so later filtering is reliable.
        "location": normalize_location(request.location) or request.location,
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
    normalized_location = normalize_location(location) or location
    data = load_pollution_data(normalized_location)
    reports = load_citizen_reports(normalized_location)
    
    if not data:
        raise HTTPException(status_code=404, detail="No data found for this location")
        
    last_data = data[-1]
    
    return TransparencyDashboardResponse(
        location=normalized_location,
        last_updated=datetime.now().isoformat(),
        current_alert_level="Inconnu", # Will be computed by agent usually
        trend_7days="stable",
        recent_data=data[-7:],
        total_citizen_reports=len(reports)
    )
