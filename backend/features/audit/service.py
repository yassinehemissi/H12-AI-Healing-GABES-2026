import logging
import os
from datetime import datetime
from typing import Any, Dict, Iterable, List

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from .game_theory_agent import GameTheoryAgent
from .law_agent import LawAgent
from .models import (
    AgentReport,
    AgentSummary,
    AuditRequest,
    AuditResult,
    GameTheoryAnalysis,
    LawAnalysis,
    ProjectDetails,
    ROIAnalysis,
    ScientificAnalysis,
)
from .roi_agent import ROIAgent
from .scientific_agent import ScientificAgent

logger = logging.getLogger(__name__)


class AuditService:
    """Conversation-aware audit orchestrator with streamable agent updates."""

    def __init__(self):
        self.llm = None
        self.llm_disabled = False

        self.law_agent = LawAgent()
        self.roi_agent = ROIAgent()
        self.game_theory_agent = GameTheoryAgent()
        self.scientific_agent = ScientificAgent()

    def _get_llm(self):
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
        llm = self._get_llm()
        if llm is None:
            return fallback_text
        try:
            return llm.invoke(messages).content
        except Exception:
            logger.exception("LLM invocation failed, using deterministic fallback")
            return fallback_text

    def audit_project(self, request: AuditRequest) -> AuditResult:
        result = self._run_orchestration(
            request=request,
            emit_event=None,
        )
        return result

    def stream_audit_events(self, request: AuditRequest) -> Iterable[Dict[str, Any]]:
        events: List[Dict[str, Any]] = []

        def emit(event: str, data: Dict[str, Any]):
            payload = {
                "event": event,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                **data,
            }
            events.append(payload)

        result = self._run_orchestration(request=request, emit_event=emit)
        emit(
            "final_summary",
            {
                "result": result.model_dump(mode="json"),
                "consulted_agents": result.consulted_agents,
                "intent": result.inquiry_intent,
            },
        )
        return events

    def _run_orchestration(self, request: AuditRequest, emit_event=None) -> AuditResult:
        normalized_project = self._normalize_project_inputs(request.project)
        inquiry = (request.inquiry or request.project.description or request.project.name).strip()
        if emit_event:
            emit_event(
                "node_started",
                {"node": "conversation_node", "label": "Understanding inquiry intent"},
            )
        intent, selected_agents = self._conversation_node(inquiry, request.conversation)
        if emit_event:
            emit_event(
                "node_completed",
                {
                    "node": "conversation_node",
                    "label": "Intent resolved",
                    "intent": intent,
                    "selected_agents": selected_agents,
                },
            )

        if emit_event:
            emit_event(
                "session_started",
                {"project": normalized_project.name, "analysis_depth": request.analysis_depth},
            )

        logger.info(
            "Starting orchestrated audit for project='%s', intent='%s', agents=%s",
            normalized_project.name,
            intent,
            selected_agents,
        )

        analyses: Dict[str, Any] = {}
        agent_outputs: Dict[str, AgentReport] = {}
        agent_summaries: List[AgentSummary] = []

        for agent in selected_agents:
            node_name = f"run_{agent}_analysis"
            node_label = f"Consulting {agent.replace('_', ' ').title()} Agent"
            if emit_event:
                emit_event("node_started", {"node": node_name, "label": node_label})

            analysis_key = f"{agent}_analysis"
            analysis, report = self._run_agent_node(agent, normalized_project)
            analyses[analysis_key] = analysis
            agent_outputs[agent] = report
            agent_summaries.append(
                AgentSummary(
                    agent=report.agent,
                    executive_summary=report.executive_summary,
                    key_findings=report.findings[:3],
                    risks=report.risks[:3],
                    recommendations=report.recommendations[:3],
                    confidence=report.confidence,
                )
            )

            if emit_event:
                emit_event(
                    "node_completed",
                    {
                        "node": node_name,
                        "label": f"{agent.replace('_', ' ').title()} analysis complete",
                        "summary": report.model_dump(mode="json"),
                    },
                )

        if "law_analysis" not in analyses:
            analyses["law_analysis"] = self._default_law_analysis()
            agent_outputs.setdefault("law", self._not_consulted_agent_report("law"))
        if "roi_analysis" not in analyses:
            analyses["roi_analysis"] = self._default_roi_analysis()
            agent_outputs.setdefault("roi", self._not_consulted_agent_report("roi"))
        if "game_theory_analysis" not in analyses:
            analyses["game_theory_analysis"] = self._default_game_theory_analysis()
            agent_outputs.setdefault(
                "game_theory", self._not_consulted_agent_report("game_theory")
            )
        if "scientific_analysis" not in analyses:
            analyses["scientific_analysis"] = self._default_scientific_analysis()
            agent_outputs.setdefault(
                "scientific", self._not_consulted_agent_report("scientific")
            )

        if emit_event:
            emit_event(
                "node_started",
                {"node": "coordination_node", "label": "Synthesizing cross-agent findings"},
            )

        coordination_assessment = self._coordination_node(normalized_project, analyses)
        if emit_event:
            emit_event(
                "node_completed",
                {"node": "coordination_node", "label": "Synthesis complete"},
            )

        final_state = {
            "project": normalized_project,
            "law_analysis": analyses["law_analysis"],
            "roi_analysis": analyses["roi_analysis"],
            "game_theory_analysis": analyses["game_theory_analysis"],
            "scientific_analysis": analyses["scientific_analysis"],
            "coordination_assessment": coordination_assessment,
        }

        overall_score, overall_risk, executive_summary, priority_actions = self._generate_overall_assessment(
            final_state, inquiry=inquiry, intent=intent
        )

        return AuditResult(
            project_name=normalized_project.name,
            law_analysis=final_state["law_analysis"],
            roi_analysis=final_state["roi_analysis"],
            game_theory_analysis=final_state["game_theory_analysis"],
            scientific_analysis=final_state["scientific_analysis"],
            consulted_agents=selected_agents,
            inquiry_intent=intent,
            agent_summaries=agent_summaries,
            agent_outputs=agent_outputs,
            overall_score=overall_score,
            overall_risk_level=overall_risk,
            executive_summary=executive_summary,
            priority_actions=priority_actions,
        )

    def _conversation_node(self, inquiry: str, conversation: List[Dict[str, str]]) -> tuple[str, List[str]]:
        """Classify inquiry intent and choose relevant agents."""
        history_text = " ".join(turn.get("content", "") for turn in conversation[-6:]).lower()
        text = f"{inquiry} {history_text}".lower()

        intent = "comprehensive"
        agents: List[str] = []

        if any(token in text for token in ["law", "legal", "regulation", "compliance"]):
            agents.append("law")
            intent = "legal_compliance"

        if any(token in text for token in ["roi", "budget", "financial", "cost", "profit", "npv", "irr"]):
            agents.append("roi")
            intent = "financial_viability" if intent == "comprehensive" else intent

        if any(token in text for token in ["stakeholder", "game", "negotiation", "conflict", "coalition"]):
            agents.append("game_theory")
            intent = "stakeholder_dynamics" if intent == "comprehensive" else intent

        if any(token in text for token in ["science", "technical", "technology", "feasibility", "infrastructure"]):
            agents.append("scientific")
            intent = "technical_feasibility" if intent == "comprehensive" else intent

        if any(token in text for token in ["audit", "analyze", "review", "overall", "full", "comprehensive"]):
            agents = ["law", "roi", "game_theory", "scientific"]
            intent = "comprehensive"

        if not agents:
            agents = ["law", "roi", "scientific"]
            intent = "targeted"

        # Keep order stable for UI timeline.
        ordered = [a for a in ["law", "roi", "game_theory", "scientific"] if a in agents]
        return intent, ordered

    def _coordination_node(self, project: ProjectDetails, analyses: Dict[str, Any]) -> str:
        prompt = f"""
        Synthesize this audit for project '{project.name}' in Gabes.
        Law: {analyses['law_analysis'].compliance_status} / risk {analyses['law_analysis'].risk_level}
        ROI: NPV={analyses['roi_analysis'].npv:.0f}, IRR={analyses['roi_analysis'].irr:.1%}, score={analyses['roi_analysis'].profitability_score:.1f}
        Game theory strategy: {analyses['game_theory_analysis'].optimal_strategy}
        Scientific feasibility: {analyses['scientific_analysis'].technology_feasibility}
        Provide 3-4 sentences with decisive recommendations.
        """

        messages = [
            SystemMessage(content="You are an audit orchestration lead."),
            HumanMessage(content=prompt),
        ]
        return self._safe_llm_invoke(
            messages,
            "Cross-agent synthesis indicates conditional viability if legal controls and stakeholder alignment are enforced early, with phased technical deployment and ROI monitoring gates.",
        )

    def _run_agent_node(
        self, agent: str, project: ProjectDetails
    ) -> tuple[LawAnalysis | ROIAnalysis | GameTheoryAnalysis | ScientificAnalysis, AgentReport]:
        try:
            if agent == "law":
                return self.law_agent.analyze_with_report(project)
            if agent == "roi":
                return self.roi_agent.analyze_with_report(project)
            if agent == "game_theory":
                return self.game_theory_agent.analyze_with_report(project)
            if agent == "scientific":
                return self.scientific_agent.analyze_with_report(project)
        except Exception:
            logger.exception("Agent node '%s' failed. Using fallback output.", agent)

        if agent == "law":
            analysis = self._default_law_analysis()
        elif agent == "roi":
            analysis = self._default_roi_analysis()
        elif agent == "game_theory":
            analysis = self._default_game_theory_analysis()
        else:
            analysis = self._default_scientific_analysis()
        return analysis, self._default_agent_report(agent)

    def _default_agent_report(self, agent: str) -> AgentReport:
        return AgentReport(
            agent=agent,
            system_message="Fallback agent execution due to runtime failure.",
            executive_summary=f"{agent.replace('_', ' ').title()} analysis returned fallback output.",
            findings=["Primary agent pipeline failed; deterministic fallback was used."],
            assumptions=["Output confidence is reduced due to degraded execution mode."],
            risks=["Possible loss of fidelity in domain-specific recommendations."],
            recommendations=["Retry analysis after reviewing backend logs and dependencies."],
            confidence="low",
            sources=[],
        )

    def _not_consulted_agent_report(self, agent: str) -> AgentReport:
        return AgentReport(
            agent=agent,
            system_message="Agent intentionally skipped based on inquiry routing.",
            executive_summary=(
                f"{agent.replace('_', ' ').title()} node was not consulted for this inquiry."
            ),
            findings=["Routing optimized execution for user intent and latency."],
            assumptions=["Run a comprehensive audit to include this agent."],
            risks=[],
            recommendations=["Request full audit to include all agent domains."],
            confidence="medium",
            sources=[],
        )

    def _default_law_analysis(self) -> LawAnalysis:
        return LawAnalysis(
            compliance_status="requires_review",
            relevant_laws=[],
            violations=["Legal review not requested in this inquiry."],
            recommendations=["Run legal/compliance analysis for complete risk coverage."],
            risk_level="medium",
        )

    def _default_roi_analysis(self) -> ROIAnalysis:
        return ROIAnalysis(
            npv=0.0,
            irr=0.0,
            payback_period_months=60,
            profitability_score=50.0,
            cost_benefit_ratio=1.0,
            risk_adjusted_roi=0.0,
            forecast_5year={"year_1": 0.0, "year_2": 0.0, "year_3": 0.0, "year_4": 0.0, "year_5": 0.0},
            recommendations=["Run ROI analysis for investment-grade financial guidance."],
        )

    def _default_game_theory_analysis(self) -> GameTheoryAnalysis:
        return GameTheoryAnalysis(
            stakeholders=[],
            optimal_strategy="Targeted stakeholder mapping not requested",
            decision_matrix={},
            negotiation_points=["Stakeholder optimization not included in this run."],
            conflict_resolution=["Schedule dedicated stakeholder workshop if needed."],
            coalition_opportunities=[],
        )

    def _default_scientific_analysis(self) -> ScientificAnalysis:
        return ScientificAnalysis(
            technology_feasibility="unknown",
            infrastructure_compatibility="unknown",
            resource_availability={},
            technical_risks=["Technical feasibility review was not requested."],
            innovation_potential=50.0,
            scalability_assessment="unknown",
            recommendations=["Run scientific feasibility analysis for engineering confidence."],
        )

    def _normalize_project_inputs(self, project: ProjectDetails) -> ProjectDetails:
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
            timeline_months = 60

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

    def _generate_overall_assessment(
        self, state: Dict[str, Any], inquiry: str, intent: str
    ) -> tuple[float, str, str, list]:
        law_score = {"compliant": 80, "requires_review": 60, "non_compliant": 30}.get(
            state["law_analysis"].compliance_status, 50
        )
        roi_score = min(100, max(0, state["roi_analysis"].profitability_score))
        scientific_score = {"high": 90, "medium": 70, "low": 40, "unknown": 50}.get(
            state["scientific_analysis"].technology_feasibility, 50
        )

        stakeholder_count = len(state["game_theory_analysis"].stakeholders)
        stakeholder_score = max(30, 100 - (stakeholder_count * 5))

        weights = {"law": 0.25, "roi": 0.30, "scientific": 0.25, "stakeholder": 0.20}
        overall_score = (
            law_score * weights["law"]
            + roi_score * weights["roi"]
            + scientific_score * weights["scientific"]
            + stakeholder_score * weights["stakeholder"]
        )

        if overall_score >= 75:
            overall_risk = "low"
        elif overall_score >= 50:
            overall_risk = "medium"
        else:
            overall_risk = "high"

        summary_prompt = f"""
        You are preparing an executive audit update.
        User inquiry: {inquiry}
        Intent classification: {intent}
        Project: {state['project'].name}
        Overall score: {overall_score:.1f}/100, risk: {overall_risk}
        Coordination: {state['coordination_assessment']}
        Financial: NPV {state['roi_analysis'].npv:,.0f} TND, IRR {state['roi_analysis'].irr:.1%}
        Legal: {state['law_analysis'].compliance_status} ({state['law_analysis'].risk_level})
        Technical: {state['scientific_analysis'].technology_feasibility}
        Output 3-5 concise sentences focused on the user's intent.
        """

        executive_summary = self._safe_llm_invoke(
            [
                SystemMessage(content="You are a concise executive audit writer."),
                HumanMessage(content=summary_prompt),
            ],
            (
                f"For the inquiry '{inquiry}', the project scores {overall_score:.1f}/100 with {overall_risk} risk. "
                f"Legal status is {state['law_analysis'].compliance_status}, financial viability shows NPV {state['roi_analysis'].npv:,.0f} TND and IRR {state['roi_analysis'].irr:.1%}, "
                f"and technical feasibility is {state['scientific_analysis'].technology_feasibility}. "
                f"Primary next step is phased execution with gated compliance, funding, and technical milestones."
            ),
        )

        priority_actions = self._generate_priority_actions(state, overall_risk)
        return overall_score, overall_risk, executive_summary, priority_actions

    def _generate_priority_actions(self, state: Dict[str, Any], overall_risk: str) -> list:
        actions = []

        if state["law_analysis"].risk_level == "high":
            actions.append("Address critical legal compliance issues immediately.")

        if state["roi_analysis"].npv < 0:
            actions.append("Rework project economics and identify cost-reduction levers.")

        if state["scientific_analysis"].technology_feasibility == "low":
            actions.append("Run a technology feasibility pilot before full-scale rollout.")

        if len(state["game_theory_analysis"].negotiation_points) > 3:
            actions.append("Launch structured stakeholder negotiations with clear concessions.")

        if overall_risk == "high":
            actions.insert(0, "Immediate executive review required: high aggregate project risk.")
        elif overall_risk == "medium":
            actions.insert(0, "Proceed with risk controls and a stage-gate governance plan.")

        actions.extend(
            [
                "Establish KPI monitoring for legal, financial, and technical outcomes.",
                "Publish a milestone timeline with decision gates and owners.",
            ]
        )
        return actions[:6]
