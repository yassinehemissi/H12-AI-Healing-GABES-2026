import logging

from fastapi import APIRouter, HTTPException
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


@router.get("/health")
async def health_check():
    """Health check for the audit service"""
    return {"status": "healthy", "service": "project-audit"}
