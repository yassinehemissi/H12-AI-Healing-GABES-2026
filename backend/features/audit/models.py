from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime


class ProjectDetails(BaseModel):
    """Project details for audit"""

    name: str = Field(..., description="Project name")
    description: str = Field(..., description="Project description")
    location: str = Field(..., description="Project location in Gabes")
    pollution_type: str = Field(
        ..., description="Type of pollution (chemical, industrial, waste, etc.)"
    )
    estimated_budget: Optional[float] = Field(
        None, description="Estimated project budget in TND"
    )
    timeline_months: Optional[int] = Field(
        None, description="Project timeline in months"
    )
    stakeholders: List[str] = Field(
        default_factory=list, description="List of project stakeholders"
    )
    technologies: List[str] = Field(
        default_factory=list, description="Proposed technologies"
    )


class AuditRequest(BaseModel):
    """Request model for project audit"""

    project: ProjectDetails
    analysis_depth: str = Field(
        "comprehensive", description="Analysis depth: basic, standard, comprehensive"
    )


class LawAnalysis(BaseModel):
    """Legal analysis results"""

    compliance_status: str = Field(..., description="Overall compliance status")
    relevant_laws: List[str] = Field(
        default_factory=list, description="Relevant Tunisian laws"
    )
    violations: List[str] = Field(
        default_factory=list, description="Potential violations"
    )
    recommendations: List[str] = Field(
        default_factory=list, description="Legal recommendations"
    )
    risk_level: str = Field(..., description="Legal risk level: low, medium, high")


class ROIAnalysis(BaseModel):
    """Financial ROI analysis results"""

    npv: float = Field(..., description="Net Present Value")
    irr: float = Field(..., description="Internal Rate of Return")
    payback_period_months: int = Field(..., description="Payback period in months")
    profitability_score: float = Field(..., description="Profitability score (0-100)")
    cost_benefit_ratio: float = Field(..., description="Cost-benefit ratio")
    risk_adjusted_roi: float = Field(..., description="Risk-adjusted ROI")
    forecast_5year: Dict[str, float] = Field(
        default_factory=dict, description="5-year financial forecast"
    )
    recommendations: List[str] = Field(
        default_factory=list, description="Financial recommendations"
    )


class GameTheoryAnalysis(BaseModel):
    """Game theory stakeholder analysis"""

    stakeholders: List[Dict[str, Any]] = Field(
        default_factory=list, description="Stakeholder analysis"
    )
    optimal_strategy: str = Field(..., description="Recommended optimal strategy")
    decision_matrix: Dict[str, Any] = Field(
        default_factory=dict, description="Decision matrix analysis"
    )
    negotiation_points: List[str] = Field(
        default_factory=list, description="Key negotiation points"
    )
    conflict_resolution: List[str] = Field(
        default_factory=list, description="Conflict resolution strategies"
    )
    coalition_opportunities: List[str] = Field(
        default_factory=list, description="Potential coalition opportunities"
    )


class ScientificAnalysis(BaseModel):
    """Scientific and technical feasibility analysis"""

    technology_feasibility: str = Field(
        ..., description="Overall technology feasibility"
    )
    infrastructure_compatibility: str = Field(
        ..., description="Compatibility with Tunisian infrastructure"
    )
    resource_availability: Dict[str, bool] = Field(
        default_factory=dict, description="Resource availability assessment"
    )
    technical_risks: List[str] = Field(
        default_factory=list, description="Technical risks identified"
    )
    innovation_potential: float = Field(
        ..., description="Innovation potential score (0-100)"
    )
    scalability_assessment: str = Field(..., description="Scalability assessment")
    recommendations: List[str] = Field(
        default_factory=list, description="Technical recommendations"
    )


class AuditResult(BaseModel):
    """Complete audit result"""

    project_name: str
    audit_timestamp: datetime = Field(default_factory=datetime.now)
    overall_score: float = Field(..., description="Overall project score (0-100)")
    overall_risk_level: str = Field(
        ..., description="Overall risk level: low, medium, high"
    )
    law_analysis: LawAnalysis
    roi_analysis: ROIAnalysis
    game_theory_analysis: GameTheoryAnalysis
    scientific_analysis: ScientificAnalysis
    executive_summary: str = Field(..., description="Executive summary of findings")
    priority_actions: List[str] = Field(
        default_factory=list, description="Priority actions recommended"
    )
