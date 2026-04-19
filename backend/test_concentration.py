import asyncio
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_concentration_endpoint():
    # Point proche de l'usine GCT
    params = {"latitude": 33.937, "longitude": 10.111}
    response = client.get("/concentration", params=params)
    assert response.status_code == 200
    data = response.json()
    assert "nh3_concentration_ugm3" in data
    assert "risk_level" in data
    print("Réponse:", data)

if __name__ == "__main__":
    test_concentration_endpoint()
