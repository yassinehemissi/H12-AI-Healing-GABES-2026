import logging
import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from .models import AuditRequest, AuditResult
from .service import AuditService

router = APIRouter(prefix="/audit", tags=["project-audit"])
logger = logging.getLogger(__name__)

# Initialize the audit service
audit_service = AuditService()


@router.post("/", response_model=AuditResult)
async def audit_project(request: AuditRequest) -> AuditResult:
    """
    Audit a pollution control project using multi-agent analysis.

    This endpoint performs a comprehensive audit of pollution-related projects in Gabes,
    analyzing legal compliance, financial viability, stakeholder dynamics, and technical feasibility.
    """
    try:
        logger.info(
            "Received audit request for project='%s' at location='%s'",
            request.project.name,
            request.project.location,
        )
        result = audit_service.audit_project(request)
        return result
    except Exception as e:
        logger.exception("Audit request failed for project='%s'", request.project.name)
        raise HTTPException(status_code=500, detail=f"Audit failed: {str(e)}")


@router.post("/stream")
async def audit_project_stream(request: AuditRequest):
    """Stream audit progress and agent activity as SSE events."""

    def event_stream():
        try:
            logger.info(
                "Received streaming audit request for project='%s' at location='%s'",
                request.project.name,
                request.project.location,
            )
            for payload in audit_service.stream_audit_events(request):
                event_name = payload.get("event", "message")
                data = json.dumps(payload, ensure_ascii=False)
                yield f"event: {event_name}\n"
                yield f"data: {data}\n\n"
        except Exception as e:
            logger.exception(
                "Streaming audit request failed for project='%s'",
                request.project.name,
            )
            error_payload = json.dumps(
                {
                    "event": "error",
                    "detail": f"Audit failed: {str(e)}",
                },
                ensure_ascii=False,
            )
            yield "event: error\n"
            yield f"data: {error_payload}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.get("/health")
async def health_check():
    """Health check for the audit service"""
    return {"status": "healthy", "service": "project-audit"}
