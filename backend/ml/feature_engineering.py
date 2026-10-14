import pandas as pd
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin

class FeatureEngineeringTransformer(BaseEstimator, TransformerMixin):
    def __init__(self):
        self.balance_q75_ = None

    def fit(self, X, y=None):
        # We need to compute the 75th percentile of Balance on the training set to prevent leakage
        if isinstance(X, pd.DataFrame):
            self.balance_q75_ = float(X['Balance'].quantile(0.75))
        else:
            # Fallback if X is a numpy array
            df = pd.DataFrame(X)
            # Standard index for Balance is 5 if standard dataset order is used
            self.balance_q75_ = float(df.iloc[:, 5].quantile(0.75))
        return self

    def transform(self, X):
        # Prevent mutating the original dataframe
        X = X.copy()
        if not isinstance(X, pd.DataFrame):
            # If input is numpy array, convert to DataFrame
            # This shouldn't normally happen since the input to pipeline is a DataFrame
            raise ValueError("Input to FeatureEngineeringTransformer must be a pandas DataFrame.")

        # Drop columns that are not model features if they exist
        drop_cols = ['RowNumber', 'CustomerId', 'Surname']
        X = X.drop(columns=[col for col in drop_cols if col in X.columns], errors='ignore')

        # 1. Balance-to-Salary Ratio
        X['BalanceSalaryRatio'] = X['Balance'] / (X['EstimatedSalary'] + 1)

        # 2. Tenure-to-Age Ratio
        X['TenureAgeRatio'] = X['Tenure'] / (X['Age'] + 1)

        # 3. Products per Tenure
        X['ProductsPerTenure'] = X['NumOfProducts'] / (X['Tenure'] + 1)

        # 4. Engagement Score (composite)
        X['EngagementScore'] = (
            X['IsActiveMember'] * 2 +
            X['HasCrCard'] +
            X['NumOfProducts']
        )

        # 5. Zero Balance Flag
        X['ZeroBalance'] = (X['Balance'] == 0).astype(int)

        # 6. Age Bins -> ordinal encode
        X['AgeBin'] = pd.cut(
            X['Age'],
            bins=[0, 30, 40, 50, 60, 120],
            labels=[0, 1, 2, 3, 4],
            include_lowest=True
        ).astype(int)

        # 7. Salary Percentile Rank (within geography group)
        X['SalaryRank'] = X.groupby('Geography')['EstimatedSalary'].rank(pct=True)
        # Handle cases where rank is NaN (e.g. single sample inference)
        X['SalaryRank'] = X['SalaryRank'].fillna(0.5)

        # 8. High Balance Flag using the fitted 75th percentile of Balance
        q75 = self.balance_q75_ if self.balance_q75_ is not None else 120000.0
        X['HighBalance'] = (X['Balance'] > q75).astype(int)

        return X
