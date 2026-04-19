from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class Point(BaseModel):
    lat: float
    lng: float

class TruckInfo(BaseModel):
    type: str
    capacity: int
    num_serie: str
    description: str

class DistanceStats(BaseModel):
    avg_fill_level: float
    critical_bins_count: int
    estimated_duration_min: float

class Bin(BaseModel):
    id: int
    lat: float
    lng: float
    fill_level: int

class RouteNode(BaseModel):
    order: int
    type: str
    lat: float
    lng: float
    label: Optional[str] = None
    id: Optional[int] = None
    fill_level: Optional[int] = None

class CollectionResponse(BaseModel):
    collection_id: str
    truck_start: Point
    truck_info: TruckInfo
    total_bins: int
    total_distance_km: float
    stats: DistanceStats
    bins_selected: List[Bin]
    route: List[RouteNode]

    model_config = ConfigDict(protected_namespaces=())

class SimulationRun(BaseModel):
    num_bins: int
    truck_type: str
    distance_km: float
    avg_fill: float
    estimated_duration_min: float

class SimulationResponse(BaseModel):
    runs: int
    results: List[SimulationRun]
