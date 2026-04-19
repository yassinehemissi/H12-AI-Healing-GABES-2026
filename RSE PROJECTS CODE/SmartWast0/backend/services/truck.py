TRUCKS = {
    "small": {
        "type": "Small Truck",
        "capacity": 60,
        "num_serie": "SW-12365",
        "description": "Compact — idéal quartiers étroits"
    },
    "big": {
        "type": "Big Truck",
        "capacity": 120,
        "num_serie": "BW-98741",
        "description": "Grande capacité — axes principaux"
    }
}

def get_truck_for_bins(num_bins: int):
    if num_bins <= 60:
        return TRUCKS["small"]
    else:
        return TRUCKS["big"]
