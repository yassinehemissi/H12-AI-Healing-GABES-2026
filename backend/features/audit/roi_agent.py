import math
from typing import Dict, List, Tuple

from .models import AgentReport, ProjectDetails, ROIAnalysis


class ROIAgent:
    """Agent for financial analysis and ROI forecasting"""

    def __init__(self):
        self.system_message = (
            "You are an environmental project financial analyst. "
            "Compute ROI using full lifecycle costs: CAPEX, OPEX, permitting, "
            "monitoring, compliance, financing, contingency, and downside scenarios."
        )
        self.discount_rate = 0.08  # 8% discount rate for Tunisia
        self.inflation_rate = 0.05  # 5% inflation rate
        self.risk_premium = 0.03  # 3% risk premium for environmental projects

    def analyze_project(self, project: ProjectDetails) -> ROIAnalysis:
        """Analyze project financial viability"""

        # Estimate costs based on project type and budget
        if project.estimated_budget:
            total_investment = project.estimated_budget
        else:
            # Rough estimation based on pollution type
            base_costs = {
                "chemical": 2000000,  # 2M TND
                "industrial": 5000000,  # 5M TND
                "waste": 1500000,  # 1.5M TND
                "water": 3000000,  # 3M TND
            }
            total_investment = base_costs.get(project.pollution_type.lower(), 2500000)

        # Estimate operational costs (project-type dependent)
        annual_op_costs = self._estimate_operational_costs(project, total_investment)

        # Estimate benefits based on project type
        annual_benefits = self._estimate_benefits(project, total_investment)

        # Calculate NPV
        timeline_years = max(1, (project.timeline_months or 24) // 12)
        npv = self._calculate_npv(
            total_investment, annual_benefits, annual_op_costs, timeline_years
        )

        # Calculate IRR
        irr = self._calculate_irr(
            total_investment, annual_benefits, annual_op_costs, timeline_years
        )

        # Calculate payback period
        payback_period = self._calculate_payback_period(
            total_investment, annual_benefits, annual_op_costs
        )

        # Calculate profitability score (0-100)
        profitability_score = min(100, max(0, (irr * 100) + 50))

        # Cost-benefit ratio
        total_benefits = sum(annual_benefits[:timeline_years])
        cost_benefit_ratio = (
            total_benefits / total_investment if total_investment > 0 else 0
        )

        # Risk-adjusted ROI
        risk_adjusted_discount_rate = self.discount_rate + self.risk_premium
        risk_adjusted_npv = self._calculate_npv(
            total_investment,
            annual_benefits,
            annual_op_costs,
            timeline_years,
            risk_adjusted_discount_rate,
        )
        risk_adjusted_roi = (
            (risk_adjusted_npv / total_investment) * 100 if total_investment > 0 else 0
        )

        # 5-year forecast
        forecast_5year = self._generate_5year_forecast(
            annual_benefits, annual_op_costs, timeline_years
        )

        # Generate recommendations
        recommendations = self._generate_financial_recommendations(
            npv, irr, payback_period, risk_adjusted_roi
        )

        return ROIAnalysis(
            npv=npv,
            irr=irr,
            payback_period_months=int(payback_period * 12),
            profitability_score=profitability_score,
            cost_benefit_ratio=cost_benefit_ratio,
            risk_adjusted_roi=risk_adjusted_roi,
            forecast_5year=forecast_5year,
            recommendations=recommendations,
        )

    def analyze_with_report(self, project: ProjectDetails) -> Tuple[ROIAnalysis, AgentReport]:
        analysis = self.analyze_project(project)
        investment = project.estimated_budget or 0.0
        contingency = investment * 0.12
        permitting_costs = max(80_000.0, investment * 0.025) if investment else 80_000.0
        compliance_monitoring = max(60_000.0, investment * 0.02) if investment else 60_000.0
        financing_costs = max(70_000.0, investment * 0.03) if investment else 70_000.0
        full_cost_baseline = (
            investment
            + contingency
            + permitting_costs
            + compliance_monitoring
            + financing_costs
        )
        report = AgentReport(
            agent="roi",
            system_message=self.system_message,
            executive_summary=(
                f"Financial evaluation gives NPV {analysis.npv:,.0f} TND, IRR {analysis.irr:.1%}, "
                f"and profitability score {analysis.profitability_score:.1f}/100."
            ),
            findings=[
                f"Estimated base investment (CAPEX): {investment:,.0f} TND",
                f"Lifecycle baseline incl. permitting/compliance/financing/contingency: {full_cost_baseline:,.0f} TND",
                f"Risk-adjusted ROI: {analysis.risk_adjusted_roi:.1f}%",
                f"Payback period: {analysis.payback_period_months} months",
            ],
            assumptions=[
                "Cash-flow benefits grow gradually after commissioning.",
                "Regulatory and compliance overhead is treated as recurring governance cost.",
            ],
            risks=(
                ["Negative NPV under current assumptions"] if analysis.npv < 0 else []
            )
            + (["IRR below expected threshold"] if analysis.irr < self.discount_rate else []),
            recommendations=analysis.recommendations[:6],
            confidence="medium",
            sources=[],
        )
        return analysis, report

    def _estimate_benefits(
        self, project: ProjectDetails, investment: float
    ) -> List[float]:
        """Estimate annual benefits based on project characteristics"""
        base_benefit_rate = 0.28  # 28% of investment as annual benefit

        # Adjust based on pollution type impact
        impact_multipliers = {
            "chemical": 1.5,  # High impact
            "industrial": 1.3,  # Significant impact
            "waste": 1.35,  # High circular-economy upside
            "water": 1.4,  # Important for Gabes
        }

        multiplier = impact_multipliers.get(project.pollution_type.lower(), 1.0)
        description = (project.description or "").lower()
        if "recycling" in description or "phosphogypsum" in description:
            multiplier += 0.15
        annual_benefit = investment * base_benefit_rate * multiplier

        # Scale benefits over time (increasing due to compounding effects)
        timeline_years = max(1, (project.timeline_months or 24) // 12)
        benefits = []
        for year in range(1, timeline_years + 1):
            growth_factor = 1 + (0.05 * (year - 1))  # 5% annual growth
            benefits.append(annual_benefit * growth_factor)

        return benefits

    def _estimate_operational_costs(
        self, project: ProjectDetails, investment: float
    ) -> float:
        """Estimate annual operational costs using project-type ratios."""
        op_cost_ratios = {
            "chemical": 0.24,
            "industrial": 0.22,
            "waste": 0.16,
            "water": 0.18,
        }
        ratio = op_cost_ratios.get(project.pollution_type.lower(), 0.2)

        description = (project.description or "").lower()
        if "recycling" in description:
            ratio = max(0.12, ratio - 0.02)

        return investment * ratio

    def _calculate_npv(
        self,
        investment: float,
        benefits: List[float],
        op_costs: float,
        timeline_years: int,
        discount_rate: float = None,
    ) -> float:
        """Calculate Net Present Value"""
        if discount_rate is None:
            discount_rate = self.discount_rate

        npv = -investment
        for year in range(1, timeline_years + 1):
            annual_benefit = (
                benefits[year - 1] if year <= len(benefits) else benefits[-1]
            )
            annual_net_benefit = annual_benefit - op_costs
            npv += annual_net_benefit / ((1 + discount_rate) ** year)

        return npv

    def _calculate_irr(
        self,
        investment: float,
        benefits: List[float],
        op_costs: float,
        timeline_years: int,
    ) -> float:
        """Calculate Internal Rate of Return using approximation"""
        # Simplified IRR calculation
        total_benefits = sum(benefits[:timeline_years]) - (op_costs * timeline_years)

        if total_benefits <= 0:
            return -0.1  # Negative IRR

        # Approximate IRR using formula
        irr = (total_benefits / investment) ** (1 / timeline_years) - 1
        return max(-0.5, min(0.5, irr))  # Bound between -50% and 50%

    def _calculate_payback_period(
        self, investment: float, benefits: List[float], op_costs: float
    ) -> float:
        """Calculate payback period in years"""
        cumulative = 0
        for year, benefit in enumerate(benefits, 1):
            cumulative += benefit - op_costs
            if cumulative >= investment:
                # Interpolate for partial year
                excess = cumulative - investment
                partial_year = excess / (benefit - op_costs)
                return year - partial_year

        return len(benefits)  # If not paid back within timeline

    def _generate_5year_forecast(
        self, benefits: List[float], op_costs: float, timeline_years: int
    ) -> Dict[str, float]:
        """Generate 5-year financial forecast"""
        forecast = {}
        for year in range(1, 6):
            if year <= len(benefits):
                benefit = benefits[year - 1]
            else:
                # Extrapolate based on last year with growth
                last_benefit = benefits[-1]
                growth_rate = 0.03  # 3% annual growth
                benefit = last_benefit * ((1 + growth_rate) ** (year - len(benefits)))

            net_benefit = benefit - op_costs
            forecast[f"year_{year}"] = round(net_benefit, 2)

        return forecast

    def _generate_financial_recommendations(
        self, npv: float, irr: float, payback_period: float, risk_adjusted_roi: float
    ) -> List[str]:
        """Generate financial recommendations based on analysis"""
        recommendations = []

        if npv < 0:
            recommendations.append(
                "Project has negative NPV - reconsider investment or reduce costs"
            )
        else:
            recommendations.append("Positive NPV indicates potential value creation")

        if irr < 0.08:  # Below discount rate
            recommendations.append(
                "IRR below required rate of return - seek additional funding or cost reductions"
            )
        else:
            recommendations.append(
                "IRR above required rate indicates good investment potential"
            )

        if payback_period > 5:
            recommendations.append(
                "Long payback period increases risk - consider phased implementation"
            )
        else:
            recommendations.append("Reasonable payback period reduces financial risk")

        if risk_adjusted_roi < 10:
            recommendations.append(
                "Low risk-adjusted ROI - consider alternative investment options"
            )

        recommendations.extend(
            [
                "Conduct sensitivity analysis on key assumptions",
                "Secure funding commitments before full implementation",
                "Monitor actual vs projected costs throughout project lifecycle",
            ]
        )

        return recommendations
