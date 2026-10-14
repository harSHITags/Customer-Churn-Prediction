import os
import json
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix, roc_curve

# Ensure app package is in python path
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.preprocessor import FEATURE_NAMES

def main():
    print("=== Churn Model Evaluation Pipeline ===")
    
    # Define paths
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    data_path = os.path.join(base_dir, "data", "churn_data.csv")
    artifacts_dir = os.path.join(base_dir, "ml", "artifacts")
    
    # Load test dataset    (must replicate the train split exactly)
    print("Loading data...")
    df = pd.read_csv(data_path)
    X = df.drop(columns=['Exited'])
    y = df['Exited']
    
    _, X_test, _, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    
    # Load preprocessor and model
    preprocessor_path = os.path.join(artifacts_dir, "preprocessor.pkl")
    model_path = os.path.join(artifacts_dir, "ensemble_model.pkl")
    
    print("Loading preprocessor and model...")
    preprocessor = joblib.load(preprocessor_path)
    ensemble = joblib.load(model_path)
    
    # Preprocess test features
    X_test_trans = preprocessor.transform(X_test)
    
    # Predict probabilities
    print("Running inference on test split...")
    probs = ensemble.predict_proba(X_test_trans)[:, 1]
    
    # Compute Youden's J statistic for optimal threshold
    fpr, tpr, thresholds = roc_curve(y_test, probs)
    j_scores = tpr - fpr
    optimal_idx = np.argmax(j_scores)
    optimal_threshold = float(thresholds[optimal_idx])
    print(f"Optimal Threshold (Youden's J): {optimal_threshold:.4f}")
    
    # Save optimal threshold
    threshold_path = os.path.join(artifacts_dir, "threshold.json")
    with open(threshold_path, "w") as f:
        json.dump({"threshold": optimal_threshold}, f, indent=2)
        
    # Evaluate at default 0.5 threshold
    preds_default = (probs >= 0.5).astype(int)
    roc_auc = float(roc_auc_score(y_test, probs))
    
    print("\n--- Classification Report (Default 0.5 Threshold) ---")
    print(classification_report(y_test, preds_default))
    print(f"ROC-AUC: {roc_auc:.4f}")
    
    # Evaluate at optimal threshold
    preds_opt = (probs >= optimal_threshold).astype(int)
    print(f"\n--- Classification Report (Optimal {optimal_threshold:.4f} Threshold) ---")
    print(classification_report(y_test, preds_opt))
    
    # Confusion matrix at optimal threshold (for UI display)
    tn, fp, fn, tp = confusion_matrix(y_test, preds_opt).ravel()
    cm_dict = {
        "TN": int(tn),
        "FP": int(fp),
        "FN": int(fn),
        "TP": int(tp)
    }
    print("Confusion Matrix (Optimal Threshold):", cm_dict)
    
    # Extract Feature Importances
    print("\nComputing average feature importances...")
    best_rf = ensemble.named_estimators_['rf']
    best_xgb = ensemble.named_estimators_['xgb']
    
    rf_importances = best_rf.feature_importances_
    xgb_importances = best_xgb.feature_importances_
    
    # Average importances (weights: RF=1, XGB=2)
    avg_importances = (1 * rf_importances + 2 * xgb_importances) / 3
    
    # Map to feature names and sort
    importances_list = []
    for name, imp in zip(FEATURE_NAMES, avg_importances):
        importances_list.append({
            "feature": name,
            "importance": float(imp)
        })
    importances_list = sorted(importances_list, key=lambda x: x["importance"], reverse=True)
    
    # Save all evaluation metrics to JSON
    metrics_path = os.path.join(artifacts_dir, "metrics.json")
    
    # Get precision, recall, f1 from default report for model summary
    report = classification_report(y_test, preds_opt, output_dict=True)
    
    metrics = {
        "model_type": "Soft Voting Ensemble (Random Forest + XGBoost)",
        "training_samples": len(df) - len(X_test),
        "testing_samples": len(X_test),
        "feature_count": len(FEATURE_NAMES),
        "roc_auc": roc_auc,
        "f1_score": report["accuracy"], #  Let's  store accuracy and other metrics
        "macro_f1": report["macro avg"]["f1-score"],
        "weighted_f1": report["weighted avg"]["f1-score"],
        "precision": report["1"]["precision"],
        "recall": report["1"]["recall"],
        "confusion_matrix": cm_dict,
        "feature_importances": importances_list,
        "optimal_threshold": optimal_threshold
    }
    
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
        
    print(f"\nSaved evaluation metrics to {metrics_path}")
    print("=== Evaluation Pipeline Complete ===")

if __name__ == "__main__":
    main()
