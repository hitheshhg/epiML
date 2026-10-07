"""
Evaluation Metrics & Uncertainty Estimation (Pure NumPy Implementation)
Avoids external DLL dependencies to guarantee 100% cross-platform compatibility.
"""

from typing import Dict, Any, Tuple
import numpy as np

def calculate_mape(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Calculates Mean Absolute Percentage Error, ignoring zero denominators."""
    y_t = np.asarray(y_true, dtype=float)
    y_p = np.asarray(y_pred, dtype=float)
    mask = y_t != 0
    if not np.any(mask):
        return 0.0
    return float(np.mean(np.abs((y_t[mask] - y_p[mask]) / y_t[mask])) * 100.0)

def evaluate_predictions(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """
    Computes standard regression benchmark metrics (MAE, RMSE, R², MAPE) on evaluation sets.
    """
    y_t = np.asarray(y_true, dtype=float)
    y_p = np.asarray(y_pred, dtype=float)
    
    mae = float(np.mean(np.abs(y_t - y_p)))
    rmse = float(np.sqrt(np.mean((y_t - y_p) ** 2)))
    
    # R2 determination
    ss_res = np.sum((y_t - y_p) ** 2)
    ss_tot = np.sum((y_t - np.mean(y_t)) ** 2)
    r2 = float(1.0 - (ss_res / (ss_tot + 1e-8)))
    
    mape = calculate_mape(y_t, y_p)
    
    return {
        "mae": round(mae, 3),
        "rmse": round(rmse, 3),
        "r2": round(r2, 4),
        "mape": round(mape, 2)
    }

def estimate_prediction_intervals(
    y_pred: float,
    residual_std: float,
    confidence_level: float = 0.95
) -> Dict[str, float]:
    """
    Generates uncertainty intervals [lower_bound, upper_bound] based on residual error standard deviation.
    Z-score for 95% is ~1.96.
    """
    z_score = 1.96 if confidence_level >= 0.95 else 1.645
    margin = z_score * max(0.2, residual_std)
    
    return {
        "estimate": round(float(y_pred), 1),
        "lower_bound": round(float(y_pred) - margin, 1),
        "upper_bound": round(float(y_pred) + margin, 1),
        "uncertainty_margin": round(margin, 2),
        "confidence_level": confidence_level
    }
