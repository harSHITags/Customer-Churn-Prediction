import os
import json
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE
import shap

# Ensure app package is in python path
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.preprocessor import get_preprocessor_pipeline, FEATURE_NAMES

def main():
    print("=== Churn Model Training Pipeline ===")
    
    # Define paths
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    data_path = os.path.join(base_dir, "data", "churn_data.csv")
    artifacts_dir = os.path.join(base_dir, "ml", "artifacts")
    os.makedirs(artifacts_dir, exist_ok=True)
    
    # Load dataset
    print(f"Loading data from {data_path}...")
    df = pd.read_csv(data_path)
    
    # Separate features and target
    X = df.drop(columns=['Exited'])
    y = df['Exited']
    
    # Stratified Train/Test split (80/20)
    print("Splitting dataset...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    
    # Fit and save Preprocessor Pipeline
    print("Fitting preprocessing pipeline...")
    preprocessor_pipeline = get_preprocessor_pipeline()
    
    # Fit the pipeline
    X_train_trans = preprocessor_pipeline.fit_transform(X_train, y_train)
    X_test_trans = preprocessor_pipeline.transform(X_test)
    
    # Save the preprocessor
    preprocessor_path = os.path.join(artifacts_dir, "preprocessor.pkl")
    print(f"Saving preprocessor to {preprocessor_path}...")
    joblib.dump(preprocessor_pipeline, preprocessor_path)
    
    # Save feature names list
    feature_names_path = os.path.join(artifacts_dir, "feature_names.json")
    print(f"Saving feature names to {feature_names_path}...")
    with open(feature_names_path, "w") as f:
        json.dump(FEATURE_NAMES, f, indent=2)
        
    # Handle Class Imbalance with SMOTE on training data only
    print("Applying SMOTE to handle class imbalance...")
    smote = SMOTE(random_state=42)
    X_train_res, y_train_res = smote.fit_resample(X_train_trans, y_train)
    print(f"Original training size: {X_train_trans.shape[0]} ({np.sum(y_train)} positive)")
    print(f"Resampled training size: {X_train_res.shape[0]} ({np.sum(y_train_res)} positive)")
    
    # Define models
    rf = RandomForestClassifier(
        n_estimators=300,
        max_depth=8,
        min_samples_leaf=4,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )
    
    xgb = XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        scale_pos_weight=3,  # handles class imbalance
        eval_metric='logloss',
        random_state=42,
        use_label_encoder=False
    )
    
    # Soft voting ensemble
    ensemble = VotingClassifier(
        estimators=[('rf', rf), ('xgb', xgb)],
        voting='soft',
        weights=[1, 2]
    )
    
    # Hyperparameter tuning using RandomizedSearchCV
    print("Running hyperparameter tuning (RandomizedSearchCV)...")
    param_dist = {
        'rf__max_depth': [6, 8, 10],
        'rf__min_samples_leaf': [2, 4, 6],
        'xgb__max_depth': [4, 6, 8],
        'xgb__learning_rate': [0.02, 0.05, 0.1]
    }
    
    # Set n_iter=15 to balance thoroughness and execution time
    search = RandomizedSearchCV(
        estimator=ensemble,
        param_distributions=param_dist,
        n_iter=15,
        scoring='f1',
        cv=5,
        random_state=42,
        n_jobs=-1
    )
    
    search.fit(X_train_res, y_train_res)
    print("Best hyperparameters found:", search.best_params_)
    best_model = search.best_estimator_
    
    # Save the ensemble model
    model_path = os.path.join(artifacts_dir, "ensemble_model.pkl")
    print(f"Saving ensemble model to {model_path}...")
    joblib.dump(best_model, model_path)
    
    # Extract the fitted XGBoost model from the ensemble to construct the SHAP explainer
    print("Initializing and saving SHAP TreeExplainer from XGBoost...")
    best_xgb = best_model.named_estimators_['xgb']
    
    # Initialize TreeExplainer (uses the fitted model's tree nodes, no background data required)
    explainer = shap.TreeExplainer(best_xgb)
    explainer_path = os.path.join(artifacts_dir, "shap_explainer.pkl")
    joblib.dump(explainer, explainer_path)
    print(f"SHAP TreeExplainer saved to {explainer_path}")
    
    print("=== Training Pipeline Complete ===")

if __name__ == "__main__":
    main()
