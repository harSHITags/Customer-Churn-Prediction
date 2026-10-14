from fastapi import APIRouter, HTTPException
from app.services.predictor import predictor_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/summary")
def get_analytics_summary():
    """
    Retrieve aggregate statistics on the customer dataset, including overall churn rate,
    average churn probability by geography, and risk distributions.
    """
    if not predictor_service.model_loaded or predictor_service.analytics_summary is None:
        raise HTTPException(
            status_code=503, 
            detail="Model is not loaded or analytics summary is not initialized."
        )
    return predictor_service.analytics_summary
