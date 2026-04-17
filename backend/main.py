from fastapi import FastAPI

from features.hello.routes import router as hello_router

app = FastAPI(title="H12 AI Healing API")

app.include_router(hello_router)
