from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import transparency, recycling, orchestrator
from fastapi.staticfiles import StaticFiles
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    description="Plateforme multi-agent IA pour la transparence environnementale et le recyclage à Gabès",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transparency.router, prefix="/transparency", tags=["🏭 Transparency Agent"])
app.include_router(recycling.router, prefix="/recycling", tags=["♻️ Recycling Agent"])
app.include_router(orchestrator.router, prefix="/orchestrator", tags=["🧠 Orchestrator"])

import os
os.makedirs("app/static", exist_ok=True)
app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "message": f"{settings.APP_NAME} is running 🌿"}
