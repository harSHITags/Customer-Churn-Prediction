from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.services.predictor import predictor_service
from app.routers import predict, analytics, model_info

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load ML models and cache analytics on startup
    predictor_service.load_models()
    yield
    # Clean up (none required for now)

app = FastAPI(
    title="Customer Churn Prediction Service",
    description="Machine Learning Service for predicting bank customer churn with SHAP explainability.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(predict.router)
app.include_router(analytics.router)
app.include_router(model_info.router)

@app.get("/health")
def health_check():
    """
    Service health check endpoint.
    """
    return {
        "status": "ok",
        "model_loaded": predictor_service.model_loaded,
        "analytics_computed": predictor_service.analytics_summary is not None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.API_HOST, port=settings.API_PORT, reload=True)
