# features/analysis/seed.py

"""
Seed realistic mock data for the Gabes industrial zone.
Idempotent — checks if data already exists before inserting.
"""

import random
from datetime import datetime, timezone, timedelta
import os
try:
    import db
except Exception:
    db = None

# ── In-memory data stores (used as fallback when MongoDB is unavailable) ──

_companies: list[dict] = []
_pollution_metrics: list[dict] = []
_rse_scores: list[dict] = []
_news_items: list[dict] = []

# ── Gabes Industrial Companies ──

COMPANIES = [
    {"name": "Groupe Chimique Tunisien (GCT)", "sector": "Chemical & Phosphate", "location": "Gabès Zone Industrielle", "description": "State-owned phosphate processing giant, primary source of phosphogypsum waste in the Gulf of Gabès.", "employee_count": 2800, "founded_year": 1947},
    {"name": "ICF - Industries Chimiques Fluorées", "sector": "Chemical Processing", "location": "Gabès Sud", "description": "Produces hydrofluoric acid and aluminum fluoride from phosphate by-products.", "employee_count": 450, "founded_year": 1972},
    {"name": "SIAPE - Société Industrielle d'Acide Phosphorique", "sector": "Chemical & Phosphate", "location": "Gabès Zone Portuaire", "description": "Major phosphoric acid producer, responsible for significant wastewater discharge into the Mediterranean.", "employee_count": 620, "founded_year": 1952},
    {"name": "SOTACIB", "sector": "Cement & Construction", "location": "Gabès Nord", "description": "Cement manufacturer with significant SO2 and particulate emissions.", "employee_count": 380, "founded_year": 1979},
    {"name": "Alkimia SA", "sector": "Chemical Processing", "location": "Gabès Zone Industrielle", "description": "Tripolyphosphate and specialty chemicals producer.", "employee_count": 310, "founded_year": 1972},
    {"name": "STEG Gabès", "sector": "Energy & Utilities", "location": "Gabès Centre", "description": "Regional electricity and gas utility, operates fossil fuel power generation.", "employee_count": 520, "founded_year": 1962},
    {"name": "Tunisian Indian Fertilizers (TIFERT)", "sector": "Fertilizer", "location": "Gabès Skhira", "description": "Joint venture producing di-ammonium phosphate fertilizer for export.", "employee_count": 280, "founded_year": 2009},
    {"name": "Société Méditerranéenne de l'Environnement", "sector": "Waste Management", "location": "Gabès Métouia", "description": "Waste treatment and environmental services company for the industrial zone.", "employee_count": 120, "founded_year": 2005},
    {"name": "Gabès Agri-Export", "sector": "Agriculture & Food", "location": "Gabès Oasis", "description": "Date palm and olive export company, affected by industrial water contamination.", "employee_count": 95, "founded_year": 1998},
    {"name": "SOTUVER Gabès", "sector": "Glass Manufacturing", "location": "Gabès Zone Industrielle", "description": "Glass production facility with moderate energy consumption footprint.", "employee_count": 200, "founded_year": 1967},
    {"name": "El Fouladh Steel Gabès", "sector": "Metallurgy", "location": "Gabès Nord", "description": "Steel processing and recycling facility.", "employee_count": 160, "founded_year": 1985},
    {"name": "Société des Ciments de Gabès", "sector": "Cement & Construction", "location": "Gabès Chenini", "description": "Secondary cement plant with dust emission challenges.", "employee_count": 210, "founded_year": 1990},
    {"name": "Gabès Desalination Plant", "sector": "Water Treatment", "location": "Gabès Littoral", "description": "Reverse-osmosis desalination providing potable water, energy-intensive.", "employee_count": 75, "founded_year": 2015},
    {"name": "Phoscal Gabès", "sector": "Chemical Processing", "location": "Gabès Zone Industrielle", "description": "Calcium phosphate derivatives and animal feed additives manufacturer.", "employee_count": 140, "founded_year": 2001},
    {"name": "Green Gabès Solar", "sector": "Renewable Energy", "location": "Gabès Hamma", "description": "Solar photovoltaic plant contributing clean energy to the grid.", "employee_count": 45, "founded_year": 2019},
]

POLLUTANTS = [
    {"name": "so2", "unit": "ppm", "base_range": (80, 220), "improving": True},
    {"name": "phosphogypsum", "unit": "tonnes/month", "base_range": (8000, 18000), "improving": False},
    {"name": "heavy_metals", "unit": "mg/L", "base_range": (0.5, 4.2), "improving": True},
    {"name": "wastewater", "unit": "pH", "base_range": (2.1, 5.8), "improving": True},
]

GABES_NEWS = [
    {"title": "Gabès residents protest phosphogypsum dumping in Mediterranean", "url": "https://example.com/gabes-protest-2025", "published": "2025-12-15"},
    {"title": "GCT announces EUR 50M modernization plan to reduce emissions", "url": "https://example.com/gct-modernization", "published": "2025-11-28"},
    {"title": "Study reveals heavy metal contamination in Gabès coastal waters", "url": "https://example.com/gabes-contamination-study", "published": "2025-11-10"},
    {"title": "Tunisia's environment ministry sets new SO2 limits for Gabès zone", "url": "https://example.com/so2-limits-gabes", "published": "2025-10-22"},
    {"title": "Green Gabès Solar expands capacity by 30MW", "url": "https://example.com/green-gabes-solar", "published": "2025-10-05"},
    {"title": "EU partnership funds RSE assessment program for Tunisian industry", "url": "https://example.com/eu-rse-tunisia", "published": "2025-09-18"},
    {"title": "Oasis farmers report declining crop yields near industrial zone", "url": "https://example.com/oasis-crop-decline", "published": "2025-09-01"},
    {"title": "TIFERT achieves ISO 14001 environmental certification", "url": "https://example.com/tifert-iso14001", "published": "2025-08-14"},
    {"title": "New wastewater treatment facility planned for Gabès port area", "url": "https://example.com/wastewater-treatment-gabes", "published": "2025-07-27"},
    {"title": "Gabès air quality index ranks worst in North Africa for Q2 2025", "url": "https://example.com/gabes-air-quality", "published": "2025-07-10"},
    {"title": "Civil society launches 'Heal Gabès' environmental monitoring app", "url": "https://example.com/heal-gabes-app", "published": "2025-06-22"},
    {"title": "Alkimia invests in closed-loop chemical recovery system", "url": "https://example.com/alkimia-closed-loop", "published": "2025-06-05"},
]


