# features/analysis/service.py

"""
Business logic for RSE scoring, pollution analysis, and AI recommendations.
"""

from datetime import datetime, timezone
import db
from features.analysis.seed import (
    get_companies as _seed_get_companies,
    get_pollution_metrics as _seed_get_pollution_metrics,
    get_rse_scores as _seed_get_rse_scores,
    get_news_items as _seed_get_news_items,
)
from features.analysis.models import (
    DashboardSummary, PollutionTrendPoint, RSEScore, CompanyDetail, Recommendation
)


def get_dashboard_summary() -> dict:
    """Compile top-level KPIs for the dashboard."""
    # Prefer MongoDB-backed collections if available, otherwise fall back to in-memory seed
    try:
        companies = db.get_companies() or _seed_get_companies()
    except Exception:
        companies = _seed_get_companies()

    try:
        rse_scores = db.get_rse_scores() or _seed_get_rse_scores()
    except Exception:
        rse_scores = _seed_get_rse_scores()

    try:
        pollution = db.get_pollution_metrics() or _seed_get_pollution_metrics()
    except Exception:
        pollution = _seed_get_pollution_metrics()

    try:
        news = db.get_news_items() if hasattr(db, "get_news_items") else _seed_get_news_items()
    except Exception:
        news = _seed_get_news_items()

    if not rse_scores:
        return DashboardSummary(
            total_companies=0, avg_rse_score=0, avg_grade="N/A",
            pollution_trend="stable", pollution_change_pct=0,
            top_pollutants=[], recent_news_count=0, data_sources=0
        ).model_dump()

    avg_score = round(sum(s["overall_score"] for s in rse_scores) / len(rse_scores), 1)

    if avg_score >= 80: avg_grade = "A"
    elif avg_score >= 65: avg_grade = "B"
    elif avg_score >= 50: avg_grade = "C"
    elif avg_score >= 35: avg_grade = "D"
    elif avg_score >= 20: avg_grade = "E"
    else: avg_grade = "F"

    # Calculate pollution trend (compare last 3 months vs first 3 months)
    months = sorted(set(m["month"] for m in pollution))
    if len(months) >= 6:
        early_months = months[:3]
        late_months = months[-3:]
        early_avg = _avg_pollution(pollution, early_months)
        late_avg = _avg_pollution(pollution, late_months)
        if early_avg > 0:
            change_pct = round(((late_avg - early_avg) / early_avg) * 100, 1)
        else:
            change_pct = 0
        trend = "improving" if change_pct < -2 else "worsening" if change_pct > 2 else "stable"
    else:
        change_pct = 0
        trend = "stable"

    # Top pollutants (latest month averages)
    latest_month = months[-1] if months else None
    top_pollutants = []
    if latest_month:
        latest_data = [m for m in pollution if m["month"] == latest_month]
        by_type: dict[str, list] = {}
        for m in latest_data:
            by_type.setdefault(m["pollutant"], []).append(m)
        for pname, items in by_type.items():
            avg_val = round(sum(i["value"] for i in items) / len(items), 2)
            top_pollutants.append({
                "name": pname,
                "value": avg_val,
                "unit": items[0]["unit"]
            })

    return {
        "total_companies": len(companies),
        "avg_rse_score": avg_score,
        "avg_grade": avg_grade,
        "pollution_trend": trend,
        "pollution_change_pct": change_pct,
        "top_pollutants": top_pollutants,
        "recent_news_count": len(news),
        "data_sources": 4,
        "last_scraping_run": datetime.now(timezone.utc).isoformat(),
    }


def _avg_pollution(metrics: list[dict], months: list[str]) -> float:
    vals = [m["value"] for m in metrics if m["month"] in months and m["pollutant"] == "so2"]
    return sum(vals) / len(vals) if vals else 0


