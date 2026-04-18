def calculate_aqi(so2: float, pm25: float, no2: float) -> dict:
    """
    Calcul simplifié de l'AQI basé sur les seuils OMS :
    - SO2 : seuil 40 µg/m³, danger > 200
    - PM2.5 : seuil 15 µg/m³, danger > 75
    - NO2 : seuil 40 µg/m³, danger > 200
    """
    
    # Simple linear interpolation for demonstration purposes
    so2_index = (so2 / 40.0) * 50
    pm25_index = (pm25 / 15.0) * 50
    no2_index = (no2 / 40.0) * 50
    
    max_index = max(so2_index, pm25_index, no2_index)
    
    level = "vert"
    if max_index > 150:
        level = "rouge"
    elif max_index > 100:
        level = "orange"
    elif max_index > 50:
        level = "jaune"
        
    return {
        "aqi_score": round(max_index, 1),
        "level": level,
        "details": {
            "SO2_index": round(so2_index, 1),
            "PM2.5_index": round(pm25_index, 1),
            "NO2_index": round(no2_index, 1)
        }
    }
