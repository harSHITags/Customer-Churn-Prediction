import os
import time
import json
import joblib
import pandas as pd
import numpy as np
from fastapi import HTTPException

from app.config import settings
from app.models.schemas import PredictionResponse, ShapFeature
from app.services.recommender import get_retention_recommendations
from app.services.preprocessor import FEATURE_NAMES

def get_risk_tier(prob: float) -> str:
    if prob < 0.35:
        return "Low"
    if prob < 0.65:
        return "Medium"
    return "High"

def get_confidence(prob: float) -> str:
    if prob < 0.2 or prob > 0.8:
        return "High"
    if prob < 0.35 or prob > 0.65:
        return "Medium"
    return "Low"

class PredictorService:
    def __init__(self):
        self.ensemble = None
        self.preprocessor = None
        self.explainer = None
        self.threshold = 0.5
        self.model_loaded = False
        self.analytics_summary = None
        
    def load_models(self):
        try:
            print("Loading machine learning models...")
            
            # Check model files exist
            if not os.path.exists(settings.MODEL_PATH):
                print(f"Model path {settings.MODEL_PATH} not found.")
                return
            if not os.path.exists(settings.PREPROCESSOR_PATH):
                print(f"Preprocessor path {settings.PREPROCESSOR_PATH} not found.")
                return
            if not os.path.exists(settings.SHAP_EXPLAINER_PATH):
                print(f"SHAP explainer path {settings.SHAP_EXPLAINER_PATH} not found.")
                return
                
            self.ensemble = joblib.load(settings.MODEL_PATH)
            self.preprocessor = joblib.load(settings.PREPROCESSOR_PATH)
            self.explainer = joblib.load(settings.SHAP_EXPLAINER_PATH)
            
            if os.path.exists(settings.THRESHOLD_PATH):
                with open(settings.THRESHOLD_PATH, "r") as f:
                    self.threshold = float(json.load(f).get("threshold", 0.5))
            else:
                self.threshold = 0.5
                
            self.model_loaded = True
            print("All model artifacts loaded successfully. Inference threshold:", self.threshold)
            
            # Compute dataset analytics summary
            self.compute_analytics_summary()
        except Exception as e:
            print(f"Failed to load model artifacts: {e}")
            self.model_loaded = False

    def compute_analytics_summary(self):
        if not self.model_loaded:
            return
        try:
            data_path = os.path.join(settings.BASE_DIR, "data", "churn_data.csv")
            if not os.path.exists(data_path):
                print(f"Data file for analytics not found at: {data_path}")
                return
                
            print("Calculating dataset analytics summary...")
            df = pd.read_csv(data_path)
            
            # Overall churn rate in raw labels
            overall_churn_rate = float(df['Exited'].mean())
            
            # Vectorized predictions
            df_features = df.drop(columns=['Exited'])
            df_trans = self.preprocessor.transform(df_features)
            probs = self.ensemble.predict_proba(df_trans)[:, 1]
            
            # Average probability by Geography
            df_temp = df.copy()
            df_temp['prob'] = probs
            geo_means = df_temp.groupby('Geography')['prob'].mean().to_dict()
            geo_summary = {geo: float(val) for geo, val in geo_means.items()}
            
            # Risk counts
            low_cnt = int(np.sum(probs < 0.35))
            med_cnt = int(np.sum((probs >= 0.35) & (probs < 0.65)))
            high_cnt = int(np.sum(probs >= 0.65))
            
            # Age bin churn rates
            age_under_30 = float(df[df['Age'] < 30]['Exited'].mean()) if len(df[df['Age'] < 30]) > 0 else 0.0
            age_30_45 = float(df[(df['Age'] >= 30) & (df['Age'] < 45)]['Exited'].mean()) if len(df[(df['Age'] >= 30) & (df['Age'] < 45)]) > 0 else 0.0
            age_45_60 = float(df[(df['Age'] >= 45) & (df['Age'] < 60)]['Exited'].mean()) if len(df[(df['Age'] >= 45) & (df['Age'] < 60)]) > 0 else 0.0
            age_60_plus = float(df[df['Age'] >= 60]['Exited'].mean()) if len(df[df['Age'] >= 60]) > 0 else 0.0
            
            age_summary = {
                "Under 30": age_under_30,
                "30-45": age_30_45,
                "45-60": age_45_60,
                "60+": age_60_plus
            }
            
            # Churn by product count
            prod_means = df.groupby('NumOfProducts')['Exited'].mean().to_dict()
            prod_summary = {str(k): float(v) for k, v in prod_means.items()}
            
            # Churn by activity
            active_means = df.groupby('IsActiveMember')['Exited'].mean().to_dict()
            activity_summary = {
                "Active": float(active_means.get(1, 0.0)),
                "Inactive": float(active_means.get(0, 0.0))
            }
            
            self.analytics_summary = {
                "overall_churn_rate": overall_churn_rate,
                "avg_probability_by_geography": geo_summary,
                "risk_distribution": {
                    "Low": low_cnt,
                    "Medium": med_cnt,
                    "High": high_cnt
                },
                "total_customers": len(df),
                "churn_by_age_bin": age_summary,
                "churn_by_product_count": prod_summary,
                "churn_by_activity": activity_summary
            }
            print("Analytics summary calculated successfully.")
        except Exception as e:
            print(f"Failed to compute analytics summary: {e}")


    def predict_single(self, customer_dict: dict) -> PredictionResponse:
        if not self.model_loaded:
            raise HTTPException(
                status_code=503, 
                detail="Model artifacts not loaded"
            )
            
        start_time = time.time()
        
        # Convert dictionary to Pandas DataFrame (single row)
        df_raw = pd.DataFrame([customer_dict])
        
        # Apply preprocessing
        df_trans = self.preprocessor.transform(df_raw)
        
        # Run model prediction
        prob = float(self.ensemble.predict_proba(df_trans)[:, 1][0])
        pred = int(prob >= self.threshold)
        
        # Calculate Risk Tier and Confidence
        risk_tier = get_risk_tier(prob)
        confidence = get_confidence(prob)
        
        # Generate SHAP explanation
        try:
            # Explainer handles the raw values
            sv = self.explainer.shap_values(df_trans)
            if isinstance(sv, list):
                # Handles differences in shap output formats
                sv_arr = sv[1] if len(sv) > 1 else sv[0]
            else:
                sv_arr = sv
                
            row_sv = sv_arr[0]
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
        except Exception as e:
            print(f"SHAP explanation generation failed: {e}")
            shap_explanation = []
            
        # Get retention recommendations
        shap_dicts = [f.dict() for f in shap_explanation]
        retention_actions = get_retention_recommendations(shap_dicts, customer_dict)
        
        processing_time_ms = (time.time() - start_time) * 1000
        
        return PredictionResponse(
            churn_probability=prob,
            churn_prediction=pred,
            risk_tier=risk_tier,
            confidence=confidence,
            shap_explanation=shap_explanation,
            retention_actions=retention_actions,
            model_version="1.0.0",
            processing_time_ms=processing_time_ms
        )

# Global Predictor instance
predictor_service = PredictorService()
