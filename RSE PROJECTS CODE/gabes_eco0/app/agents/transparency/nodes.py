import json
import random

import numpy as np
from geopy.geocoders import Nominatim
from sklearn.cluster import DBSCAN

from app.agents.transparency.prompts import (
    ANALYZE_POLLUTION_PROMPT,
    CATEGORIZE_REPORTS_PROMPT,
    GENERATE_ALERT_PROMPT,
    GENERATE_RECOMMENDATIONS_PROMPT,
)
from app.agents.transparency.state import TransparencyState
from app.agents.transparency.tools import (
    compute_aqi_from_data,
    fetch_citizen_reports,
    fetch_pollution_data,
)
from app.core.llm_clients import get_text_llm


async def load_data_node(state: TransparencyState) -> dict:
    location = state.get("location")
    date = state.get("date")
    user_query = state.get("user_query")

    pollution_data = fetch_pollution_data(location, date)
    citizen_reports = fetch_citizen_reports(location)

    # We append the current user request so the transparency flow can treat it as a live citizen signal.
    if user_query:
        import datetime

        citizen_reports.append(
            {
                "id": "RPT-REALTIME",
                "timestamp": datetime.datetime.now().isoformat(),
                "location": location,
                "citizen_id": "current_user",
                "type": "requete_temps_reel",
                "description": user_query,
                "severity": "medium",
                "verified": False,
            }
        )

    aqi_result = compute_aqi_from_data(pollution_data)

    return {
        "pollution_data": pollution_data,
        "citizen_reports": citizen_reports,
        "aqi_score": aqi_result["aqi_score"],
    }


async def analyze_pollution_node(state: TransparencyState) -> dict:
    llm = get_text_llm()
    chain = ANALYZE_POLLUTION_PROMPT | llm

    response = await chain.ainvoke(
        {
            "location": state["location"],
            "pollution_data": json.dumps(state["pollution_data"]),
            "citizen_reports": json.dumps(state["citizen_reports"]),
            "aqi_score": state["aqi_score"],
        }
    )

    try:
        content = response.content
        if content.startswith("```json"):
            content = content[7:-3]
        parsed = json.loads(content)

        return {
            "anomalies_detected": parsed.get("anomalies_detected", []),
            "alert_level": parsed.get("alert_level", "inconnu"),
            "pollution_summary": parsed.get("pollution_summary", {}),
        }
    except Exception:
        return {
            "anomalies_detected": ["Erreur d'analyse des anomalies"],
            "alert_level": "orange",
            "pollution_summary": {},
        }


async def generate_alert_node(state: TransparencyState) -> dict:
    llm = get_text_llm()
    chain = GENERATE_ALERT_PROMPT | llm
    response = await chain.ainvoke(
        {
            "alert_level": state["alert_level"],
            "location": state["location"],
            "anomalies_detected": ", ".join(state["anomalies_detected"]),
        }
    )
    return {"alert_message": response.content.strip()}


async def generate_recommendations_node(state: TransparencyState) -> dict:
    llm = get_text_llm()
    chain = GENERATE_RECOMMENDATIONS_PROMPT | llm
    user_profile = state.get("user_profile", {})

    response = await chain.ainvoke(
        {
            "alert_level": state["alert_level"],
            "anomalies_detected": ", ".join(state["anomalies_detected"]),
            "age_group": user_profile.get("age_group", "inconnu"),
            "vulnerabilities": ", ".join(user_profile.get("vulnerabilities", [])),
        }
    )

    try:
        content = response.content
        if content.startswith("```json"):
            content = content[7:-3]
        parsed = json.loads(content)
        recommendations = parsed.get("recommendations", [])
    except Exception:
        recommendations = ["Prenez des precautions de base."]

    return {"health_recommendations": recommendations}


async def categorize_report_node(state: TransparencyState) -> dict:
    reports = state.get("citizen_reports", [])
    if not reports:
        return {"enriched_reports": []}

    llm = get_text_llm()
    chain = CATEGORIZE_REPORTS_PROMPT | llm

    response = await chain.ainvoke({"reports": json.dumps(reports, ensure_ascii=False)})

    try:
        content = response.content
        if content.startswith("```json"):
            content = content[7:-3]
        enriched = json.loads(content)
        if not isinstance(enriched, list):
            enriched = [enriched]

        enriched_reports = []
        for orig in reports:
            match = next((item for item in enriched if item.get("id") == orig.get("id")), None)
            merged = {**orig}
            if match:
                merged["category"] = match.get("category", "autre")
                merged["severity_score"] = match.get("severity", 3)
            else:
                merged["category"] = "autre"
                merged["severity_score"] = 3
            enriched_reports.append(merged)

        return {"enriched_reports": enriched_reports}
    except Exception:
        return {"enriched_reports": [{**r, "category": "autre", "severity_score": 3} for r in reports]}


