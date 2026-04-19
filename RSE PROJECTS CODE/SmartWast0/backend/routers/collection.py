from fastapi import APIRouter, Query
from typing import Optional
import random
import uuid

from models.schemas import CollectionResponse, SimulationResponse
from services.selector import select_bins, get_all_bins
from services.truck import get_truck_for_bins
from services.routing import calculate_route

router = APIRouter()

DEPOT = {"lat": 33.8815, "lng": 10.0982}

@router.get("/bins")
def get_bins():
    return get_all_bins()

@router.get("/collect", response_model=CollectionResponse, response_model_exclude_none=True)
def collect(n: int = Query(None, ge=50, le=80)):
    if n is None:
        n = random.randint(50, 80)
        
    selected_bins = select_bins(n)
    truck_info = get_truck_for_bins(n)
    
    route_points, total_distance = calculate_route(DEPOT, selected_bins)
    
    avg_fill = sum(b["fill_level"] for b in selected_bins) / len(selected_bins) if selected_bins else 0
    critical_bins = sum(1 for b in selected_bins if b["fill_level"] >= 80)
    estimated_duration = round((total_distance / 30) * 60 + len(selected_bins) * 1.5, 0)
    
    final_route = []
    for idx, pt in enumerate(route_points):
        if "id" not in pt:
            # Depot
            label = "Dépôt — Départ" if idx == 0 else "Dépôt — Retour"
            final_route.append({
                "order": idx,
                "type": "depot",
                "lat": pt["lat"],
                "lng": pt["lng"],
                "label": label
            })
        else:
            final_route.append({
                "order": idx,
                "type": "bin",
                "id": pt["id"],
                "lat": pt["lat"],
                "lng": pt["lng"],
                "fill_level": pt["fill_level"]
            })
            
    return {
        "collection_id": str(uuid.uuid4())[:8].upper(),
        "truck_start": DEPOT,
        "truck_info": truck_info,
        "total_bins": len(selected_bins),
        "total_distance_km": round(total_distance, 2),
        "stats": {
            "avg_fill_level": round(avg_fill, 1),
            "critical_bins_count": critical_bins,
            "estimated_duration_min": estimated_duration
        },
        "bins_selected": selected_bins,
        "route": final_route
    }

@router.get("/simulate", response_model=SimulationResponse)
def simulate(runs: int = Query(5, ge=1, le=20)):
    results = []
    for _ in range(runs):
        n = random.randint(50, 80)
        selected_bins = select_bins(n)
        truck_info = get_truck_for_bins(n)
        _, total_distance = calculate_route(DEPOT, selected_bins)
        
        avg_fill = sum(b["fill_level"] for b in selected_bins) / len(selected_bins) if selected_bins else 0
        estimated_duration = round((total_distance / 30) * 60 + len(selected_bins) * 1.5, 0)
        
        results.append({
            "num_bins": len(selected_bins),
            "truck_type": truck_info["type"],
            "distance_km": round(total_distance, 2),
            "avg_fill": round(avg_fill, 1),
            "estimated_duration_min": estimated_duration
        })
        
    return {"runs": runs, "results": results}
