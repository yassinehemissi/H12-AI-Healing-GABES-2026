from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path

# Load .env from the same directory as this file, regardless of cwd
load_dotenv(dotenv_path=Path(__file__).parent / ".env")

from features.hello.routes import router as hello_router
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

app.include_router(hello_router)
app.include_router(scraping_router)
app.include_router(analysis_router)
app.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])


@app.on_event("startup")
def on_startup():
    result = seed_data()
    print(f"[Seed] {result}")