"""
Anti-Leakage Chronological & Grouped Splitting
Strictly prohibits random train/test splits that cause temporal leakage in time series.
"""

from typing import Tuple, Dict, Any, Optional
import pandas as pd
import numpy as np

def chronological_time_split(
    X: pd.DataFrame,
    y: pd.DataFrame,
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Splits features and targets strictly along the chronological timeline:
    - Oldest observations -> Train
    - Intermediate window -> Validation (Model selection & hyperparameter tuning)
    - Most recent window -> Test (Strictly unseen final production benchmark)
    """
    total = len(X)
    if total < 10:
        raise ValueError(f"At least 10 observations required to split. Received {total}")

    train_end = int(total * train_ratio)
    val_end = int(total * (train_ratio + val_ratio))

    # Ensure each partition has at least 1 record
    train_end = max(1, min(total - 2, train_end))
    val_end = max(train_end + 1, min(total - 1, val_end))

    X_train = X.iloc[:train_end].copy().reset_index(drop=True)
    y_train = y.iloc[:train_end].copy().reset_index(drop=True)

    X_val = X.iloc[train_end:val_end].copy().reset_index(drop=True)
    y_val = y.iloc[train_end:val_end].copy().reset_index(drop=True)

    X_test = X.iloc[val_end:].copy().reset_index(drop=True)
    y_test = y.iloc[val_end:].copy().reset_index(drop=True)

    return X_train, X_val, X_test, y_train, y_val, y_test
