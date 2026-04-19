from typing import List, Dict, Any, Tuple

from .models import AgentReport, LawAnalysis, ProjectDetails, SourceReference
from .tavily_client import TavilyClient


class LawAgent:
    """Agent for legal analysis using Tunisia laws database"""

    def __init__(self):
        self.system_message = (
            "You are a Tunisia-focused environmental legal analyst. "
            "Assess compliance against Tunisian environmental, waste, industrial, "
            "and permitting obligations. Highlight legal gaps, risk severity, and "
            "practical corrective actions."
        )
        self.tavily = TavilyClient()

        # Initialize with Tunisia environmental and pollution laws
        self.tunisia_laws = {
            "environmental_protection": [
                "Law No. 88-91 of 2 August 1991 on the Protection of the Environment",
                "Decree No. 91-362 of 28 March 1991 on Environmental Impact Assessment",
                "Law No. 96-41 of 10 June 1996 on Waste Management",
            ],
            "industrial_pollution": [
                "Decree No. 2005-2371 of 11 October 2005 on Industrial Pollution Control",
                "Law No. 2001-65 of 10 July 2001 on Water Pollution Prevention",
            ],
            "chemical_substances": [
                "Decree No. 2004-722 of 25 March 2004 on Chemical Substances Management",
                "Law No. 94-109 of 26 July 1994 on Hazardous Materials Transport",
            ],
            "gabes_specific": [
                "Regional Development Plan for Gabes Governorate (2016-2020)",
                "Gabes Industrial Zone Environmental Regulations",
            ],
        }

    def analyze_project(self, project: ProjectDetails) -> LawAnalysis:
        """Analyze project for legal compliance"""

        relevant_laws = []
        violations = []
        recommendations = []

        # Analyze based on pollution type
        if "chemical" in project.pollution_type.lower():
            relevant_laws.extend(self.tunisia_laws["chemical_substances"])
            relevant_laws.extend(self.tunisia_laws["industrial_pollution"])

            if "waste" in project.description.lower():
                relevant_laws.extend(self.tunisia_laws["environmental_protection"])

        elif "industrial" in project.pollution_type.lower():
            relevant_laws.extend(self.tunisia_laws["industrial_pollution"])
            relevant_laws.extend(self.tunisia_laws["environmental_protection"])

        elif "waste" in project.pollution_type.lower():
            relevant_laws.extend(self.tunisia_laws["environmental_protection"])

        # Gabes-specific considerations
        if "gabes" in project.location.lower():
            relevant_laws.extend(self.tunisia_laws["gabes_specific"])

        # Check for potential violations
        if not any(
            "impact assessment" in desc.lower() for desc in [project.description]
        ):
            violations.append("Environmental Impact Assessment may be required")
            recommendations.append(
                "Conduct comprehensive Environmental Impact Assessment"
            )

        if (
            project.estimated_budget and project.estimated_budget > 5000000
        ):  # 5M TND threshold
            recommendations.append(
                "Large-scale project requires additional regulatory approvals"
            )

        # Determine compliance status and risk level
        compliance_status = "compliant" if len(violations) == 0 else "requires_review"
        risk_level = (
            "low"
            if len(violations) <= 1
            else "medium"
            if len(violations) <= 3
            else "high"
        )

        # Add general recommendations
        recommendations.extend(
            [
                "Ensure compliance with Tunisian environmental standards",
                "Regular monitoring and reporting requirements",
                "Stakeholder consultation as per environmental regulations",
            ]
        )

        return LawAnalysis(
            compliance_status=compliance_status,
            relevant_laws=relevant_laws,
            violations=violations,
            recommendations=recommendations,
            risk_level=risk_level,
        )

    def analyze_with_report(self, project: ProjectDetails) -> Tuple[LawAnalysis, AgentReport]:
        analysis = self.analyze_project(project)
        external_sources = self.tavily.search(
            (
                f"Tunisia environmental law Gabes {project.pollution_type} "
                f"permitting impact assessment waste management"
            ),
            max_results=4,
        )
        sources = [
            SourceReference(
                title=item.get("title", "Source"),
                url=item.get("url", ""),
                snippet=item.get("snippet", ""),
            )
            for item in external_sources
        ]

        report = AgentReport(
            agent="law",
            system_message=self.system_message,
            executive_summary=(
                f"Legal assessment indicates {analysis.compliance_status} status "
                f"with {analysis.risk_level} risk for Tunisian compliance."
            ),
            findings=[
                f"Relevant Tunisian legal instruments identified: {len(analysis.relevant_laws)}",
                f"Potential violations flagged: {len(analysis.violations)}",
                f"Project location legal context: {project.location}",
            ],
            assumptions=[
                "Final legal determination requires official permitting dossier.",
                "Project scope may require authority-specific approvals beyond baseline rules.",
            ],
            risks=analysis.violations or ["No immediate critical legal violation identified."],
            recommendations=analysis.recommendations[:6],
            confidence="high" if analysis.risk_level in {"low", "medium"} else "medium",
            sources=sources,
        )
        return analysis, report
