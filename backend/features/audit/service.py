import logging
import os
from typing import Any, Dict, TypedDict
from langgraph.graph import END, START, StateGraph
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from .models import (
    AuditRequest,
    AuditResult,
    LawAnalysis,
    ROIAnalysis,
    GameTheoryAnalysis,
    ScientificAnalysis,
    ProjectDetails,
)
from .law_agent import LawAgent
from .roi_agent import ROIAgent
from .game_theory_agent import GameTheoryAgent
from .scientific_agent import ScientificAgent

logger = logging.getLogger(__name__)


class AuditService:
    """Main service coordinating the project audit workflow using LangGraph"""

    def __init__(self):
        self.llm = None  # Lazy-loaded to avoid API key requirement during import
        self.llm_disabled = False

        # Initialize sub-agents
        self.law_agent = LawAgent()
        self.roi_agent = ROIAgent()
        self.game_theory_agent = GameTheoryAgent()
        self.scientific_agent = ScientificAgent()

        # Build the audit workflow graph
        self.workflow = self._build_workflow()

    def _get_llm(self):
        """Lazy load the LLM to avoid API key requirement during import"""
        if self.llm_disabled:
            return None

        if not os.getenv("OPENAI_API_KEY"):
            logger.warning(
                "OPENAI_API_KEY not set. LLM synthesis disabled; using deterministic fallbacks."
            )
            self.llm_disabled = True
            return None

        if self.llm is None:
            try:
                self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1)
            except Exception:
                logger.exception(
                    "Failed to initialize ChatOpenAI. Falling back to deterministic summaries."
                )
                self.llm_disabled = True
                return None
        return self.llm

    def _safe_llm_invoke(self, messages: list, fallback_text: str) -> str:
        """Invoke LLM with a deterministic fallback to keep API responses stable."""
        llm = self._get_llm()
        if llm is None:
            return fallback_text
        try:
            return llm.invoke(messages).content
        except Exception:
            logger.exception("LLM invocation failed, using deterministic fallback")
            return fallback_text

    def audit_project(self, request: AuditRequest) -> AuditResult:
        """Execute the complete project audit workflow"""
        normalized_project = self._normalize_project_inputs(request.project)
        logger.info(
            "Starting audit workflow for project='%s', depth='%s'",
            normalized_project.name,
            request.analysis_depth,
        )
        initial_state = {
            "project": normalized_project,
            "analysis_depth": request.analysis_depth,
            "law_analysis": None,
            "roi_analysis": None,
            "game_theory_analysis": None,
            "scientific_analysis": None,
            "overall_assessment": None,
            "coordination_assessment": "",
        }

        # Execute the workflow
        final_state = self.workflow.invoke(initial_state)
        logger.info(
            "Workflow completed for project='%s' (law=%s, roi=%s, game=%s, scientific=%s)",
            request.project.name,
            bool(final_state.get("law_analysis")),
            bool(final_state.get("roi_analysis")),
            bool(final_state.get("game_theory_analysis")),
            bool(final_state.get("scientific_analysis")),
        )

        # Generate final assessment
        overall_score, overall_risk, executive_summary, priority_actions = (
            self._generate_overall_assessment(final_state)
        )

        return AuditResult(
            project_name=final_state["project"].name,
            law_analysis=final_state["law_analysis"],
            roi_analysis=final_state["roi_analysis"],
            game_theory_analysis=final_state["game_theory_analysis"],
            scientific_analysis=final_state["scientific_analysis"],
            overall_score=overall_score,
            overall_risk_level=overall_risk,
            executive_summary=executive_summary,
            priority_actions=priority_actions,
        )

    def _normalize_project_inputs(self, project: ProjectDetails) -> ProjectDetails:
        """Infer missing project attributes to avoid under-informed agent outputs."""
        description = project.description or ""
        lowered = f"{project.name} {description}".lower()

        pollution_type = project.pollution_type
        if "phosphogypsum" in lowered:
            pollution_type = "waste"
        elif pollution_type == "industrial":
            if "chemical" in lowered:
                pollution_type = "chemical"
            elif "water" in lowered or "wastewater" in lowered:
                pollution_type = "water"
            elif "waste" in lowered or "recycling" in lowered:
                pollution_type = "waste"

        technologies = list(project.technologies or [])
        inferred_tech: list[str] = []
        if "recycling" in lowered or "phosphogypsum" in lowered or "waste" in lowered:
            inferred_tech.extend(["waste_treatment", "material_recycling"])
        if "water" in lowered or "wastewater" in lowered or "purification" in lowered:
            inferred_tech.append("water_purification")
        if "chemical" in lowered:
            inferred_tech.append("chemical_processing")
        if "monitoring" in lowered or "sensor" in lowered or "air quality" in lowered:
            inferred_tech.append("air_quality_monitoring")

        seen = set(technologies)
        for tech in inferred_tech:
            if tech not in seen:
                technologies.append(tech)
                seen.add(tech)

        timeline_months = project.timeline_months
        if timeline_months is None:
            timeline_months = 60  # 5-year baseline for infra/environment projects

        estimated_budget = project.estimated_budget
        if estimated_budget is None:
            budget_defaults = {
                "chemical": 2_500_000,
                "industrial": 4_000_000,
                "waste": 2_200_000,
                "water": 3_000_000,
            }
            estimated_budget = budget_defaults.get(pollution_type, 2_500_000)

        location = project.location
        if "industrial zone" in lowered and "industrial zone" not in location.lower():
            location = "Gabes Industrial Zone"

        return project.model_copy(
            update={
                "pollution_type": pollution_type,
                "technologies": technologies,
                "timeline_months": timeline_months,
                "estimated_budget": estimated_budget,
                "location": location,
            }
        )

    def _build_workflow(self) -> StateGraph:
        """Build the LangGraph workflow for audit coordination"""

        class AuditState(TypedDict):
            project: Any
            analysis_depth: str
            law_analysis: Any
            roi_analysis: Any
            game_theory_analysis: Any
            scientific_analysis: Any
            overall_assessment: Any
            coordination_assessment: str

        def law_analysis_node(state: AuditState) -> Dict[str, Any]:
            """Execute law analysis"""
            logger.info("Running law analysis for project='%s'", state["project"].name)
            analysis = self.law_agent.analyze_project(state["project"])
            return {"law_analysis": analysis}

        def roi_analysis_node(state: AuditState) -> Dict[str, Any]:
            """Execute ROI analysis"""
            logger.info("Running ROI analysis for project='%s'", state["project"].name)
            analysis = self.roi_agent.analyze_project(state["project"])
            return {"roi_analysis": analysis}

        def game_theory_analysis_node(state: AuditState) -> Dict[str, Any]:
            """Execute game theory analysis"""
            logger.info(
                "Running game theory analysis for project='%s'",
                state["project"].name,
            )
            analysis = self.game_theory_agent.analyze_project(state["project"])
            return {"game_theory_analysis": analysis}

        def scientific_analysis_node(state: AuditState) -> Dict[str, Any]:
            """Execute scientific analysis"""
            logger.info(
                "Running scientific analysis for project='%s'",
                state["project"].name,
            )
            analysis = self.scientific_agent.analyze_project(state["project"])
            return {"scientific_analysis": analysis}

        def coordination_node(state: AuditState) -> Dict[str, Any]:
            """Coordinate and synthesize analysis results"""
            logger.info("Running coordination synthesis for project='%s'", state["project"].name)
            # Use LLM to coordinate findings and identify synergies/conflicts
            coordination_prompt = f"""
            Analyze the following project audit results and identify key insights, conflicts, and synergies:

            Project: {state["project"].name}
            Description: {state["project"].description}

            Law Analysis: {state["law_analysis"].compliance_status} (Risk: {state["law_analysis"].risk_level})
            Key legal issues: {", ".join(state["law_analysis"].violations[:3])}

            ROI Analysis: NPV={state["roi_analysis"].npv:.0f} TND, IRR={state["roi_analysis"].irr:.1%}
            Financial viability: {"Good" if state["roi_analysis"].irr > 0.08 else "Concerning"}

            Stakeholder Analysis: {len(state["game_theory_analysis"].stakeholders)} stakeholders identified
            Recommended strategy: {state["game_theory_analysis"].optimal_strategy}

            Technical Feasibility: {state["scientific_analysis"].technology_feasibility}
            Infrastructure compatibility: {state["scientific_analysis"].infrastructure_compatibility}

            Provide a brief coordination assessment highlighting the most critical findings and interdependencies.
            """

            messages = [
                SystemMessage(
                    content="You are a project audit coordinator synthesizing multiple analyses."
                ),
                HumanMessage(content=coordination_prompt),
            ]

            coordination_result = self._safe_llm_invoke(
                messages,
                "Cross-analysis summary: legal compliance needs review, financial viability is moderate-to-high depending on implementation controls, and stakeholder engagement is a critical success factor. Prioritize risk mitigation and phased execution.",
            )
            return {"coordination_assessment": coordination_result}

        # Build the graph
        workflow = StateGraph(AuditState)

        # Add nodes
        workflow.add_node("run_law_analysis", law_analysis_node)
        workflow.add_node("run_roi_analysis", roi_analysis_node)
        workflow.add_node("run_game_theory_analysis", game_theory_analysis_node)
        workflow.add_node("run_scientific_analysis", scientific_analysis_node)
        workflow.add_node("coordination", coordination_node)

        # Define execution flow - parallel analysis then coordination
        workflow.add_edge(START, "run_law_analysis")
        workflow.add_edge(START, "run_roi_analysis")
        workflow.add_edge(START, "run_game_theory_analysis")
        workflow.add_edge(START, "run_scientific_analysis")

        # All analyses complete before coordination
        workflow.add_edge("run_law_analysis", "coordination")
        workflow.add_edge("run_roi_analysis", "coordination")
        workflow.add_edge("run_game_theory_analysis", "coordination")
        workflow.add_edge("run_scientific_analysis", "coordination")

        # End after coordination
        workflow.add_edge("coordination", END)

        return workflow.compile()

    def _generate_overall_assessment(
        self, state: Dict[str, Any]
    ) -> tuple[float, str, str, list]:
        """Generate overall project assessment"""

        # Calculate overall score (0-100) based on weighted factors
        law_score = {"compliant": 80, "requires_review": 60, "non_compliant": 30}.get(
            state["law_analysis"].compliance_status, 50
        )

        roi_score = min(100, max(0, state["roi_analysis"].profitability_score))

        scientific_score = {"high": 90, "medium": 70, "low": 40, "unknown": 50}.get(
            state["scientific_analysis"].technology_feasibility, 50
        )

        # Stakeholder complexity affects score
        stakeholder_count = len(state["game_theory_analysis"].stakeholders)
        stakeholder_score = max(
            30, 100 - (stakeholder_count * 5)
        )  # Fewer stakeholders = higher score

        # Weighted overall score
        weights = {"law": 0.25, "roi": 0.30, "scientific": 0.25, "stakeholder": 0.20}
        overall_score = (
            law_score * weights["law"]
            + roi_score * weights["roi"]
            + scientific_score * weights["scientific"]
            + stakeholder_score * weights["stakeholder"]
        )

        # Determine overall risk level
        if overall_score >= 75:
            overall_risk = "low"
        elif overall_score >= 50:
            overall_risk = "medium"
        else:
            overall_risk = "high"

        # Generate executive summary using LLM
        summary_prompt = f"""
        Create a concise executive summary for this pollution control project audit in Gabes, Tunisia:

        Project: {state["project"].name}
        Overall Score: {overall_score:.1f}/100
        Risk Level: {overall_risk}

        Key Findings:
        - Legal: {state["law_analysis"].compliance_status} ({state["law_analysis"].risk_level} risk)
        - Financial: NPV {state["roi_analysis"].npv:,.0f} TND, IRR {state["roi_analysis"].irr:.1%}
        - Technical: {state["scientific_analysis"].technology_feasibility} feasibility
        - Stakeholders: {state["game_theory_analysis"].optimal_strategy}

        Write a 2-3 sentence executive summary highlighting the most critical aspects.
        """

        messages = [
            SystemMessage(content="You are a project audit executive summarizer."),
            HumanMessage(content=summary_prompt),
        ]

        executive_summary = self._safe_llm_invoke(
            messages,
            f"{state['project'].name} is assessed at {overall_score:.1f}/100 with {overall_risk} risk. Legal compliance requires close review, financial metrics indicate conditional viability, and technical feasibility should be validated through phased implementation.",
        )

        # Generate priority actions
        priority_actions = self._generate_priority_actions(
            state, overall_score, overall_risk
        )

        return overall_score, overall_risk, executive_summary, priority_actions

    def _generate_priority_actions(
        self, state: Dict[str, Any], overall_score: float, overall_risk: str
    ) -> list:
        """Generate priority actions based on analysis results"""

        actions = []

        # Law-related actions
        if state["law_analysis"].risk_level == "high":
            actions.append("Address critical legal compliance issues immediately")

        # Financial actions
        if state["roi_analysis"].npv < 0:
            actions.append(
                "Reevaluate project economics and seek cost reduction strategies"
            )

        # Technical actions
        if state["scientific_analysis"].technology_feasibility == "low":
            actions.append(
                "Conduct technology feasibility study and consider alternatives"
            )

        # Stakeholder actions
        if len(state["game_theory_analysis"].negotiation_points) > 3:
            actions.append("Develop comprehensive stakeholder engagement plan")

        # Overall risk-based actions
        if overall_risk == "high":
            actions.insert(0, "Immediate executive review required - high risk project")
        elif overall_risk == "medium":
            actions.insert(0, "Conduct detailed risk assessment before proceeding")

        # Always include some standard actions
        actions.extend(
            [
                "Establish project monitoring and evaluation framework",
                "Develop detailed implementation timeline with milestones",
            ]
        )

        return actions[:5]  # Limit to top 5 priority actions
