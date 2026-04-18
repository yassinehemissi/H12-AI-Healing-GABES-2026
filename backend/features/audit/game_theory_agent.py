from typing import List, Dict, Any
from .models import ProjectDetails, GameTheoryAnalysis


class GameTheoryAgent:
    """Agent for game theory analysis of project stakeholders and decision optimization"""

    def __init__(self):
        self.stakeholder_types = {
            "government": {"power": 0.9, "interest": 0.8, "influence": "high"},
            "local_community": {"power": 0.6, "interest": 0.9, "influence": "medium"},
            "industry": {"power": 0.7, "interest": 0.5, "influence": "high"},
            "environmental_ngos": {
                "power": 0.4,
                "interest": 1.0,
                "influence": "medium",
            },
            "investors": {"power": 0.8, "interest": 0.6, "influence": "high"},
            "technical_experts": {"power": 0.5, "interest": 0.7, "influence": "medium"},
        }

    def analyze_project(self, project: ProjectDetails) -> GameTheoryAnalysis:
        """Analyze project stakeholders using game theory principles"""

        # Identify and analyze stakeholders
        stakeholders = self._identify_stakeholders(project)

        # Build decision matrix
        decision_matrix = self._build_decision_matrix(stakeholders, project)

        # Determine optimal strategy
        optimal_strategy = self._determine_optimal_strategy(
            decision_matrix, stakeholders
        )

        # Identify negotiation points
        negotiation_points = self._identify_negotiation_points(stakeholders, project)

        # Suggest conflict resolution strategies
        conflict_resolution = self._suggest_conflict_resolution(stakeholders)

        # Identify coalition opportunities
        coalition_opportunities = self._identify_coalitions(stakeholders)

        return GameTheoryAnalysis(
            stakeholders=stakeholders,
            optimal_strategy=optimal_strategy,
            decision_matrix=decision_matrix,
            negotiation_points=negotiation_points,
            conflict_resolution=conflict_resolution,
            coalition_opportunities=coalition_opportunities,
        )

    def _identify_stakeholders(self, project: ProjectDetails) -> List[Dict[str, Any]]:
        """Identify and analyze project stakeholders"""
        stakeholders = []

        # Add explicitly mentioned stakeholders
        for stakeholder_name in project.stakeholders:
            stakeholder_type = self._classify_stakeholder(stakeholder_name)
            stakeholder_info = self.stakeholder_types.get(
                stakeholder_type, {"power": 0.5, "interest": 0.5, "influence": "medium"}
            )
            stakeholders.append(
                {
                    "name": stakeholder_name,
                    "type": stakeholder_type,
                    "power": stakeholder_info["power"],
                    "interest": stakeholder_info["interest"],
                    "influence": stakeholder_info["influence"],
                    "position": self._assess_position(stakeholder_name, project),
                    "potential_conflicts": self._identify_potential_conflicts(
                        stakeholder_name, project
                    ),
                }
            )

        # Add common stakeholders for Gabes pollution projects
        common_stakeholders = [
            "Gabes Governorate",
            "Ministry of Environment",
            "Local Communities",
            "Industrial Companies",
            "Environmental NGOs",
            "Technical Experts",
        ]

        for stakeholder_name in common_stakeholders:
            if stakeholder_name not in project.stakeholders:
                stakeholder_type = self._classify_stakeholder(stakeholder_name)
                stakeholder_info = self.stakeholder_types.get(
                    stakeholder_type,
                    {"power": 0.5, "interest": 0.5, "influence": "medium"},
                )
                stakeholders.append(
                    {
                        "name": stakeholder_name,
                        "type": stakeholder_type,
                        "power": stakeholder_info["power"],
                        "interest": stakeholder_info["interest"],
                        "influence": stakeholder_info["influence"],
                        "position": self._assess_position(stakeholder_name, project),
                        "potential_conflicts": self._identify_potential_conflicts(
                            stakeholder_name, project
                        ),
                    }
                )

        return stakeholders

    def _classify_stakeholder(self, name: str) -> str:
        """Classify stakeholder type based on name"""
        name_lower = name.lower()

        if any(
            term in name_lower
            for term in ["government", "ministry", "governorate", "authority"]
        ):
            return "government"
        elif any(
            term in name_lower
            for term in ["community", "local", "residents", "citizens"]
        ):
            return "local_community"
        elif any(
            term in name_lower
            for term in ["industry", "company", "factory", "industrial"]
        ):
            return "industry"
        elif any(
            term in name_lower
            for term in ["ngo", "association", "environmental", "green"]
        ):
            return "environmental_ngos"
        elif any(
            term in name_lower for term in ["investor", "funding", "bank", "finance"]
        ):
            return "investors"
        elif any(
            term in name_lower
            for term in ["expert", "consultant", "technical", "engineer"]
        ):
            return "technical_experts"

        return "other"

    def _assess_position(self, name: str, project: ProjectDetails) -> str:
        """Assess stakeholder position toward the project"""
        name_lower = name.lower()

        # Environmental stakeholders likely supportive of pollution control
        if any(
            term in name_lower for term in ["environment", "ngo", "green", "community"]
        ):
            return "supportive"

        # Industrial stakeholders may be resistant
        if any(term in name_lower for term in ["industry", "company", "factory"]):
            return "resistant"

        # Government entities generally supportive but cautious
        if any(term in name_lower for term in ["government", "ministry", "authority"]):
            return "cautious_support"

        return "neutral"

    def _identify_potential_conflicts(
        self, name: str, project: ProjectDetails
    ) -> List[str]:
        """Identify potential conflicts with stakeholder"""
        conflicts = []
        name_lower = name.lower()

        if any(term in name_lower for term in ["industry", "company"]):
            conflicts.extend(
                [
                    "Economic impact on operations",
                    "Potential job losses",
                    "Increased operational costs",
                ]
            )

        if any(term in name_lower for term in ["community", "local"]):
            conflicts.extend(
                [
                    "Health and safety concerns",
                    "Property value impacts",
                    "Community displacement",
                ]
            )

        if any(term in name_lower for term in ["environment", "ngo"]):
            # NGOs usually align with project goals
            pass

        return conflicts

    def _build_decision_matrix(
        self, stakeholders: List[Dict[str, Any]], project: ProjectDetails
    ) -> Dict[str, Any]:
        """Build decision matrix for stakeholder analysis"""
        strategies = [
            "collaborative_approach",
            "regulatory_enforcement",
            "incentives_based",
            "phased_implementation",
            "stakeholder_engagement",
        ]

        matrix = {}

        for strategy in strategies:
            strategy_scores = {}
            total_score = 0

            for stakeholder in stakeholders:
                score = self._calculate_strategy_score(strategy, stakeholder)
                strategy_scores[stakeholder["name"]] = score
                total_score += score * stakeholder["power"]  # Weight by power

            matrix[strategy] = {
                "individual_scores": strategy_scores,
                "total_weighted_score": total_score / len(stakeholders),
                "feasibility": self._assess_strategy_feasibility(strategy, project),
            }

        return matrix

    def _calculate_strategy_score(
        self, strategy: str, stakeholder: Dict[str, Any]
    ) -> float:
        """Calculate how well a strategy serves a stakeholder"""
        base_score = 0.5

        if strategy == "collaborative_approach":
            if stakeholder["position"] in ["supportive", "cautious_support"]:
                base_score += 0.3
            if stakeholder["type"] == "local_community":
                base_score += 0.2

        elif strategy == "regulatory_enforcement":
            if stakeholder["type"] == "government":
                base_score += 0.4
            elif stakeholder["type"] == "industry":
                base_score -= 0.3

        elif strategy == "incentives_based":
            if stakeholder["type"] == "industry":
                base_score += 0.3
            if stakeholder["position"] == "resistant":
                base_score += 0.2

        elif strategy == "phased_implementation":
            base_score += 0.1  # Generally acceptable compromise

        elif strategy == "stakeholder_engagement":
            if stakeholder["interest"] > 0.7:
                base_score += 0.3

        return max(0, min(1, base_score))

    def _assess_strategy_feasibility(
        self, strategy: str, project: ProjectDetails
    ) -> str:
        """Assess feasibility of strategy implementation"""
        if strategy == "collaborative_approach":
            return "high" if len(project.stakeholders) <= 5 else "medium"
        elif strategy == "regulatory_enforcement":
            return "high"
        elif strategy == "incentives_based":
            return "medium" if project.estimated_budget else "low"
        elif strategy == "phased_implementation":
            return "high"
        elif strategy == "stakeholder_engagement":
            return "high"

        return "medium"

    def _determine_optimal_strategy(
        self, decision_matrix: Dict[str, Any], stakeholders: List[Dict[str, Any]]
    ) -> str:
        """Determine the optimal strategy based on decision matrix"""
        best_strategy = None
        best_score = -1

        for strategy, data in decision_matrix.items():
            score = data["total_weighted_score"]
            feasibility_multiplier = {"high": 1.0, "medium": 0.8, "low": 0.6}.get(
                data["feasibility"], 0.8
            )
            adjusted_score = score * feasibility_multiplier

            if adjusted_score > best_score:
                best_score = adjusted_score
                best_strategy = strategy

        # Convert to readable format
        strategy_names = {
            "collaborative_approach": "Collaborative Multi-Stakeholder Approach",
            "regulatory_enforcement": "Regulatory Enforcement with Support",
            "incentives_based": "Incentives-Based Implementation",
            "phased_implementation": "Phased Implementation Strategy",
            "stakeholder_engagement": "Intensive Stakeholder Engagement",
        }

        return strategy_names.get(best_strategy, best_strategy)

    def _identify_negotiation_points(
        self, stakeholders: List[Dict[str, Any]], project: ProjectDetails
    ) -> List[str]:
        """Identify key negotiation points"""
        points = []

        # Budget and funding
        if project.estimated_budget:
            points.append(f"Funding allocation and cost sharing among stakeholders")

        # Timeline considerations
        if project.timeline_months:
            points.append(f"Project timeline flexibility and milestone agreements")

        # Technology choices
        if project.technologies:
            points.append(f"Technology selection and adaptation to local conditions")

        # Impact mitigation
        points.extend(
            [
                "Environmental impact mitigation measures",
                "Community benefit sharing agreements",
                "Monitoring and compliance oversight",
            ]
        )

        # Stakeholder-specific points
        resistant_stakeholders = [
            s for s in stakeholders if s["position"] == "resistant"
        ]
        if resistant_stakeholders:
            points.append(f"Compensation and transition support for affected parties")

        return points

    def _suggest_conflict_resolution(
        self, stakeholders: List[Dict[str, Any]]
    ) -> List[str]:
        """Suggest conflict resolution strategies"""
        strategies = [
            "Establish neutral mediation committee with government oversight",
            "Create stakeholder advisory board for ongoing input",
            "Develop transparent communication channels",
            "Implement regular progress reporting and feedback mechanisms",
        ]

        # Add specific strategies based on stakeholder types
        has_industry = any(s["type"] == "industry" for s in stakeholders)
        has_community = any(s["type"] == "local_community" for s in stakeholders)

        if has_industry and has_community:
            strategies.append("Facilitate industry-community dialogue sessions")

        if any(s["position"] == "resistant" for s in stakeholders):
            strategies.append("Develop mutually beneficial compromise solutions")

        return strategies

    def _identify_coalitions(self, stakeholders: List[Dict[str, Any]]) -> List[str]:
        """Identify potential coalition opportunities"""
        opportunities = []

        # Government + technical experts
        opportunities.append(
            "Government-Technical Expert Coalition for regulatory oversight"
        )

        # Environmental NGOs + Local Community
        opportunities.append(
            "Environmental-Community Coalition for monitoring and advocacy"
        )

        # Industry + Investors (if present)
        has_industry = any(s["type"] == "industry" for s in stakeholders)
        has_investors = any(s["type"] == "investors" for s in stakeholders)
        if has_industry and has_investors:
            opportunities.append(
                "Industry-Investor Coalition for funding and implementation"
            )

        # Cross-sector collaboration
        opportunities.append(
            "Multi-stakeholder coalition for long-term sustainability goals"
        )

        return opportunities
