"""
Model Loader - Singleton service for loading and serving ML models
"""

import joblib
import os
import numpy as np
from typing import Dict, Any, Optional
from pathlib import Path


class ModelLoader:
    """Singleton service to load and serve pre-trained models"""

    def __init__(self, models_dir: str = "backend/models"):
        self.models_dir = Path(models_dir)
        self.regressor = None
        self.classifier = None
        self.clusterer = None
        self.feature_names = None
        self._loaded = False

    def load_all_models(self):
        """Load all pre-trained models on startup"""
        try:
            print("📦 Loading ML models...")

            # Load regression model
            regressor_path = self.models_dir / "rf_yield_regressor_v1.pkl"
            if regressor_path.exists():
                with open(regressor_path, 'rb') as f:
                    self.regressor = joblib.load(f)
                print(f"  ✓ Loaded regressor: {regressor_path}")
            else:
                print(f"  ⚠ Mock regressor (model file not found: {regressor_path})")
                self.regressor = self._create_mock_regressor()

            # Load classification model
            classifier_path = self.models_dir / "rf_yield_classifier_v1.pkl"
            if classifier_path.exists():
                with open(classifier_path, 'rb') as f:
                    self.classifier = joblib.load(f)
                print(f"  ✓ Loaded classifier: {classifier_path}")
            else:
                print(f"  ⚠ Mock classifier (model file not found: {classifier_path})")
                self.classifier = self._create_mock_classifier()

            scaler_path = self.models_dir / "scaler_v1.pkl"
            if scaler_path.exists():
                with open(scaler_path, "rb") as f:
                    self.scaler = joblib.load(f)
                print(f"  ✓ Loaded scaler: {scaler_path}")
            else:
                raise RuntimeError("❌ Missing scaler_v1.pkl — clustering will be wrong")

    # Load clustering model
            clusterer_path = self.models_dir / "kmeans_growth_clusters_v1.pkl"
            if clusterer_path.exists():
                with open(clusterer_path, 'rb') as f:
                    self.clusterer = joblib.load(f)
                print(f"  ✓ Loaded clusterer: {clusterer_path}")
            else:
                print(f"  ⚠ Mock clusterer (model file not found: {clusterer_path})")
                self.clusterer = self._create_mock_clusterer()

            # Extract feature names from regressor
            if hasattr(self.regressor, 'feature_names_in_'):
                self.feature_names = list(self.regressor.feature_names_in_)
            else:
                # Default expected feature order
                self.feature_names = [
                    'd7_air_temp_mean',
                    'd7_lux_mean',
                    'd7_ph_mean',
                    'd7_water_temp_mean',
                    'd7_rh_mean',
                    'd7_ec_mean',
                    'd7_tds_mean'
                ]

            print(f"  ✓ Expected features: {self.feature_names}")

            self._loaded = True
            print("✅ All models loaded successfully")

        except Exception as e:
            print(f"❌ Error loading models: {e}")
            raise

    def _create_mock_regressor(self):
        """Create mock regressor for demo/testing"""
        class MockRegressor:
            feature_names_in_ = np.array([
                'd7_air_temp_mean', 'd7_lux_mean', 'd7_ph_mean',
                'd7_water_temp_mean', 'd7_rh_mean', 'd7_ec_mean', 'd7_tds_mean'
            ])
            feature_importances_ = np.array([0.18, 0.22, 0.15, 0.12, 0.08, 0.14, 0.11])

            def predict(self, X):
                # Simple heuristic for demo
                ph = X[0][2]  # d7_ph_mean
                lux = X[0][1]  # d7_lux_mean
                ec = X[0][5]  # d7_ec_mean

                base_yield = 180.0
                ph_factor = 1.0 if 5.8 <= ph <= 6.5 else 0.85
                lux_factor = min(lux / 25000, 1.2)
                ec_factor = 1.0 if 1.2 <= ec <= 2.2 else 0.9

                yield_pred = base_yield * ph_factor * lux_factor * ec_factor
                return np.array([yield_pred])

        return MockRegressor()

    def _create_mock_classifier(self):
        """Create mock classifier for demo/testing"""
        class MockClassifier:
            classes_ = np.array(['Low', 'Medium', 'High'])

            def predict(self, X):
                # Based on yield estimation
                regressor = ModelLoader._create_mock_regressor(None)
                yield_val = regressor.predict(X)[0]

                if yield_val < 150:
                    return np.array(['Low'])
                elif yield_val < 200:
                    return np.array(['Medium'])
                else:
                    return np.array(['High'])

            def predict_proba(self, X):
                pred = self.predict(X)[0]
                if pred == 'Low':
                    return np.array([[0.75, 0.20, 0.05]])
                elif pred == 'Medium':
                    return np.array([[0.15, 0.70, 0.15]])
                else:
                    return np.array([[0.05, 0.20, 0.75]])

        return MockClassifier()

    def _create_mock_clusterer(self):
        """Create mock clusterer for demo/testing"""
        class MockClusterer:
            n_clusters = 4
            cluster_centers_ = np.array([
                [24, 22000, 6.0, 20, 65, 1.6, 850],  # Optimal
                [26, 18000, 6.3, 22, 58, 1.4, 750],  # Moderate-Warm
                [22, 25000, 5.8, 19, 70, 1.8, 950],  # Cool-Bright
                [25, 20000, 6.5, 21, 62, 2.0, 1050], # Nutrient-Rich
            ])

            def predict(self, X):
                # Simple distance-based assignment
                X_array = np.array(X)
                distances = np.linalg.norm(self.cluster_centers_ - X_array, axis=1)
                return np.array([np.argmin(distances)])

        return MockClusterer()

    def is_loaded(self) -> bool:
        """Check if models are loaded"""
        return self._loaded

    def _prepare_input(self, X: Dict[str, float]) -> np.ndarray:
        """Convert feature dict to array in correct order"""
        if self.feature_names is None:
            raise RuntimeError("Models not loaded")

        # Ensure correct feature order
        X_array = np.array([[X[feat] for feat in self.feature_names]])
        return X_array

    def predict_regression(self, X: Dict[str, float]) -> Dict[str, Any]:
        """Predict yield (regression)"""
        if not self._loaded:
            raise RuntimeError("Models not loaded")

        X_array = self._prepare_input(X)
        yield_pred = float(self.regressor.predict(X_array)[0])

        return {
            "yield": round(yield_pred, 2),
            "unit": "grams"
        }

    def predict_classification(self, X: Dict[str, float]) -> Dict[str, Any]:
        """Predict yield category (classification)"""
        if not self._loaded:
            raise RuntimeError("Models not loaded")

        X_array = self._prepare_input(X)
        category_pred = self.classifier.predict(X_array)[0]

        result = {
            "category": str(category_pred)
        }

        # Add probability if available
        if hasattr(self.classifier, 'predict_proba'):
            proba = self.classifier.predict_proba(X_array)[0]
            class_labels = self.classifier.classes_
            result["probabilities"] = {
                str(label): round(float(prob), 3)
                for label, prob in zip(class_labels, proba)
            }

        return result

    def predict_cluster(self, X: Dict[str, float]) -> Dict[str, Any]:
        """Predict growth pattern cluster"""
        if not self._loaded:
            raise RuntimeError("Models not loaded")

        X_array = self._prepare_input(X)
        cluster_pred = int(self.clusterer.predict(X_array)[0])

        return {
            "cluster": cluster_pred
        }

    def get_feature_importance(self) -> Dict[str, float]:
        """Get global feature importance from regressor"""
        if not self._loaded:
            raise RuntimeError("Models not loaded")

        if not hasattr(self.regressor, 'feature_importances_'):
            raise RuntimeError("Regressor does not support feature importances")

        importances = self.regressor.feature_importances_

        # Create dict with feature names
        importance_dict = {
            feat: round(float(imp), 4)
            for feat, imp in zip(self.feature_names, importances)
        }

        # Sort by importance descending
        importance_dict = dict(sorted(
            importance_dict.items(),
            key=lambda x: x[1],
            reverse=True
        ))

        return importance_dict

    def get_model_info(self) -> Dict[str, Any]:
        """Get model metadata"""
        if not self._loaded:
            raise RuntimeError("Models not loaded")

        return {
            "version": "v1",
            "expected_features": self.feature_names,
            "feature_count": len(self.feature_names),
            "models": {
                "regressor": {
                    "type": type(self.regressor).__name__,
                    "has_feature_importance": hasattr(self.regressor, 'feature_importances_')
                },
                "classifier": {
                    "type": type(self.classifier).__name__,
                    "classes": list(self.classifier.classes_) if hasattr(self.classifier, 'classes_') else []
                },
                "clusterer": {
                    "type": type(self.clusterer).__name__,
                    "n_clusters": int(self.clusterer.n_clusters) if hasattr(self.clusterer, 'n_clusters') else None
                }
            },
            "dataset_version": "V1",
            "feature_window": "Day 7 (≥7 days early-stage)"
        }