def _generate_rse_scores() -> list[dict]:
    """Generate realistic RSE scores for each company."""
    scores = []
    for company in COMPANIES:
        sector = company["sector"]

        # Base scores by sector (worse polluters get lower scores)
        if sector in ("Chemical & Phosphate", "Chemical Processing"):
            env_base = random.uniform(15, 40)
            soc_base = random.uniform(30, 55)
            gov_base = random.uniform(25, 50)
        elif sector in ("Cement & Construction", "Metallurgy"):
            env_base = random.uniform(25, 50)
            soc_base = random.uniform(35, 60)
            gov_base = random.uniform(30, 55)
        elif sector in ("Fertilizer",):
            env_base = random.uniform(20, 45)
            soc_base = random.uniform(40, 60)
            gov_base = random.uniform(35, 55)
        elif sector in ("Renewable Energy",):
            env_base = random.uniform(75, 95)
            soc_base = random.uniform(65, 85)
            gov_base = random.uniform(70, 90)
        elif sector in ("Waste Management", "Water Treatment"):
            env_base = random.uniform(50, 75)
            soc_base = random.uniform(55, 75)
            gov_base = random.uniform(50, 70)
        else:
            env_base = random.uniform(35, 65)
            soc_base = random.uniform(40, 65)
            gov_base = random.uniform(35, 60)

        env = round(env_base, 1)
        soc = round(soc_base, 1)
        gov = round(gov_base, 1)
        overall = round(env * 0.5 + soc * 0.3 + gov * 0.2, 1)

        if overall >= 80:
            grade = "A"
        elif overall >= 65:
            grade = "B"
        elif overall >= 50:
            grade = "C"
        elif overall >= 35:
            grade = "D"
        elif overall >= 20:
            grade = "E"
        else:
            grade = "F"

        scores.append({
            "company": company["name"],
            "sector": sector,
            "location": company["location"],
            "environmental_score": env,
            "social_score": soc,
            "governance_score": gov,
            "overall_score": overall,
            "grade": grade,
            "last_assessed": datetime(2025, 12, 1, tzinfo=timezone.utc).isoformat(),
        })
    return scores


def _generate_pollution_data() -> list[dict]:
    """Generate 12 months of pollution trend data."""
    metrics = []
    base_date = datetime(2025, 1, 1, tzinfo=timezone.utc)

    for month_offset in range(12):
        month_date = base_date + timedelta(days=30 * month_offset)
        for pollutant in POLLUTANTS:
            low, high = pollutant["base_range"]
            # Add a slight trend
            trend_factor = 1.0
            if pollutant["improving"]:
                trend_factor = 1.0 - (month_offset * 0.015)  # gradual decrease
            else:
                trend_factor = 1.0 + (month_offset * 0.008)  # slight increase

            value = round(random.uniform(low, high) * trend_factor, 2)
            metrics.append({
                "timestamp": month_date.isoformat(),
                "pollutant": pollutant["name"],
                "value": value,
                "unit": pollutant["unit"],
                "location": "Gabès Industrial Zone",
                "source": "environmental_monitoring",
                "month": month_date.strftime("%Y-%m"),
            })
    return metrics


def seed_data() -> dict:
    """Seed all in-memory data stores. Idempotent."""
    global _companies, _pollution_metrics, _rse_scores, _news_items

    if _companies:
        return {"status": "already_seeded", "companies": len(_companies)}

    # Seed with deterministic randomness for consistency across restarts
    random.seed(42)

    _companies = [dict(c) for c in COMPANIES]
    _pollution_metrics = _generate_pollution_data()
    _rse_scores = _generate_rse_scores()
    _news_items = [dict(n) for n in GABES_NEWS]

    # Reset seed to avoid affecting other random usage
    random.seed()
    # Optionally persist to MongoDB if available and empty (idempotent)
    if db:
        try:
            existing_companies = db.get_companies() or []
            if not existing_companies:
                for c in _companies:
                    db.save_company(c)

            existing_rse = db.get_rse_scores() or []
            if not existing_rse:
                for s in _rse_scores:
                    db.save_rse_score(s)

            existing_pollution = db.get_pollution_metrics() or []
            if not existing_pollution:
                for m in _pollution_metrics:
                    db.save_pollution_metric(m)

            # Best-effort: create indexes
            try:
                db.ensure_indexes()
            except Exception:
                pass
        except Exception:
            # If DB operations fail, continue gracefully using in-memory stores
            pass

    return {
        "status": "seeded",
        "companies": len(_companies),
        "pollution_metrics": len(_pollution_metrics),
        "rse_scores": len(_rse_scores),
        "news_items": len(_news_items),
    }


# ── Data access functions ──

def get_companies() -> list[dict]:
    return _companies

def get_pollution_metrics() -> list[dict]:
    return _pollution_metrics

def get_rse_scores() -> list[dict]:
    return _rse_scores

def get_news_items() -> list[dict]:
    return _news_items
