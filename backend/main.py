import os
import logging
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Ensure local backend/.env is loaded regardless of current working directory.
load_dotenv(dotenv_path=Path(__file__).with_name(".env"), override=False)

from features.hello.routes import router as hello_router
from features.audit.routes import router as audit_router
from features.scrapers.routes import router as scraping_router
from features.analysis.routes import router as analysis_router
from features.analysis.seed import seed_data
from features.analytics.routes import router as analytics_router

app = FastAPI(title="H12 AI Healing API", version="1.0.0")

# CORS — allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)

default_cors_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://synaptechh12.vercel.app",
]

cors_origins_env = os.getenv("BACKEND_CORS_ORIGINS", "")
env_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]
allowed_origins = env_origins or default_cors_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(hello_router)
app.include_router(audit_router)
app.include_router(scraping_router)
app.include_router(analysis_router)
app.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])


@app.on_event("startup")
def on_startup():
    result = seed_data()
    print(f"[Seed] {result}")
