# Churn.Intel: Customer Churn Analytics Platform

## 1. Project Overview

Churn.Intel is an enterprise-grade customer churn prediction and analytics platform designed to proactively identify bank accounts at risk of defection. At its core, the platform combines a robust Machine Learning pipeline with an explainable AI layer, using SHAP (SHapley Additive exPlanations) values to output the exact drivers behind each customer's prediction. The system is engineered to solve the data imbalance problem typical of churn prediction using SMOTE (Synthetic Minority Over-sampling Technique) and generates highly accurate classifications using a soft-voting ensemble of Scikit-Learn Random Forests and tuned XGBoost architectures.

The platform provides a dual-interface approach: business analysts can visually monitor overall portfolio risk profiles and explore global feature importances on a dashboard inspired by Bloomberg Terminal diagnostics, while support teams can query individual customer profiles manually or upload CSV batch reports to get immediate, structured retention recommendations. This end-to-end integration bridges the gap between machine learning model outputs and real-world business interventions.

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **ML Engine** | Python, Scikit-Learn, XGBoost, Imbalanced-Learn | Ensemble training, SMOTE balancing, hyperparameter tuning |
| **Explainable AI** | SHAP (TreeExplainer) | Local feature attribution explanations per prediction |
| **Backend API** | FastAPI, Pydantic, Uvicorn | High-performance JSON endpoint routing & Pydantic verification |
| **Frontend UI** | React, TypeScript, Vite, Tailwind CSS | Sleek, fast user interface with monospace Bloomberg layout |
| **Charts/Plots** | Recharts | Interactive area, bar, and custom radial gauges |
| **State Management**| Zustand | Lightweight, global client state management |
| **Deployment** | Docker, Docker Compose | Consistent multi-stage containerized serving |

---

## 3. Setup & Running Instructions

### Prerequisites
- Python 3.10 or 3.11
- Node.js 18+ & npm
- Docker & Docker Compose (Optional, for containerized running)

### Local Development Flow

#### Step 1: Train the Machine Learning Model
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # On Windows:
   .venv\Scripts\activate
   # On Mac/Linux:
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the training pipeline to generate the preprocessor and model artifacts:
   ```bash
   python ml/train.py
   ```
5. Run the evaluation script to generate metrics and Youden's J statistic threshold:
   ```bash
   python ml/evaluate.py
   ```

#### Step 2: Spin Up the Backend API Server
Start the Uvicorn dev server from the `backend/` directory:
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The interactive Swagger documentation will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

#### Step 3: Run the React Frontend Application
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install npm modules:
   ```bash
   npm install
   ```
3. Boot the Vite development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to [http://127.0.0.1:5173/](http://127.0.0.1:5173/).

---

### Running via Docker Compose

To deploy both frontend and backend automatically inside production containers:
1. Ensure you have trained the model locally (which generates the files inside `backend/ml/artifacts/`).
2. From the project root folder, run:
   ```bash
   docker-compose up --build
   ```
3. The application will be serving at:
   - **Frontend UI**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:8000](http://localhost:8000)

---

## 4. API Endpoints Reference

| Method | Endpoint | Description | Payload (JSON) |
|---|---|---|---|
| **GET** | `/health` | API and loaded model health status check | None |
| **GET** | `/model/info` | Returns model type, test accuracy, ROC-AUC, and confusion matrix | None |
| **GET** | `/model/feature-importances` | Returns sorted global average feature importances | None |
| **GET** | `/analytics/summary` | Returns aggregated dataset metrics, risk splits, and regional probabilities | None |
| **POST** | `/predict` | Evaluates churn probability, risk tier, SHAP explanation, and actions for a client | `CustomerInput` profile details |
| **POST** | `/predict/batch` | Evaluates a batch list of customer profile records | `{"customers": [CustomerInput, ...]}` |
| **POST** | `/predict/csv` | Accept multi-part file upload of a customer CSV, running bulk classification | `.csv` multipart file |

---

## 5. Interface Showcase
*(Visual demonstration assets and screenshots to be added during final deployment audit)*

---

## 6. Future Roadmap
1. **Real-time Alerting**: Integrations with Webhook channels (Slack/Teams) to ping account managers when a customer transitions into the "High Risk" tier.
2. **Automated Marketing Campaigns**: Direct linkage to CRM systems (e.g. Salesforce, HubSpot) to trigger automatic re-activation emails.
3. **A/B Testing Framework**: Track whether customers targeted with the recommended retention actions exhibit lower churn rates than the control group.