def get_pollution_trends() -> list[dict]:
    """Get monthly pollution trends aggregated by pollutant type."""
    try:
        pollution = db.get_pollution_metrics() or _seed_get_pollution_metrics()
    except Exception:
        pollution = _seed_get_pollution_metrics()
    months = sorted(set(m["month"] for m in pollution))

    trends = []
    for month in months:
        month_data = [m for m in pollution if m["month"] == month]
        point = {"month": month, "so2": 0, "phosphogypsum": 0, "heavy_metals": 0, "wastewater": 0}
        counts = {"so2": 0, "phosphogypsum": 0, "heavy_metals": 0, "wastewater": 0}
        for m in month_data:
            p = m["pollutant"]
            if p in point:
                point[p] += m["value"]
                counts[p] += 1
        for p in ["so2", "phosphogypsum", "heavy_metals", "wastewater"]:
            if counts[p] > 0:
                point[p] = round(point[p] / counts[p], 2)
        trends.append(point)
    return trends


def get_company_rankings() -> list[dict]:
    """Get companies ranked by RSE score with full details."""
    try:
        companies = db.get_companies() or _seed_get_companies()
    except Exception:
        companies = _seed_get_companies()

    try:
        rse_scores = db.get_rse_scores() or _seed_get_rse_scores()
    except Exception:
        rse_scores = _seed_get_rse_scores()

    score_map = {s["company"]: s for s in rse_scores}

    results = []
    for c in companies:
        score = score_map.get(c["name"])
        entry = {
            "name": c["name"],
            "sector": c["sector"],
            "location": c["location"],
            "description": c["description"],
            "employee_count": c.get("employee_count"),
            "founded_year": c.get("founded_year"),
        }
        if score:
            entry.update({
                "environmental_score": score["environmental_score"],
                "social_score": score["social_score"],
                "governance_score": score["governance_score"],
                "overall_score": score["overall_score"],
                "grade": score["grade"],
                "last_assessed": score["last_assessed"],
            })
        results.append(entry)

    results.sort(key=lambda x: x.get("overall_score", 0), reverse=True)
    return results


def get_company_detail(company_name: str) -> dict | None:
    """Get detailed info for a single company."""
    try:
        companies = db.get_companies() or _seed_get_companies()
    except Exception:
        companies = _seed_get_companies()

    try:
        rse_scores = db.get_rse_scores() or _seed_get_rse_scores()
    except Exception:
        rse_scores = _seed_get_rse_scores()

    company = next((c for c in companies if c["name"].lower() == company_name.lower()), None)
    if not company:
        return None

    score = next((s for s in rse_scores if s["company"] == company["name"]), None)

    result = dict(company)
    if score:
        result["rse_score"] = score
    return result


