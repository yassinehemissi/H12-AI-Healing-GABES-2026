from app.data.data_loader import load_pollution_data, load_citizen_reports
from app.utils.aqi_calculator import calculate_aqi

def fetch_pollution_data(location: str, date: str = None) -> list:
    return load_pollution_data(location, date)

def fetch_citizen_reports(location: str) -> list:
    return load_citizen_reports(location)

def compute_aqi_from_data(data: list) -> dict:
    if not data:
        return {"aqi_score": 0, "level": "vert", "details": {}}
    latest = data[-1]
    return calculate_aqi(
        so2=float(latest.get("SO2_µg_m3", 0)),
        pm25=float(latest.get("PM2.5_µg_m3", 0)),
        no2=float(latest.get("NO2_µg_m3", 0))
    )
