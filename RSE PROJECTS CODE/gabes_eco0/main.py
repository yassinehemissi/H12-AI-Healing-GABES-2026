import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routers import orchestrator, recycling, transparency, upcycling
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    description="Plateforme multi-agent IA pour la transparence environnementale, le recyclage et l'upcycling a Gabes",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transparency.router, prefix="/transparency", tags=["Transparency Agent"])
app.include_router(recycling.router, prefix="/recycling", tags=["Recycling Agent"])
app.include_router(upcycling.router, prefix="/upcycling", tags=["Upcycling"])
app.include_router(orchestrator.router, prefix="/orchestrator", tags=["Orchestrator"])

# We keep static assets in the same FastAPI app so generated upcycling images are served directly.
os.makedirs("app/static", exist_ok=True)
app.mount("/static", StaticFiles(directory="app/static"), name="static")


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "message": f"{settings.APP_NAME} is running"}
