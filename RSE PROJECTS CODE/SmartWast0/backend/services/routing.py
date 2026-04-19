import math

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return distance

def calculate_route(start_point, bins):
    unvisited = list(bins)
    current_point = start_point
    
    route = [start_point] # represents depot
    
    # 1. Nearest Neighbor
    while unvisited:
        nearest_bin = None
        min_dist = float('inf')
        for b in unvisited:
            dist = haversine(current_point["lat"], current_point["lng"], b["lat"], b["lng"])
            if dist < min_dist:
                min_dist = dist
                nearest_bin = b
        
        route.append(nearest_bin)
        current_point = nearest_bin
        unvisited.remove(nearest_bin)
        
    route.append(start_point) # return to depot
    
    # 2. 2-opt local search
    def calculate_total_distance(r):
        dist = 0
        for i in range(len(r) - 1):
            dist += haversine(r[i]["lat"], r[i]["lng"], r[i+1]["lat"], r[i+1]["lng"])
        return dist
        
    best_route = route
    best_distance = calculate_total_distance(best_route)
    
    for _ in range(200): # max 200 iterations
        improved = False
        for i in range(1, len(best_route) - 2):
            for j in range(i + 1, len(best_route) - 1):
                new_route = best_route[:i] + best_route[i:j+1][::-1] + best_route[j+1:]
                new_distance = calculate_total_distance(new_route)
                # Critère d'amélioration
                if new_distance - best_distance < -1e-6:
                    best_route = new_route
                    best_distance = new_distance
                    improved = True
                    break
            if improved:
                break
        if not improved:
            break
            
    return best_route, best_distance
