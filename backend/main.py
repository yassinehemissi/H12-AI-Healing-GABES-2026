import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="H12 AI Healing API")

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Autorise toutes les origines (peut être restreint à "http://localhost:3000")
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from features.hello.routes import router as hello_router
from features.concentration.routes import router as concentration_router
from features.concentration.routes import start_scheduler

app.include_router(hello_router)
app.include_router(concentration_router)

# Démarrage du planificateur au lancement de l'application
if __name__ == "__main__":
    start_scheduler()
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
