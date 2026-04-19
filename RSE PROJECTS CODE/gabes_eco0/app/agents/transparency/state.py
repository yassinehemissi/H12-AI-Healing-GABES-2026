from typing import TypedDict, List, Dict, Any, Optional

class TransparencyState(TypedDict):
    location: str
    date: str
    user_profile: dict
    user_query: Optional[str]
    pollution_data: List[dict]
    citizen_reports: List[dict]
    aqi_score: float
    anomalies_detected: List[str]
    alert_level: str
    alert_message: str

    # Community Reporting Fields
    enriched_reports: List[dict]
    credibility_scores: List[float]
    geo_points: List[dict]
    hotzone_clusters: List[dict]
    heatmap_geojson: dict
    health_recommendations: List[str]
    final_response: Dict[str, Any]