async def credibility_score_node(state: TransparencyState) -> dict:
    reports = state.get("enriched_reports", [])
    pollution = state.get("pollution_data", {})
    if isinstance(pollution, list):
        pollution = pollution[0] if pollution else {}

    scored_reports = []
    for report in reports:
        score = 0.3
        if pollution.get("SO2", 0) > 50 and report.get("category") == "odeur_chimique":
            score += 0.3

        # We slightly increase credibility when several users report related events.
        if len(reports) > 2:
            score += 0.2

        hour = 12
        if "timestamp" in report:
            try:
                hour = int(report["timestamp"].split("T")[1].split(":")[0])
            except Exception:
                pass

        if 6 <= hour <= 22:
            score += 0.2

        scored_reports.append({**report, "credibility": min(score, 1.0)})

    return {"enriched_reports": scored_reports}


# Fallback static coordinates for Gabes zones when live geocoding is unavailable.
GABES_ZONES = {
    "Zone_Industrielle_Nord": (33.9200, 10.0900),
    "Zone_Industrielle_Sud": (33.8800, 10.0950),
    "Centre_Ville": (33.8833, 10.0986),
    "Chott_Salem": (33.8600, 10.1100),
    "Oued_Melah": (33.9100, 10.0700),
    "Zone_Residentielle_Centre": (33.8833, 10.0986),
    "Zone_Port": (33.9000, 10.1200),
}


async def geolocate_node(state: TransparencyState) -> dict:
    reports = state.get("enriched_reports", [])
    geo_points = []

    geolocator = Nominatim(user_agent="gabes_eco_app")

    for report in reports:
        zone = report.get("location", "Centre_Ville")

        lat, lon = None, None
        try:
            location_data = geolocator.geocode(f"{zone}, Gabes, Tunisia")
            if location_data:
                lat, lon = location_data.latitude, location_data.longitude
        except Exception:
            pass

        if lat is None or lon is None:
            lat, lon = GABES_ZONES.get(zone, (33.8833, 10.0986))

        lat += random.uniform(-0.003, 0.003)
        lon += random.uniform(-0.003, 0.003)

        geo_points.append(
            {
                "lat": lat,
                "lon": lon,
                "category": report.get("category", "autre"),
                "credibility": report.get("credibility", 0.5),
                "timestamp": report.get("timestamp"),
                "description": report.get("description", ""),
            }
        )

    return {"geo_points": geo_points}


async def cluster_reports_node(state: TransparencyState) -> dict:
    points = state.get("geo_points", [])

    # We always return GeoJSON so the mobile app can render empty and non-empty states consistently.
    features = []
    for pt in points:
        features.append(
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [pt["lon"], pt["lat"]]},
                "properties": {"category": pt["category"], "credibility": pt["credibility"]},
            }
        )
    geojson = {"type": "FeatureCollection", "features": features}

    if len(points) < 2:
        return {"hotzone_clusters": [], "heatmap_geojson": geojson}

    coords = np.array([[p["lat"], p["lon"]] for p in points])
    weights = np.array([p["credibility"] for p in points])

    try:
        db = DBSCAN(eps=0.003, min_samples=2, metric="haversine").fit(np.radians(coords))
        labels = db.labels_

        clusters = []
        for label in set(labels):
            if label == -1:
                continue
            mask = labels == label
            cluster_points = coords[mask]
            cluster_weights = weights[mask]

            center_lat = float(np.average(cluster_points[:, 0], weights=cluster_weights))
            center_lon = float(np.average(cluster_points[:, 1], weights=cluster_weights))

            clusters.append(
                {
                    "id": int(label),
                    "center": {"lat": center_lat, "lon": center_lon},
                    "count": int(mask.sum()),
                    "avg_credibility": float(cluster_weights.mean()),
                    "categories": list(set(p["category"] for p, m in zip(points, mask) if m)),
                    "severity": "haute" if cluster_weights.mean() > 0.7 else "moyenne",
                }
            )
    except Exception:
        clusters = []

    return {"hotzone_clusters": clusters, "heatmap_geojson": geojson}


async def format_final_response_node(state: TransparencyState) -> dict:
    # FastAPI validates `date` as a string, so missing dates must be converted to a readable fallback.
    resolved_date = state.get("date") or "Derniere date disponible"
    final_response = {
        "location": state["location"],
        "date": resolved_date,
        "alert_level": state.get("alert_level", "inconnu"),
        "alert_message": state.get("alert_message", ""),
        "aqi_score": state.get("aqi_score", 0.0),
        "pollution_summary": state.get("pollution_summary", {}),
        "anomalies": state.get("anomalies_detected", []),
        "citizen_reports_count": len(state.get("citizen_reports", [])),
        "health_recommendations": state.get("health_recommendations", []),
        "citizen_reports_summary": f"{len(state.get('citizen_reports', []))} signalements pour cette zone.",
        "hotzone_clusters": state.get("hotzone_clusters", []),
        "heatmap_geojson": state.get("heatmap_geojson", {}),
    }
    return {"final_response": final_response}
