import os
import json
from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.config import settings
from app.models.schemas import ModelInfoResponse

router = APIRouter(prefix="/model", tags=["Model Info"])

def load_metrics_file():
    if not os.path.exists(settings.METRICS_PATH):
        raise HTTPException(
            status_code=503, 
            detail="Model evaluation metrics are not available."
        )
    try:
        with open(settings.METRICS_PATH, "r") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to read model metrics: {str(e)}"
        )

@router.get("/info", response_model=ModelInfoResponse)
def get_model_info():
    """
    Get detailed information about the model, including architecture details,
    accuracy, F1-score, ROC-AUC, testing details, and confusion matrix.
    """
    metrics = load_metrics_file()
    
    # Calculate last trained time dynamically from file metadata
    last_trained = "Unknown"
    if os.path.exists(settings.MODEL_PATH):
        mtime = os.path.getmtime(settings.MODEL_PATH)
        last_trained = datetime.fromtimestamp(mtime).strftime("%Y-%m-%d %H:%M:%S")
        
    return ModelInfoResponse(
        model_type=metrics.get("model_type", "Soft Voting Ensemble (Random Forest + XGBoost)"),
        training_samples=metrics.get("training_samples", 8000),
        testing_samples=metrics.get("testing_samples", 2000),
        feature_count=metrics.get("feature_count", 17),
        roc_auc=metrics.get("roc_auc", 0.8444),
        f1_score=metrics.get("macro_f1", 0.69), # Use macro_f1 or accuracy depending on key
        last_trained=last_trained,
        confusion_matrix=metrics.get("confusion_matrix", {}),
        feature_importances=metrics.get("feature_importances", [])
    )

@router.get("/feature-importances")
def get_feature_importances():
    """
    Retrieve feature importances sorted descending.
    """
    metrics = load_metrics_file()
    return metrics.get("feature_importances", [])
