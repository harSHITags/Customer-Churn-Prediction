from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler
from category_encoders import TargetEncoder
from ml.feature_engineering import FeatureEngineeringTransformer

# Define columns for ColumnTransformer
SCALER_COLS = [
    'CreditScore', 'Age', 'Balance', 'EstimatedSalary', 'Tenure',
    'BalanceSalaryRatio', 'TenureAgeRatio', 'ProductsPerTenure',
    'SalaryRank', 'EngagementScore'
]

ENCODER_COLS = ['Geography', 'Gender']

PASSTHROUGH_COLS = [
    'HasCrCard', 'IsActiveMember', 'ZeroBalance', 'AgeBin', 'HighBalance'
]

# Total transformed feature names in order of ColumnTransformer concatenation
FEATURE_NAMES = SCALER_COLS + ENCODER_COLS + PASSTHROUGH_COLS

def get_preprocessor_pipeline():
    """
    Creates and returns the sklearn preprocessing Pipeline.
    """
    preprocessor = ColumnTransformer(
        transformers=[
            ('scaler', StandardScaler(), SCALER_COLS),
            ('encoder', TargetEncoder(cols=ENCODER_COLS), ENCODER_COLS),
            ('passthrough', 'passthrough', PASSTHROUGH_COLS)
        ],
        remainder='drop'  # Drop any other columns (e.g. RowNumber, CustomerId, Surname if they leaked through)
    )

    pipeline = Pipeline(steps=[
        ('feature_engineering', FeatureEngineeringTransformer()),
        ('col_transformer', preprocessor)
    ])

    return pipeline
