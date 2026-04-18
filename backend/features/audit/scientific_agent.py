from typing import Dict, List
from .models import ProjectDetails, ScientificAnalysis


class ScientificAgent:
    """Agent for scientific and technical feasibility analysis"""

    def __init__(self):
        # Tunisian infrastructure capabilities
        self.infrastructure = {
            "power_grid": {
                "capacity": "adequate",
                "reliability": "moderate",
                "renewable_integration": "developing",
            },
            "water_systems": {
                "desalination": "limited",
                "treatment": "moderate",
                "distribution": "adequate",
            },
            "transportation": {
                "road_network": "good",
                "rail": "limited",
                "port_facilities": "excellent",
            },
            "digital_infrastructure": {
                "internet": "good",
                "data_centers": "developing",
                "iot_capability": "emerging",
            },
        }

        # Technology feasibility database
        self.technology_assessment = {
            "waste_treatment": {
                "feasibility": "high",
                "infrastructure_match": "good",
                "local_expertise": "available",
                "scalability": "high",
            },
            "chemical_processing": {
                "feasibility": "medium",
                "infrastructure_match": "moderate",
                "local_expertise": "limited",
                "scalability": "medium",
            },
            "water_purification": {
                "feasibility": "high",
                "infrastructure_match": "good",
                "local_expertise": "available",
                "scalability": "high",
            },
            "air_quality_monitoring": {
                "feasibility": "high",
                "infrastructure_match": "excellent",
                "local_expertise": "available",
                "scalability": "high",
            },
            "soil_remediation": {
                "feasibility": "medium",
                "infrastructure_match": "moderate",
                "local_expertise": "developing",
                "scalability": "medium",
            },
            "renewable_energy": {
                "feasibility": "high",
                "infrastructure_match": "good",
                "local_expertise": "growing",
                "scalability": "high",
            },
        }

    def analyze_project(self, project: ProjectDetails) -> ScientificAnalysis:
        """Analyze scientific and technical feasibility"""
        technologies = self._resolve_technologies(project)

        # Assess technology feasibility
        technology_feasibility = self._assess_technology_feasibility(technologies)

        # Assess infrastructure compatibility
        infrastructure_compatibility = self._assess_infrastructure_compatibility(
            project, technologies
        )

        # Assess resource availability
        resource_availability = self._assess_resource_availability(project)

        # Identify technical risks
        technical_risks = self._identify_technical_risks(project, technologies)

        # Calculate innovation potential
        innovation_potential = self._calculate_innovation_potential(project)

        # Assess scalability
        scalability_assessment = self._assess_scalability(technologies)

        # Generate recommendations
        recommendations = self._generate_technical_recommendations(
            technology_feasibility, infrastructure_compatibility, technical_risks
        )

        return ScientificAnalysis(
            technology_feasibility=technology_feasibility,
            infrastructure_compatibility=infrastructure_compatibility,
            resource_availability=resource_availability,
            technical_risks=technical_risks,
            innovation_potential=innovation_potential,
            scalability_assessment=scalability_assessment,
            recommendations=recommendations,
        )

    def _resolve_technologies(self, project: ProjectDetails) -> List[str]:
        """Resolve technologies from explicit input or infer from project context."""
        if project.technologies:
            return project.technologies

        lowered = f"{project.name} {project.description}".lower()
        inferred: List[str] = []
        if "recycling" in lowered or "phosphogypsum" in lowered or "waste" in lowered:
            inferred.extend(["waste_treatment", "material_recycling"])
        if "water" in lowered or "wastewater" in lowered:
            inferred.append("water_purification")
        if "chemical" in lowered:
            inferred.append("chemical_processing")
        if "monitoring" in lowered or "sensor" in lowered or "air quality" in lowered:
            inferred.append("air_quality_monitoring")
        return inferred

    def _assess_technology_feasibility(self, technologies: List[str]) -> str:
        """Assess overall technology feasibility"""
        if not technologies:
            return "unknown"

        feasibility_scores = {"high": 3, "medium": 2, "low": 1}

        total_score = 0
        tech_count = 0

        for tech in technologies:
            tech_lower = tech.lower()
            # Match technology to assessment database
            matched = False
            for tech_category, assessment in self.technology_assessment.items():
                if (
                    tech_category.replace("_", " ") in tech_lower
                    or tech_category in tech_lower
                ):
                    total_score += feasibility_scores.get(assessment["feasibility"], 2)
                    tech_count += 1
                    matched = True
                    break

            if not matched:
                # Default medium feasibility for unknown technologies
                total_score += 2
                tech_count += 1

        if tech_count == 0:
            return "unknown"

        avg_score = total_score / tech_count

        if avg_score >= 2.5:
            return "high"
        elif avg_score >= 1.5:
            return "medium"
        else:
            return "low"

    def _assess_infrastructure_compatibility(
        self, project: ProjectDetails, technologies: List[str]
    ) -> str:
        """Assess compatibility with Tunisian infrastructure"""

        compatibility_score = 0
        factors_count = 0

        # Check power requirements
        if any(
            "energy" in tech.lower() or "power" in tech.lower()
            for tech in technologies
        ):
            if (
                self.infrastructure["power_grid"]["renewable_integration"]
                == "developing"
            ):
                compatibility_score += 2  # Good potential
            else:
                compatibility_score += 3  # Excellent
            factors_count += 1

        # Check water requirements
        if any(
            "water" in tech.lower() or "purification" in tech.lower()
            for tech in technologies
        ):
            if self.infrastructure["water_systems"]["desalination"] == "limited":
                compatibility_score += 1  # Limited
            else:
                compatibility_score += 2  # Moderate
            factors_count += 1

        # Check transportation needs
        if project.location and "industrial" in project.location.lower():
            if self.infrastructure["transportation"]["road_network"] == "good":
                compatibility_score += 3  # Excellent
            else:
                compatibility_score += 2  # Good
            factors_count += 1

        # Digital infrastructure for monitoring systems
        if any(
            "monitoring" in tech.lower() or "sensor" in tech.lower()
            for tech in technologies
        ):
            if (
                self.infrastructure["digital_infrastructure"]["iot_capability"]
                == "emerging"
            ):
                compatibility_score += 2  # Developing
            else:
                compatibility_score += 3  # Good
            factors_count += 1

        if factors_count == 0:
            return "unknown"

        avg_score = compatibility_score / factors_count

        if avg_score >= 2.5:
            return "excellent"
        elif avg_score >= 1.8:
            return "good"
        elif avg_score >= 1.2:
            return "moderate"
        else:
            return "limited"

    def _assess_resource_availability(self, project: ProjectDetails) -> Dict[str, bool]:
        """Assess availability of required resources"""
        resources = {}

        # Technical expertise
        if "chemical" in project.pollution_type.lower():
            resources["chemical_engineers"] = False  # Limited in Gabes
        else:
            resources["environmental_engineers"] = True  # More available

        # Equipment and materials
        resources["specialized_equipment"] = True  # Can be imported
        resources["local_materials"] = True  # Generally available

        # Energy resources
        resources["electricity_supply"] = True  # Adequate in Gabes
        resources["alternative_energy"] = (
            self.infrastructure["power_grid"]["renewable_integration"] != "limited"
        )

        # Water resources (critical for Gabes)
        resources["water_access"] = (
            self.infrastructure["water_systems"]["distribution"] == "adequate"
        )

        # Transportation and logistics
        resources["logistics_support"] = (
            self.infrastructure["transportation"]["port_facilities"] == "excellent"
        )

        return resources

    def _identify_technical_risks(
        self, project: ProjectDetails, technologies: List[str]
    ) -> List[str]:
        """Identify technical risks"""
        risks = []

        # Pollution-specific risks
        if "chemical" in project.pollution_type.lower():
            risks.extend(
                [
                    "Hazardous material handling and safety protocols",
                    "Chemical reaction stability and containment",
                    "Long-term environmental monitoring requirements",
                ]
            )

        if "waste" in project.pollution_type.lower():
            risks.extend(
                [
                    "Waste composition variability",
                    "Treatment by-product management",
                    "Odor and noise pollution control",
                ]
            )

        # Infrastructure-related risks
        if self.infrastructure["power_grid"]["reliability"] == "moderate":
            risks.append("Power supply interruptions affecting operations")

        if self.infrastructure["water_systems"]["desalination"] == "limited":
            risks.append("Limited water desalination capacity for industrial processes")

        # Location-specific risks for Gabes
        if "gabes" in project.location.lower():
            risks.extend(
                [
                    "High salinity water affecting treatment processes",
                    "Industrial zone congestion and space constraints",
                    "Proximity to residential areas requiring safety measures",
                ]
            )

        # Technology maturity risks
        for tech in technologies:
            if "emerging" in tech.lower() or "new" in tech.lower():
                risks.append(f"Technology maturity and proven track record for {tech}")

        return risks

    def _calculate_innovation_potential(self, project: ProjectDetails) -> float:
        """Calculate innovation potential score (0-100)"""
        base_score = 50  # Moderate innovation potential

        # Adjust based on technology choices
        if project.technologies:
            emerging_tech_count = sum(
                1
                for tech in project.technologies
                if any(
                    term in tech.lower()
                    for term in ["ai", "iot", "renewable", "biotech"]
                )
            )
            base_score += emerging_tech_count * 10

        # Adjust based on pollution type complexity
        if "chemical" in project.pollution_type.lower():
            base_score += 15  # Complex challenges drive innovation

        # Adjust based on location (Gabes industrial challenges)
        if "gabes" in project.location.lower():
            base_score += 10  # Regional innovation opportunities

        return max(0, min(100, base_score))

    def _assess_scalability(self, technologies: List[str]) -> str:
        """Assess project scalability"""
        scalability_factors = []

        # Technology scalability
        if technologies:
            for tech in technologies:
                tech_lower = tech.lower()
                matched = False
                for tech_category, assessment in self.technology_assessment.items():
                    if tech_category.replace("_", " ") in tech_lower:
                        scalability_factors.append(assessment["scalability"])
                        matched = True
                        break
                if not matched:
                    scalability_factors.append("medium")

        if not scalability_factors:
            return "unknown"

        # Determine overall scalability
        high_count = scalability_factors.count("high")
        medium_count = scalability_factors.count("medium")
        low_count = scalability_factors.count("low")

        if high_count > medium_count and high_count > low_count:
            return "high"
        elif medium_count >= high_count and medium_count >= low_count:
            return "medium"
        else:
            return "low"

    def _generate_technical_recommendations(
        self,
        tech_feasibility: str,
        infrastructure_compat: str,
        technical_risks: List[str],
    ) -> List[str]:
        """Generate technical recommendations"""
        recommendations = []

        if tech_feasibility == "low":
            recommendations.append(
                "Consider alternative technologies with proven feasibility in similar contexts"
            )

        if infrastructure_compat in ["limited", "moderate"]:
            recommendations.append(
                "Conduct infrastructure gap analysis and develop mitigation plans"
            )

        if technical_risks:
            recommendations.append(
                "Develop comprehensive risk mitigation strategies for identified technical challenges"
            )

        # General recommendations for Gabes context
        recommendations.extend(
            [
                "Partner with Tunisian technical universities for local expertise development",
                "Consider hybrid technology approaches combining proven and innovative solutions",
                "Establish technology demonstration pilots before full-scale implementation",
                "Develop local maintenance and operation capabilities",
                "Ensure technology selection considers local environmental conditions (salinity, temperature)",
            ]
        )

        return recommendations
