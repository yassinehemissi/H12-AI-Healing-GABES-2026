import sys
import os

# Add current directory to path so we can import from backend
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

print("--- Testing / ---")
response = client.get("/")
print("Status Code:", response.status_code)
print("Response:", response.json())
print("\n--- Testing /bins ---")
response = client.get("/bins")
print("Status Code:", response.status_code)
print("Count:", len(response.json()))
print("\n--- Testing /collect ---")
response = client.get("/collect")
print("Status Code:", response.status_code)
if response.status_code == 200:
    data = response.json()
    print("Collection ID:", data["collection_id"])
    print("Truck Info:", data["truck_info"])
    print("Total Bins:", data["total_bins"])
    print("Total Distance (km):", data["total_distance_km"])
    print("Estimated Duration (min):", data["stats"]["estimated_duration_min"])
    print("Route Length:", len(data["route"]))
else:
    print(response.text)

print("\n--- Testing /simulate ---")
response = client.get("/simulate?runs=2")
print("Status Code:", response.status_code)
if response.status_code == 200:
    data = response.json()
    print("Runs:", data["runs"])
    print("Results:", data["results"])
else:
    print(response.text)
