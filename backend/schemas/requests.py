"""
Request Schemas - Pydantic models for API requests
"""

from pydantic import BaseModel, Field
from typing import Optional


class SimStartRequest(BaseModel):
    """Start telemetry simulation"""
    scenario: str = Field(
        default="Stable Farm",
        description="Scenario name: Stable Farm, pH Drift, Heat Stress, Nutrient Dilution, Light Spike, Random Noise"
    )
    freq_minutes: int = Field(
        default=15,
        description="Telemetry generation frequency in minutes",
        ge=1,
        le=60
    )
    duration_hours: Optional[int] = Field(
        default=None,
        description="Optional duration limit in hours. None = unlimited"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "scenario": "Stable Farm",
                "freq_minutes": 15,
                "duration_hours": 24
            }
        }


class ComputeFeaturesRequest(BaseModel):
    """Compute features from telemetry window"""
    window: str = Field(
        default="7d",
        description="Time window: 24h, 3d, 7d, 14d"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "window": "7d"
            }
        }


class PredictManualRequest(BaseModel):
    """Manual prediction request - user provides values"""
    d7_air_temp_mean: float = Field(
        ...,
        description="Day 7 air temperature mean (°C)",
        ge=15,
        le=35
    )
    d7_lux_mean: float = Field(
        ...,
        description="Day 7 light intensity mean (lux)",
        ge=5000,
        le=50000
    )
    d7_ph_mean: float = Field(
        ...,
        description="Day 7 pH mean",
        ge=4.0,
        le=8.0
    )
    d7_water_temp_mean: float = Field(
        ...,
        description="Day 7 water temperature mean (°C)",
        ge=15,
        le=30
    )
    d7_rh_mean: float = Field(
        ...,
        description="Day 7 relative humidity mean (%)",
        ge=30,
        le=90
    )
    d7_ec_mean: float = Field(
        ...,
        description="Day 7 electrical conductivity mean (mS/cm)",
        ge=0.5,
        le=3.5
    )
    d7_tds_mean: float = Field(
        ...,
        description="Day 7 total dissolved solids mean (ppm)",
        ge=250,
        le=1750
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "d7_air_temp_mean": 24.0,
                "d7_lux_mean": 23000.0,
                "d7_ph_mean": 6.2,
                "d7_water_temp_mean": 20.0,
                "d7_rh_mean": 65.0,
                "d7_ec_mean": 1.8,
                "d7_tds_mean": 900.0
            }
        }


class PredictAutoRequest(BaseModel):
    """Auto prediction request - compute from telemetry"""
    window: str = Field(
        default="7d",
        description="Time window for feature aggregation: 7d, 14d, 3d"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "window": "7d"
            }
        }


class SaveAnalysisRequest(BaseModel):
    """Save analysis to history"""
    timestamp: str
    mode: str
    scenario: Optional[str] = None
    yield_estimate: Optional[float] = None
    yield_category: Optional[str] = None
    cluster_id: Optional[int] = None
    cluster_label: Optional[str] = None
    stability_score: Optional[float] = None
    stability_label: Optional[str] = None
    features: Optional[dict] = None
    recommendations: Optional[list] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "timestamp": "2026-01-21T10:30:00Z",
                "mode": "auto",
                "scenario": "Stable Farm",
                "yield_estimate": 185.5,
                "yield_category": "Medium",
                "cluster_id": 0,
                "cluster_label": "Optimal Balanced",
                "stability_score": 82.3,
                "stability_label": "Stable",
                "features": {},
                "recommendations": []
            }
        }
