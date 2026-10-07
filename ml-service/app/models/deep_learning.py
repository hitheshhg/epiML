"""
Extensible Deep Learning Time-Series Architecture (PyTorch)
Provides upgrade path to recurrent LSTM / GRU networks when data exceeds scale threshold (> 10,000 records).
Avoids overfitting on small sample sizes by enforcing minimum sample gate.
"""

from typing import Dict, Any, Optional
import torch
import torch.nn as nn
import numpy as np

MIN_DEEP_LEARNING_RECORDS = 10000

class RecurrentEnvironmentalPredictor(nn.Module):
    """
    Multi-layer bidirectional GRU / LSTM network for deep sequence learning.
    """
    def __init__(self, input_dim: int, hidden_dim: int = 64, num_layers: int = 2, output_dim: int = 4):
        super().__init__()
        self.gru = nn.GRU(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=0.2 if num_layers > 1 else 0.0
        )
        self.fc = nn.Sequential(
            nn.Linear(hidden_dim, 32),
            nn.ReLU(),
            nn.Linear(32, output_dim)
        )

    def forward(self, x):
        out, _ = self.gru(x)
        out = self.fc(out[:, -1, :])
        return out

def is_deep_learning_eligible(record_count: int) -> bool:
    """Gates deep learning model training to avoid severe overfitting on small datasets."""
    return record_count >= MIN_DEEP_LEARNING_RECORDS