def generate_recommendations(company_name: str) -> list[dict]:
    """Generate rule-based RSE improvement recommendations."""
    try:
        rse_scores = db.get_rse_scores() or _seed_get_rse_scores()
    except Exception:
        rse_scores = _seed_get_rse_scores()
    score = next((s for s in rse_scores if s["company"].lower() == company_name.lower()), None)

    if not score:
        return []

    recommendations = []

    # Environmental recommendations
    env = score["environmental_score"]
    if env < 30:
        recommendations.append({
            "category": "environmental",
            "priority": "high",
            "title": "Implement Emissions Reduction System",
            "description": "Install industrial scrubbers and filtration systems to reduce SO2 and particulate emissions by at least 40%. Consider switching to cleaner production processes.",
            "impact_score": 15.0,
        })
        recommendations.append({
            "category": "environmental",
            "priority": "high",
            "title": "Wastewater Treatment Upgrade",
            "description": "Deploy advanced wastewater treatment (tertiary level) to meet Mediterranean discharge standards. Current discharge levels are critically above safe limits.",
            "impact_score": 12.0,
        })
    elif env < 50:
        recommendations.append({
            "category": "environmental",
            "priority": "medium",
            "title": "Phosphogypsum Waste Management",
            "description": "Implement a phosphogypsum recycling program to convert waste into construction materials. Partner with SOTACIB for circular economy integration.",
            "impact_score": 10.0,
        })
    elif env < 70:
        recommendations.append({
            "category": "environmental",
            "priority": "low",
            "title": "Carbon Footprint Monitoring",
            "description": "Deploy IoT sensors for real-time emissions monitoring and automated reporting to comply with upcoming Tunisia NDC targets.",
            "impact_score": 5.0,
        })

    # Social recommendations
    soc = score["social_score"]
    if soc < 40:
        recommendations.append({
            "category": "social",
            "priority": "high",
            "title": "Community Health Impact Assessment",
            "description": "Commission an independent health impact study for surrounding communities. Fund a local clinic and respiratory health screening program.",
            "impact_score": 12.0,
        })
    elif soc < 60:
        recommendations.append({
            "category": "social",
            "priority": "medium",
            "title": "Local Employment Program",
            "description": "Increase local hiring from Gabès governorate by 20%. Launch vocational training partnerships with ISET Gabès.",
            "impact_score": 8.0,
        })

    # Governance recommendations
    gov = score["governance_score"]
    if gov < 40:
        recommendations.append({
            "category": "governance",
            "priority": "high",
            "title": "RSE Transparency Report",
            "description": "Publish an annual RSE/CSR report following GRI Standards. Establish an independent environmental compliance committee.",
            "impact_score": 10.0,
        })
    elif gov < 60:
        recommendations.append({
            "category": "governance",
            "priority": "medium",
            "title": "ISO 14001 Certification",
            "description": "Pursue ISO 14001 Environmental Management System certification. This improves governance score and unlocks EU export market access.",
            "impact_score": 7.0,
        })

    # Always add a renewable energy recommendation if env < 70
    if env < 70:
        recommendations.append({
            "category": "environmental",
            "priority": "medium",
            "title": "Renewable Energy Transition",
            "description": "Install rooftop solar panels and negotiate a PPA with Green Gabès Solar. Target 30% renewable energy share within 2 years.",
            "impact_score": 8.0,
        })

    recommendations.sort(key=lambda x: x["impact_score"], reverse=True)
    return recommendations


async def ai_recommendations(company_name: str) -> str:
    """Get AI-powered recommendations using the LLM API."""
    import os
    import httpx

    api_key = os.getenv("OPENAI_API_KEY", "")
    base_url = os.getenv("OPENAI_BASE_URL", "https://tokenfactory.esprit.tn/api")
    model = os.getenv("OPENAI_MODEL", "hosted_vllm/llava-1.5-7b-hf")

    if not api_key:
        return "AI recommendations unavailable — no API key configured."

    # Get company context
    try:
        rse_scores = db.get_rse_scores() or _seed_get_rse_scores()
    except Exception:
        rse_scores = _seed_get_rse_scores()

    score = next((s for s in rse_scores if s["company"].lower() == company_name.lower()), None)

    if not score:
        return f"Company '{company_name}' not found in database."

    prompt = f"""You are an environmental RSE (Corporate Social Responsibility) expert for the Gabès industrial zone in Tunisia.

Company: {score['company']}
Sector: {score['sector']}
Environmental Score: {score['environmental_score']}/100
Social Score: {score['social_score']}/100
Governance Score: {score['governance_score']}/100
Overall RSE Grade: {score['grade']}

Gabès context: The city suffers from severe industrial pollution, primarily from phosphate processing. Key issues include phosphogypsum dumping, SO2 emissions, heavy metal contamination in coastal waters, and wastewater discharge.

Provide 3 specific, actionable recommendations to improve this company's RSE score. Focus on practical steps relevant to Gabès's pollution challenges. Be concise."""

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{base_url}/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 512,
                    "temperature": 0.7,
                },
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
    except Exception as e:
        return f"AI service error: {str(e)}. Falling back to rule-based recommendations."
