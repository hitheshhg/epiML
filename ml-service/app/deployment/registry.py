"""
Model Registry & Artifact Persistence Manager
Serializes model artifacts, metadata, and feature schemas.
Enforces safe deployment validation, smoke testing, and zero-downtime rollback.
"""

import os
import json
import time
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
import joblib
import pandas as pd
import numpy as np

from app.config import settings

REGISTRY_META_FILE = settings.artifacts_dir / "registry.json"

class ModelArtifactMetadata:
    def __init__(
        self,
        model_id: str,
        version_tag: str,
        algorithm: str,
        targets: list,
        prediction_horizon_minutes: int,
        feature_names: list,
        metrics: dict,
        artifact_path: str,
        status: str = "CANDIDATE",
        created_at: Optional[str] = None
    ):
        self.model_id = model_id
        self.version_tag = version_tag
        self.algorithm = algorithm
        self.targets = targets
        self.prediction_horizon_minutes = prediction_horizon_minutes
        self.feature_names = feature_names
        self.metrics = metrics
        self.artifact_path = artifact_path
        self.status = status
        self.created_at = created_at or time.strftime("%Y-%m-%dT%H:%M:%SZ")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "model_id": self.model_id,
            "version_tag": self.version_tag,
            "algorithm": self.algorithm,
            "targets": self.targets,
            "prediction_horizon_minutes": self.prediction_horizon_minutes,
            "feature_names": self.feature_names,
            "metrics": self.metrics,
            "artifact_path": self.artifact_path,
            "status": self.status,
            "created_at": self.created_at
        }

class ModelRegistry:
    def __init__(self):
        self.active_model: Optional[Any] = None
        self.active_metadata: Optional[ModelArtifactMetadata] = None
        self.previous_version_tag: Optional[str] = None
        self.models_catalog: Dict[str, Dict[str, Any]] = {}
        self.load_catalog()

    def load_catalog(self):
        if REGISTRY_META_FILE.exists():
            try:
                with open(REGISTRY_META_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.models_catalog = data.get("models", {})
                    active_tag = data.get("active_version")
                    self.previous_version_tag = data.get("previous_version")
                    if active_tag and active_tag in self.models_catalog:
                        self.load_model_by_tag(active_tag)
            except Exception as e:
                print(f"[REGISTRY] Error loading catalog: {e}")

    def save_catalog(self):
        data = {
            "active_version": self.active_metadata.version_tag if self.active_metadata else None,
            "previous_version": self.previous_version_tag,
            "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "models": self.models_catalog
        }
        with open(REGISTRY_META_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def register_model(
        self,
        model_obj: Any,
        version_tag: str,
        algorithm: str,
        targets: list,
        prediction_horizon_minutes: int,
        feature_names: list,
        metrics: dict
    ) -> ModelArtifactMetadata:
        """Serializes model object to disk and records in catalog."""
        artifact_filename = f"model_{version_tag}.joblib"
        artifact_path = settings.artifacts_dir / artifact_filename
        joblib.dump(model_obj, artifact_path)

        meta = ModelArtifactMetadata(
            model_id=f"MOD-{version_tag}",
            version_tag=version_tag,
            algorithm=algorithm,
            targets=targets,
            prediction_horizon_minutes=prediction_horizon_minutes,
            feature_names=feature_names,
            metrics=metrics,
            artifact_path=str(artifact_path),
            status="CANDIDATE"
        )

        self.models_catalog[version_tag] = meta.to_dict()
        self.save_catalog()
        return meta

    def run_smoke_test(self, model_obj: Any, feature_names: list) -> bool:
        """Executes a synthetic smoke prediction test to ensure runtime stability."""
        try:
            dummy_data = {f: [25.0 if "temp" in f else (70.0 if "hum" in f or "soil" in f else 1.0)] for f in feature_names}
            dummy_df = pd.DataFrame(dummy_data)
            preds, conf, intervals = model_obj.predict(dummy_df)
            return len(preds) > 0
        except Exception as e:
            print(f"[REGISTRY] Smoke test failed: {e}")
            return False

    def activate_model(self, version_tag: str) -> Tuple[bool, str]:
        """
        Safely promotes a model version to production:
        1. Checks artifact exists
        2. Loads model
        3. Runs smoke test
        4. Updates status and preserves previous active model for rollback
        """
        if version_tag not in self.models_catalog:
            return False, f"Model version {version_tag} not found in catalog."

        entry = self.models_catalog[version_tag]
        art_path = Path(entry["artifact_path"])
        if not art_path.exists():
            return False, f"Artifact file {art_path} missing on storage."

        try:
            loaded_model = joblib.load(art_path)
            # Run smoke test
            passed = self.run_smoke_test(loaded_model, entry["feature_names"])
            if not passed:
                return False, "Model failed pre-deployment smoke test."

            # Preserve previous version for one-click rollback
            if self.active_metadata and self.active_metadata.version_tag != version_tag:
                self.previous_version_tag = self.active_metadata.version_tag
                # Mark previous as ARCHIVED or CANDIDATE
                self.models_catalog[self.previous_version_tag]["status"] = "ARCHIVED"

            # Set new active
            entry["status"] = "ACTIVE"
            self.active_model = loaded_model
            self.active_metadata = ModelArtifactMetadata(**entry)
            self.save_catalog()

            return True, f"Model {version_tag} successfully smoke tested and activated for production."
        except Exception as e:
            return False, f"Error activating model: {str(e)}"

    def rollback_to_previous(self) -> Tuple[bool, str]:
        """One-click rollback: re-activates previous production model without retraining."""
        if not self.previous_version_tag:
            return False, "No previous production model version available for rollback."

        target_version = self.previous_version_tag
        success, msg = self.activate_model(target_version)
        if success:
            return True, f"Successfully rolled back to version {target_version}."
        return False, f"Rollback failed: {msg}"

    def load_model_by_tag(self, version_tag: str):
        if version_tag in self.models_catalog:
            entry = self.models_catalog[version_tag]
            art_path = Path(entry["artifact_path"])
            if art_path.exists():
                self.active_model = joblib.load(art_path)
                self.active_metadata = ModelArtifactMetadata(**entry)

registry = ModelRegistry()
