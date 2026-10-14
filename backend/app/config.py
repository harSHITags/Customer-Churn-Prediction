import os
from pydantic import BaseModel

class Settings(BaseModel):
    # App Settings
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    
    # Path configuration (resolved relative to backend directory)
    BASE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    
    MODEL_PATH: str = os.getenv(
        "MODEL_PATH", 
        os.path.join(BASE_DIR, "ml", "artifacts", "ensemble_model.pkl")
    )
    PREPROCESSOR_PATH: str = os.getenv(
        "PREPROCESSOR_PATH", 
        os.path.join(BASE_DIR, "ml", "artifacts", "preprocessor.pkl")
    )
    FEATURE_NAMES_PATH: str = os.getenv(
        "FEATURE_NAMES_PATH", 
        os.path.join(BASE_DIR, "ml", "artifacts", "feature_names.json")
    )
    SHAP_EXPLAINER_PATH: str = os.getenv(
        "SHAP_EXPLAINER_PATH", 
        os.path.join(BASE_DIR, "ml", "artifacts", "shap_explainer.pkl")
    )
    METRICS_PATH: str = os.getenv(
        "METRICS_PATH", 
        os.path.join(BASE_DIR, "ml", "artifacts", "metrics.json")
    )
    THRESHOLD_PATH: str = os.getenv(
        "THRESHOLD_PATH",
        os.path.join(BASE_DIR, "ml", "artifacts", "threshold.json")
    )
    
    # CORS Settings
    CORS_ORIGINS: list[str] = [
        origin.strip() for origin in os.getenv(
            "CORS_ORIGINS", 
            "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
        ).split(",")
    ]

settings = Settings()
