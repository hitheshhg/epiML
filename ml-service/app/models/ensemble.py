"""
Model Ensemble Engine
Creates weighted voting ensembles across top-performing candidate algorithms.
Activates ensemble as production candidate if validation metrics exceed individual models.
"""

from typing import Dict, Any, List, Tuple, Optional
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, RegressorMixin
from app.evaluation.metrics import evaluate_predictions

class WeightedVotingRegressor(BaseEstimator, RegressorMixin):
    def __init__(self, estimators: List[Tuple[str, Any]], weights: Optional[List[float]] = None):
        self.estimators = estimators
        self.weights = weights or [1.0 / len(estimators)] * len(estimators)

    def fit(self, X, y):
        for name, est in self.estimators:
            est.fit(X, y)
        return self

    def predict(self, X):
        predictions = np.zeros(len(X))
        total_weight = sum(self.weights)
        for (name, est), w in zip(self.estimators, self.weights):
            predictions += (w / total_weight) * est.predict(X)
        return predictions

def build_ensemble_candidate(
    models: List[Tuple[str, Any]],
    X_val: pd.DataFrame,
    y_val: np.ndarray
) -> Tuple[WeightedVotingRegressor, Dict[str, float], bool]:
    """
    Evaluates individual models and the ensemble on validation data.
    Returns (ensemble_model, ensemble_val_metrics, is_ensemble_superior).
    """
    weights = []
    individual_rmses = []
    for name, m in models:
        preds = m.predict(X_val)
        m_eval = evaluate_predictions(y_val, preds)
        individual_rmses.append(m_eval["rmse"])
        # Inverse RMSE weighting
        inv_rmse = 1.0 / max(0.01, m_eval["rmse"])
        weights.append(inv_rmse)

    # Normalize weights
    norm_weights = [w / sum(weights) for w in weights]
    ensemble = WeightedVotingRegressor(models, norm_weights)

    ens_preds = ensemble.predict(X_val)
    ens_metrics = evaluate_predictions(y_val, ens_preds)

    best_individual_rmse = min(individual_rmses)
    is_superior = ens_metrics["rmse"] < best_individual_rmse

    return ensemble, ens_metrics, is_superior
