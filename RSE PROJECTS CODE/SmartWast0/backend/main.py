from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import collection

app = FastAPI(
    title="Smart Waste API — Gabès",
    description="Backend for Smart Waste Management system in Gabès, Tunisia",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(collection.router)

@app.get("/")
def healthcheck():
    return {"status": "ok", "service": "Smart Waste API — Gabès"}
