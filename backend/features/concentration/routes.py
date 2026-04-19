from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from typing import Dict, List
import httpx
import math
import random
from datetime import datetime

router = APIRouter()

# ====== CONFIGURATION ======
GCT_LAT = 33.9100  # Latitude corrigée au sud de Ghannouch (Terre)
GCT_LON = 10.0900  # Longitude corrigée (Terre)

# Zone Industrielle Secondaire (Zone Industrielle Gabès)
ZI_LAT = 33.8800
ZI_LON = 10.1000

# Updated emission rate for NH3 to simulate realistic high concentrations
EMISSION_RATE_KG_S = 20.0  # Encore augmenté pour générer plus de points rouges et oranges
ZI_EMISSION_RATE_KG_S = 0.1  # Encore augmenté pour la zone industrielle secondaire

# --- SEUILS LOGIQUES POUR L'AIR AMBIANT (OMS/NIOSH adaptés) ---
RISK_THRESHOLDS = {
    "FAIBLE": {"min": 0, "max": 50, "color": "#2ecc71", "emoji": "✓"},
    "MOYEN": {"min": 50, "max": 200, "color": "#f39c12", "emoji": "⚠"},
    "ÉLEVÉ": {"min": 200, "max": float('inf'), "color": "#e74c3c", "emoji": "⚠⚠"}
}

# Define thresholds in µg/m³
THRESHOLDS = {
    "medium": 50,   # Green < 50, Orange >= 50
    "high": 200,   # Red >= 200
}

def get_point_color(concentration_ug_m3):
    """
    Determines the color of a point based on its NH3 concentration in µg/m³.
    """
    if concentration_ug_m3 < THRESHOLDS["medium"]:
        return "#2ecc71" # Green
    elif concentration_ug_m3 < THRESHOLDS["high"]:
        return "#f39c12" # Orange
    else:
        return "#e74c3c" # Red

# ====== FONCTIONS UTILITAIRES ======

async def get_meteo(lat: float, lon: float) -> Dict:
    """Récupère les données météorologiques actuelles en temps réel"""
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true"
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
            
            current = data.get('current_weather', {})
            wind_speed = current.get('windspeed', 0.1) or 0.1
            wind_direction = current.get('winddirection', 0)
            temperature = current.get('temperature', 20)
            
            return {
                'temperature': round(temperature, 2),
                'wind_speed': round(wind_speed, 2),
                'wind_direction': round(wind_direction, 1),
                'timestamp': datetime.now().isoformat()
            }
    except Exception as e:
        print(f"Erreur météo: {e}")
        return {
            'temperature': 25.0,
            'wind_speed': 5.0,
            'wind_direction': 180.0,
            'timestamp': datetime.now().isoformat()
        }

def gaussian_plume(x, y, H, Q, u, sigma_y, sigma_z):
    """Modèle de dispersion gaussienne pour calcul de concentration"""
    if u <= 0:
        u = 0.1
    if sigma_y <= 0 or sigma_z <= 0:
        return 0
    
    part1 = Q / (2 * math.pi * u * sigma_y * sigma_z)
    part2 = math.exp(-0.5 * (y / sigma_y) ** 2)
    part3 = math.exp(-0.5 * ((0 - H) / sigma_z) ** 2)
    return max(part1 * part2 * part3, 0)

def get_dispersion_coefficients(distance):
    """Coefficients de Pasquill-Gifford (terrain urbain, classe D)"""
    distance = abs(distance) if distance != 0 else 100
    sigma_y = 0.08 * distance * (1 + 0.0002 * distance) ** -0.5
    sigma_z = 0.06 * distance * (1 + 0.0015 * distance) ** -0.5
    return max(sigma_y, 0.1), max(sigma_z, 0.1)

def get_risk_info(conc_ugm3):
    """Retourne les infos de risque basées sur la concentration"""
    for level, info in RISK_THRESHOLDS.items():
        if info["min"] <= conc_ugm3 <= info["max"]:
            return {
                "level": level,
                "color": info["color"],
                "emoji": info["emoji"],
                "description": f"Concentration: {conc_ugm3:.1f} µg/m³"
            }
    return {
        "level": "ÉLEVÉ",
        "color": RISK_THRESHOLDS["ÉLEVÉ"]["color"],
        "emoji": RISK_THRESHOLDS["ÉLEVÉ"]["emoji"],
        "description": f"Concentration: {conc_ugm3:.1f} µg/m³"
    }

def get_quartier(lat, lon):
    """Simule le nom du quartier de Gabès basé sur des coordonnées grossières"""
    if lat > 33.915: return "Ghannouch"
    elif lat < 33.875: return "Teboulbou"
    elif lon < 10.080: return "Bouchema"
    elif lon > 10.105: return "Chatt Essalam"
    else: return "Gabès Centre"

# ====== ENDPOINTS API ======

@router.get("/meteo")
async def get_weather():
    """Endpoint météo en temps réel"""
    meteo = await get_meteo(GCT_LAT, GCT_LON)
    return JSONResponse(meteo)

