"""
epiML Standalone ML Service Entrypoint
FastAPI application serving microclimate predictions, model training, and model management.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes import router

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Production-ready environmental time-series prediction, model training, and model registry service for epiML."
)

# Enable CORS for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def root():
    return {
        "service": settings.app_name,
        "version": settings.version,
        "docs_url": "/docs",
        "health_check": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=True)
