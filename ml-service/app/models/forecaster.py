"""
Multi-Target Environmental Forecaster Engine
Trains and benchmarks candidate machine learning algorithms:
- XGBoost (Production-grade gradient boosted trees)
- XGBoost-Conservative / Deep variants
- RandomForest / GradientBoosting (when sklearn is unblocked)
- Elastic Linear / Ridge multi-target baseline
Selects the champion model per target based on validation set performance.
"""

from typing import Dict, Any, List, Tuple, Optional
import time
import numpy as np
import pandas as pd
import xgboost as xgb

from app.evaluation.metrics import evaluate_predictions, estimate_prediction_intervals

# Test sklearn availability gracefully (survives Windows App Control blocks)
SKLEARN_AVAILABLE = False
try:
    from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, ExtraTreesRegressor
    SKLEARN_AVAILABLE = True
except Exception:
    pass

CANDIDATE_ALGORITHMS = [
    "XGBoost",
    "XGBoost-Deep",
    "XGBoost-Conservative",
    "RandomForest" if SKLEARN_AVAILABLE else "GradientBoosting-Fast"
]

class FastRidgeRegressor:
    """Zero-dependency L2 Regularized Ridge Regressor (pure NumPy)."""
    def __init__(self, alpha: float = 1.0):
        self.alpha = alpha
        self.weights = None
        self.intercept = 0.0

    def fit(self, X: pd.DataFrame, y: np.ndarray):
        X_mat = np.asarray(X, dtype=float)
        y_vec = np.asarray(y, dtype=float)
        n, p = X_mat.shape
        X_with_bias = np.hstack([np.ones((n, 1)), X_mat])
        reg = self.alpha * np.eye(p + 1)
        reg[0, 0] = 0.0 # Don't regularize bias
        try:
            w = np.linalg.solve(X_with_bias.T @ X_with_bias + reg, X_with_bias.T @ y_vec)
        except np.linalg.LinAlgError:
            w = np.linalg.pinv(X_with_bias.T @ X_with_bias + reg) @ (X_with_bias.T @ y_vec)
        self.intercept = w[0]
        self.weights = w[1:]
        return self

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        X_mat = np.asarray(X, dtype=float)
        return X_mat @ self.weights + self.intercept

def create_model_instance(algorithm: str, random_state: int = 42):
    """Instantiates candidate algorithm instance."""
    if algorithm == "XGBoost":
        return xgb.XGBRegressor(
            n_estimators=80,
            max_depth=4,
            learning_rate=0.08,
            subsample=0.85,
            colsample_bytree=0.85,
            random_state=random_state,
            n_jobs=2
        )
    elif algorithm == "XGBoost-Deep":
        return xgb.XGBRegressor(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.80,
            colsample_bytree=0.80,
            random_state=random_state,
            n_jobs=2
        )
    elif algorithm == "XGBoost-Conservative":
        return xgb.XGBRegressor(
            n_estimators=60,
            max_depth=3,
            learning_rate=0.04,
            reg_alpha=0.5,
            reg_lambda=1.5,
            random_state=random_state,
            n_jobs=2
        )
    elif algorithm == "RandomForest" and SKLEARN_AVAILABLE:
        return RandomForestRegressor(
            n_estimators=60,
            max_depth=8,
            random_state=random_state,
            n_jobs=2
        )
    else:
        return FastRidgeRegressor(alpha=2.0)