@router.get("/concentration")
async def concentration(
    latitude: float = Query(..., description="Latitude du point"),
    longitude: float = Query(..., description="Longitude du point")
):
    """Calcule la concentration NH3 pour un point spécifique"""
    try:
        meteo = await get_meteo(GCT_LAT, GCT_LON)
        u = meteo['wind_speed']
        theta = meteo['wind_direction']
        temp = meteo['temperature']

        # Transformation en coordonnées relatives
        dx = (latitude - GCT_LAT) * 111_000
        dy = (longitude - GCT_LON) * 92_000 * math.cos(math.radians(GCT_LAT))
        wind_rad = math.radians(theta)
        x = dx * math.cos(wind_rad) + dy * math.sin(wind_rad)
        y = -dx * math.sin(wind_rad) + dy * math.cos(wind_rad)

        # Calcul de concentration
        H = 60  # hauteur cheminée (m)
        Q = EMISSION_RATE_KG_S * 1e6 / 60  # µg/s
        sigma_y, sigma_z = get_dispersion_coefficients(abs(x))
        conc = gaussian_plume(abs(x), y, H, Q, u, sigma_y, sigma_z)
        risk = get_risk_info(conc)

        return JSONResponse({
            "coordinates": {"latitude": latitude, "longitude": longitude},
            "concentration_ugm3": round(conc, 2),
            "risk": risk,
            "meteo": meteo
        })
    except Exception as e:
        return JSONResponse(
            {"error": str(e)},
            status_code=500
        )

@router.get("/concentrations-grid")
async def get_concentrations_grid():
    """Retourne grille de concentrations pour la carte interactive"""
    try:
        meteo = await get_meteo(GCT_LAT, GCT_LON)
        u = meteo['wind_speed']
        theta = meteo['wind_direction']
        temp = meteo['temperature']

        points_data = []
        max_conc = 0
        min_conc = float('inf')

        # Grille élargie recentrée sur la zone urbaine/industrielle
        for dx in range(-8000, 8000, 100):  # Reduced step size from 200 to 100
            for dy in range(-8000, 8000, 100):  # Reduced step size from 200 to 100
                # Ajout de variation aléatoire pour casser l'aspect quadrillé strict et le rendre plus organique
                dx_jitter = dx + random.uniform(-100, 100)
                dy_jitter = dy + random.uniform(-100, 100)
                
                lat = GCT_LAT + (dx_jitter / 111_000)
                lon = GCT_LON + (dy_jitter / (111_000 * math.cos(math.radians(GCT_LAT))))

                # Exclure la position purement en mer lointaine
                if lon > 10.130:
                    continue

                # Paramètres vent globaux
                wind_rad = math.radians(theta)

                # ==========================================
                # Calcul Source 1: Groupe Chimique (Ghannouch)
                # ==========================================
                x_rot_1 = dx_jitter * math.cos(wind_rad) + dy_jitter * math.sin(wind_rad)
                y_rot_1 = -dx_jitter * math.sin(wind_rad) + dy_jitter * math.cos(wind_rad)
                
                H1 = 60
                Q1 = EMISSION_RATE_KG_S * 1e6 * 2.5
                sigma_y1, sigma_z1 = get_dispersion_coefficients(abs(x_rot_1))
                conc1 = gaussian_plume(abs(x_rot_1), y_rot_1, H1, Q1, u, sigma_y1, sigma_z1)

                # ==========================================
                # Calcul Source 2: Zone Industrielle Gabès
                # ==========================================
                # Distance relative par rapport à la Source 2
                dx_zi = (lat - ZI_LAT) * 111_000
                dy_zi = (lon - ZI_LON) * 111_000 * math.cos(math.radians(ZI_LAT))
                
                x_rot_2 = dx_zi * math.cos(wind_rad) + dy_zi * math.sin(wind_rad)
                y_rot_2 = -dx_zi * math.sin(wind_rad) + dy_zi * math.cos(wind_rad)
                
                H2 = 30 # Cheminées plus basses
                Q2 = ZI_EMISSION_RATE_KG_S * 1e6 * 1.5 
                sigma_y2, sigma_z2 = get_dispersion_coefficients(abs(x_rot_2))
                conc2 = gaussian_plume(abs(x_rot_2), y_rot_2, H2, Q2, u, sigma_y2, sigma_z2)

                # Concentration Totale
                conc = conc1 + conc2
                
                # Bruit de fond vert aléatoire pour représenter le taux ambiant faible
                if conc < 0.05 and random.random() > 0.05: # 95% des points invisibles
                    continue
                elif conc < 0.05:
                    conc = random.uniform(0.05, 0.4) # Ajout artificiel de petits points verts alentours

                max_conc = max(max_conc, conc)
                min_conc = min(min_conc, conc)

                risk = get_risk_info(conc)
                quartier = get_quartier(lat, lon)
                
                points_data.append({
                    "latitude": round(lat, 6),
                    "longitude": round(lon, 6),
                    "concentration": round(conc, 2),
                    "risk_level": risk["level"],
                    "color": risk["color"],
                    "quartier": quartier
                })

        # Tri décroissant pour le tableau
        points_data = sorted(points_data, key=lambda p: p["concentration"], reverse=True)

        return JSONResponse({
            "source": "GCT Ghannouch",
            "source_coords": {"latitude": GCT_LAT, "longitude": GCT_LON},
            "meteo": meteo,
            "stats": {
                "max_concentration": round(max_conc, 2),
                "min_concentration": round(min_conc, 2),
                "avg_concentration": round(sum(p["concentration"] for p in points_data) / len(points_data), 2),
                "total_points": len(points_data)
            },
            "points": points_data
        })
    except Exception as e:
        return JSONResponse(
            {"error": str(e)},
            status_code=500
        )

# ====== SCHEDULER ======
def start_scheduler():
    """Placeholder pour scheduler futur"""
    pass
