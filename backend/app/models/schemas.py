from pydantic import BaseModel, Field

class CustomerInput(BaseModel):
    CreditScore: float = Field(..., example=619.0)
    Geography: str = Field(..., example="France")  # "France" | "Germany" | "Spain"
    Gender: str = Field(..., example="Female")     # "Male" | "Female"
    Age: float = Field(..., example=42.0)
    Tenure: float = Field(..., example=2.0)
    Balance: float = Field(..., example=0.0)
    NumOfProducts: int = Field(..., example=1)
    HasCrCard: int = Field(..., example=1)         # 0 or 1
    IsActiveMember: int = Field(..., example=0)    # 0 or 1
    EstimatedSalary: float = Field(..., example=101348.88)

class ShapFeature(BaseModel):
    feature: str
    shap_value: float
    direction: str          # "increases_churn" | "decreases_churn"

class PredictionResponse(BaseModel):
    churn_probability: float        # 0.0 - 1.0
    churn_prediction: int           # 0 or 1
    risk_tier: str                  # "Low" | "Medium" | "High"
    confidence: str                 # "Low" | "Medium" | "High"
    shap_explanation: list[ShapFeature]
    retention_actions: list[str]
    model_version: str
    processing_time_ms: float

class BatchPredictionRequest(BaseModel):
    customers: list[CustomerInput]

class BatchPredictionResponse(BaseModel):
    total: int
    churners: int
    churn_rate: float
    results: list[PredictionResponse]

class ModelInfoResponse(BaseModel):
    model_type: str
    training_samples: int
    testing_samples: int
    feature_count: int
    roc_auc: float
    f1_score: float
    last_trained: str
    confusion_matrix: dict
    feature_importances: list[dict]
