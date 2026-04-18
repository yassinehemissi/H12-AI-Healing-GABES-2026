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

app = FastAPI(title="H12 AI Healing API")

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)

default_cors_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
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