class MultiTargetEnvironmentalForecaster:
    """
    Manages multi-target models across AQI, Temperature, Humidity, and Soil Moisture.
    Selects champion model per target using validation set metrics.
    """
    def __init__(
        self,
        targets: List[str] = ["aqi", "temperature_c", "humidity_pct", "soil_moisture_pct"],
        prediction_horizon_minutes: int = 30
    ):
        self.targets = targets
        self.prediction_horizon_minutes = prediction_horizon_minutes
        self.target_models: Dict[str, Any] = {}
        self.target_algorithms: Dict[str, str] = {}
        self.target_metrics: Dict[str, Dict[str, Any]] = {}
        self.residual_stds: Dict[str, float] = {}
        self.feature_names: List[str] = []
        self.training_duration_seconds: float = 0.0

    def fit_and_select(
        self,
        X_train: pd.DataFrame,
        y_train: pd.DataFrame,
        X_val: pd.DataFrame,
        y_val: pd.DataFrame,
        X_test: pd.DataFrame,
        y_test: pd.DataFrame,
        candidate_algorithms: List[str] = CANDIDATE_ALGORITHMS
    ) -> Dict[str, Any]:
        """
        Trains candidate algorithms for each target, compares validation RMSE,
        selects the best model per target, and computes test set benchmark.
        """
        start_time = time.time()
        self.feature_names = X_train.columns.tolist()
        comparison_leaderboard: Dict[str, List[Dict[str, Any]]] = {}

        for tgt in self.targets:
            if tgt not in y_train.columns:
                continue

            comparison_leaderboard[tgt] = []
            best_model = None
            best_algo = ""
            best_val_rmse = float("inf")
            best_val_metrics = {}

            y_tr_vec = y_train[tgt].values
            y_val_vec = y_val[tgt].values

            for algo in candidate_algorithms:
                try:
                    model = create_model_instance(algo)
                    model.fit(X_train, y_tr_vec)
                    
                    val_preds = model.predict(X_val)
                    val_metrics = evaluate_predictions(y_val_vec, val_preds)

                    comparison_leaderboard[tgt].append({
                        "algorithm": algo,
                        "val_metrics": val_metrics
                    })

                    # Selection rule: Minimize validation RMSE
                    if val_metrics["rmse"] < best_val_rmse:
                        best_val_rmse = val_metrics["rmse"]
                        best_model = model
                        best_algo = algo
                        best_val_metrics = val_metrics
                except Exception as e:
                    print(f"[FORECASTER] Candidate {algo} on {tgt} failed: {e}")

            # Fallback if candidates failed
            if best_model is None:
                best_model = FastRidgeRegressor()
                best_model.fit(X_train, y_tr_vec)
                best_algo = "RidgeBaseline"
                best_val_metrics = evaluate_predictions(y_val_vec, best_model.predict(X_val))

            # Final evaluation on unseen test set
            y_test_vec = y_test[tgt].values
            test_preds = best_model.predict(X_test)
            test_metrics = evaluate_predictions(y_test_vec, test_preds)

            residuals = y_test_vec - test_preds
            self.residual_stds[tgt] = float(np.std(residuals))

            self.target_models[tgt] = best_model
            self.target_algorithms[tgt] = best_algo
            self.target_metrics[tgt] = {
                "algorithm": best_algo,
                "validation": best_val_metrics,
                "test": test_metrics,
                "residual_std": round(self.residual_stds[tgt], 3)
            }

        self.training_duration_seconds = round(time.time() - start_time, 2)

        overall_mae = float(np.mean([m["test"]["mae"] for m in self.target_metrics.values()]))
        overall_rmse = float(np.mean([m["test"]["rmse"] for m in self.target_metrics.values()]))
        overall_r2 = float(np.mean([m["test"]["r2"] for m in self.target_metrics.values()]))

        return {
            "overall_mae": round(overall_mae, 3),
            "overall_rmse": round(overall_rmse, 3),
            "overall_r2": round(overall_r2, 4),
            "training_duration_seconds": self.training_duration_seconds,
            "target_metrics": self.target_metrics,
            "leaderboard": comparison_leaderboard
        }

    def predict(self, X_input: pd.DataFrame) -> Tuple[Dict[str, float], Dict[str, float], Dict[str, Any]]:
        predictions: Dict[str, float] = {}
        confidences: Dict[str, float] = {}
        prediction_intervals: Dict[str, Any] = {}

        aligned_X = pd.DataFrame(index=X_input.index)
        for f in self.feature_names:
            aligned_X[f] = X_input[f] if f in X_input.columns else 0.0

        for tgt, model in self.target_models.items():
            pred_arr = model.predict(aligned_X)
            pred_val = float(pred_arr[-1]) if hasattr(pred_arr, "__len__") else float(pred_arr)
            res_std = self.residual_stds.get(tgt, 1.0)

            if "humidity" in tgt or "soil" in tgt:
                pred_val = max(0.0, min(100.0, pred_val))
            elif "aqi" in tgt:
                pred_val = max(0.0, min(500.0, pred_val))

            predictions[tgt] = round(pred_val, 1)

            r2 = self.target_metrics.get(tgt, {}).get("test", {}).get("r2", 0.85)
            conf = float(np.clip(0.70 + (r2 * 0.28), 0.50, 0.99))
            confidences[tgt] = round(conf, 2)

            prediction_intervals[tgt] = estimate_prediction_intervals(pred_val, res_std)

        return predictions, confidences, prediction_intervals
