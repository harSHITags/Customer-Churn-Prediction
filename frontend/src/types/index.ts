export interface CustomerInput {
  CreditScore: number;
  Geography: string;
  Gender: string;
  Age: number;
  Tenure: number;
  Balance: number;
  NumOfProducts: number;
  HasCrCard: number; // 0 or 1
  IsActiveMember: number; // 0 or 1
  EstimatedSalary: number;
}

export interface ShapFeature {
  feature: string;
  shap_value: number;
  direction: 'increases_churn' | 'decreases_churn';
}

export interface PredictionResponse {
  churn_probability: number;
  churn_prediction: number; // 0 or 1
  risk_tier: 'Low' | 'Medium' | 'High';
  confidence: 'Low' | 'Medium' | 'High';
  shap_explanation: ShapFeature[];
  retention_actions: string[];
  model_version: string;
  processing_time_ms: number;
}

export interface BatchPredictionResponse {
  total: number;
  churners: number;
  churn_rate: number;
  results: PredictionResponse[];
}

export interface ModelInfoResponse {
  model_type: string;
  training_samples: number;
  testing_samples: number;
  feature_count: number;
  roc_auc: number;
  f1_score: number;
  last_trained: string;
  confusion_matrix: {
    TN: number;
    FP: number;
    FN: number;
    TP: number;
  };
  feature_importances: {
    feature: string;
    importance: number;
  }[];
}

export interface AnalyticsSummaryResponse {
  overall_churn_rate: number;
  avg_probability_by_geography: {
    [key: string]: number;
  };
  risk_distribution: {
    Low: number;
    Medium: number;
    High: number;
  };
  total_customers: number;
  churn_by_age_bin: {
    [key: string]: number;
  };
  churn_by_product_count: {
    [key: string]: number;
  };
  churn_by_activity: {
    Active: number;
    Inactive: number;
  };
}
