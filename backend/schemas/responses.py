"""
Response Schemas - Pydantic models for API responses
"""

from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    timestamp: str
    models_loaded: bool
    telemetry_active: bool


class ModelInfoResponse(BaseModel):
    """Model information response"""
    version: str
    expected_features: List[str]
    feature_count: int
    models: Dict[str, Any]
    dataset_version: str
    feature_window: str


class TelemetryResponse(BaseModel):
    """Telemetry data response"""
    data: Optional[Dict[str, Any]]
    message: Optional[str] = None


class PredictionResponse(BaseModel):
    """Prediction response (manual or auto)"""
    mode: str
    timestamp: str
    predictions: Dict[str, Any]
    features: Dict[str, float]
    stability: Dict[str, Any]
    feature_importance: Dict[str, float]
    recommendations: List[Dict[str, Any]]
    disclaimer: str
    metadata: Optional[Dict[str, Any]] = None


class FeatureImportanceResponse(BaseModel):
    """Feature importance response"""
    feature_importance: Dict[str, float]
    description: str


class AnalysisHistoryResponse(BaseModel):
    """Analysis history response"""
    count: int
    analyses: List[Dict[str, Any]]
