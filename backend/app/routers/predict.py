import io
import csv
import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.schemas import (
    CustomerInput, 
    PredictionResponse, 
    BatchPredictionRequest, 
    BatchPredictionResponse,
    ShapFeature
)
from app.services.predictor import predictor_service

router = APIRouter(prefix="", tags=["Predictions"])

@router.post("/predict", response_model=PredictionResponse)
def predict_single_customer(customer: CustomerInput):
    """
    Predict churn probability, risk tier, and get retention recommendations for a single customer.
    """
    try:
        customer_dict = customer.dict()
        return predictor_service.predict_single(customer_dict)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"An error occurred during prediction: {str(e)}"
        )

@router.post("/predict/batch", response_model=BatchPredictionResponse)
def predict_batch_customers(request: BatchPredictionRequest):
    """
    Predict churn probability, risk tier, and get retention recommendations for a list of customers.
    """
    try:
        results = []
        churners = 0
        for customer in request.customers:
            res = predictor_service.predict_single(customer.dict())
            results.append(res)
            if res.churn_prediction == 1:
                churners += 1
                
        total = len(results)
        churn_rate = (churners / total) if total > 0 else 0.0
        
        return BatchPredictionResponse(
            total=total,
            churners=churners,
            churn_rate=churn_rate,
            results=results
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"An error occurred during batch prediction: {str(e)}"
        )

@router.post("/predict/csv", response_model=BatchPredictionResponse)
async def predict_csv_file(file: UploadFile = File(...)):
    """
    Upload a CSV file of customer data, validate fields, and return prediction results for all rows.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")
        
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(
            status_code=400, 
            detail=f"Failed to parse CSV file: {str(e)}"
        )
        
    # Validate required columns
    required_cols = [
        "CreditScore", "Geography", "Gender", "Age", "Tenure", 
        "Balance", "NumOfProducts", "HasCrCard", "IsActiveMember", "EstimatedSalary"
    ]
    
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        raise HTTPException(
            status_code=400, 
            detail=f"CSV is missing required columns: {', '.join(missing_cols)}"
        )
        
    try:
        # Check if model is loaded
        if not predictor_service.model_loaded:
            raise HTTPException(status_code=503, detail="Model artifacts not loaded")
            
        # Convert columns to correct types
        df["CreditScore"] = df["CreditScore"].astype(float)
        df["Geography"] = df["Geography"].astype(str)
        df["Gender"] = df["Gender"].astype(str)
        df["Age"] = df["Age"].astype(float)
        df["Tenure"] = df["Tenure"].astype(float)
        df["Balance"] = df["Balance"].astype(float)
        df["NumOfProducts"] = df["NumOfProducts"].astype(int)
        df["HasCrCard"] = df["HasCrCard"].astype(int)
        df["IsActiveMember"] = df["IsActiveMember"].astype(int)
        df["EstimatedSalary"] = df["EstimatedSalary"].astype(float)
        
        # Batch Preprocess
        df_clean = df[required_cols]
        df_trans = predictor_service.preprocessor.transform(df_clean)
        
        # Batch Predict
        probs = predictor_service.ensemble.predict_proba(df_trans)[:, 1]
        
        # Batch SHAP (only if dataset has <= 500 rows to ensure sub-second response)
        try:
            if len(df) <= 500:
                sv = predictor_service.explainer.shap_values(df_trans)
                if isinstance(sv, list):
                    sv_arr = sv[1] if len(sv) > 1 else sv[0]
                else:
                    sv_arr = sv
            else:
                sv_arr = None
        except Exception as e:
            print(f"Batch SHAP failed: {e}")
            sv_arr = None
            
        results = []
        churners = 0
        from app.services.predictor import get_risk_tier, get_confidence
        from app.services.preprocessor import FEATURE_NAMES
        from app.services.recommender import get_retention_recommendations
        
        # Loop through rows and construct prediction responses using precomputed arrays
        for i in range(len(df)):
            prob = float(probs[i])
            pred = int(prob >= predictor_service.threshold)
            if pred == 1:
                churners += 1
                
            risk_tier = get_risk_tier(prob)
            confidence = get_confidence(prob)
            row = df.iloc[i]
            
            # Extract top SHAP features
            shap_explanation = []
            if sv_arr is not None:
                row_sv = sv_arr[i]
                pairs = sorted(
                    zip(FEATURE_NAMES, row_sv), 
                    key=lambda x: abs(x[1]), 
                    reverse=True
                )
                shap_explanation = [
                    ShapFeature(
                        feature=f,
                        shap_value=round(float(v), 4),
                        direction="increases_churn" if v > 0 else "decreases_churn"
                    )
                    for f, v in pairs[:5]
                ]
            else:
                # Rule-based fallback for large datasets to keep recommendations accurate
                if row["Age"] > 40:
                    shap_explanation.append(ShapFeature(feature="Age", shap_value=0.2, direction="increases_churn"))
                if row["NumOfProducts"] >= 3:
                    shap_explanation.append(ShapFeature(feature="NumOfProducts", shap_value=0.3, direction="increases_churn"))
                if row["IsActiveMember"] == 0:
                    shap_explanation.append(ShapFeature(feature="IsActiveMember", shap_value=0.25, direction="increases_churn"))
                if row["Balance"] == 0:
                    shap_explanation.append(ShapFeature(feature="Balance", shap_value=0.15, direction="increases_churn"))
                if row["Geography"] == "Germany":
                    shap_explanation.append(ShapFeature(feature="Geography", shap_value=0.1, direction="increases_churn"))
                
                # Default fill to ensure at least some attribution data exists
                if not shap_explanation:
                    shap_explanation.append(ShapFeature(feature="CreditScore", shap_value=-0.05, direction="decreases_churn"))
                
            # Get retention recommendations
            shap_dicts = [f.dict() for f in shap_explanation]
            retention_actions = get_retention_recommendations(shap_dicts, row.to_dict())
            
            results.append(
                PredictionResponse(
                    churn_probability=prob,
                    churn_prediction=pred,
                    risk_tier=risk_tier,
                    confidence=confidence,
                    shap_explanation=shap_explanation,
                    retention_actions=retention_actions,
                    model_version="1.0.0",
                    processing_time_ms=0.0
                )
            )
            
        total = len(results)
        churn_rate = (churners / total) if total > 0 else 0.0
        
        return BatchPredictionResponse(
            total=total,
            churners=churners,
            churn_rate=churn_rate,
            results=results
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"An error occurred during CSV batch prediction: {str(e)}"
        )
