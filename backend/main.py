"""
HydroYield FastAPI Backend
Production AIoT Decision-Support System for Hydroponic Yield Intelligence
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from typing import Optional, List, Dict, Any
import sqlite3
import json
import os

from backend.models.model_loader import ModelLoader
from backend.services.telemetry_generator import TelemetryGenerator
from backend.services.feature_aggregator import FeatureAggregator
from backend.services.stability_scorer import StabilityScorer
from backend.services.cluster_interpreter import ClusterInterpreter
from backend.services.recommendations_engine import RecommendationsEngine
from backend.database.db_manager import DatabaseManager
from backend.schemas.requests import (
    SimStartRequest,
    PredictManualRequest,
    PredictAutoRequest,
    ComputeFeaturesRequest,
    SaveAnalysisRequest
)
from backend.schemas.responses import (
    HealthResponse,
    ModelInfoResponse,
    TelemetryResponse,
    PredictionResponse,
    FeatureImportanceResponse,
    AnalysisHistoryResponse
)

# Global instances
model_loader = None
telemetry_generator = None
db_manager = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models and initialize services on startup"""
    global model_loader, telemetry_generator, db_manager
    
    print("🚀 Initializing HydroYield Backend...")
    
    # Load ML models
    model_loader = ModelLoader()
    model_loader.load_all_models()
    
    # Initialize telemetry generator
    telemetry_generator = TelemetryGenerator()
    
    # Initialize database
    db_manager = DatabaseManager(db_path="backend/data/hydroyield.db")
    db_manager.initialize()
    
    print("✅ HydroYield Backend ready!")
    
    yield
    
    # Cleanup
    if telemetry_generator:
        telemetry_generator.stop()
    if db_manager:
        db_manager.close()
    
    print("👋 HydroYield Backend shutdown complete")

app = FastAPI(
    title="HydroYield API",
    description="Production AIoT Decision-Support System for Hydroponic Yield Intelligence",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# HEALTH & INFO ENDPOINTS
# ============================================================================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """System health check"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow().isoformat(),
        models_loaded=model_loader.is_loaded() if model_loader else False,
        telemetry_active=telemetry_generator.is_running() if telemetry_generator else False
    )

@app.get("/models/info", response_model=ModelInfoResponse)
async def get_model_info():
    """Get model metadata and expected features"""
    if not model_loader or not model_loader.is_loaded():
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    return model_loader.get_model_info()

# ============================================================================
# TELEMETRY ENDPOINTS
# ============================================================================

@app.get("/telemetry/current")
async def get_current_telemetry():
    """Get latest telemetry reading"""
    if not telemetry_generator:
        raise HTTPException(status_code=503, detail="Telemetry service not available")
    
    current = telemetry_generator.get_current_reading()
    if current is None:
        return {"data": None, "message": "No telemetry data available. Start simulation first."}
    
    return {"data": current}

@app.get("/telemetry/history")
async def get_telemetry_history(window: str = "7d"):
    """
    Get historical telemetry data
    
    window: 24h, 3d, 7d, 14d, 30d
    """
    if not telemetry_generator:
        raise HTTPException(status_code=503, detail="Telemetry service not available")
    
    # Parse window
    window_map = {
        "24h": timedelta(hours=24),
        "3d": timedelta(days=3),
        "7d": timedelta(days=7),
        "14d": timedelta(days=14),
        "30d": timedelta(days=30),
    }
    
    if window not in window_map:
        raise HTTPException(status_code=400, detail=f"Invalid window. Use: {list(window_map.keys())}")
    
    time_delta = window_map[window]
    history = telemetry_generator.get_history(time_delta)
    
    return {
        "window": window,
        "count": len(history),
        "data": history
    }

@app.post("/telemetry/sim/start")
async def start_simulation(request: SimStartRequest):
    """Start telemetry simulation with specified scenario"""
    if not telemetry_generator:
        raise HTTPException(status_code=503, detail="Telemetry service not available")
    
    try:
        telemetry_generator.start(
            scenario=request.scenario,
            freq_minutes=request.freq_minutes,
            duration_hours=request.duration_hours
        )
        return {
            "status": "started",
            "scenario": request.scenario,
            "freq_minutes": request.freq_minutes,
            "duration_hours": request.duration_hours,
            "message": f"Simulation started with '{request.scenario}' scenario"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/telemetry/sim/stop")
async def stop_simulation():
    """Stop telemetry simulation"""
    if not telemetry_generator:
        raise HTTPException(status_code=503, detail="Telemetry service not available")
    
    telemetry_generator.stop()
    return {"status": "stopped", "message": "Simulation stopped"}

@app.post("/telemetry/sim/reset")
async def reset_simulation():
    """Reset telemetry data"""
    if not telemetry_generator:
        raise HTTPException(status_code=503, detail="Telemetry service not available")
    
    telemetry_generator.reset()
    return {"status": "reset", "message": "Telemetry data cleared"}

@app.post("/telemetry/upload_csv")
async def upload_csv(file: UploadFile = File(...)):
    """Upload CSV telemetry data"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be CSV")
    
    try:
        contents = await file.read()
        df = pd.read_csv(pd.io.common.BytesIO(contents))
        
        # Validate schema
        required_cols = ['timestamp', 'air_temp', 'lux', 'ph', 'water_temp', 'rh', 'ec', 'tds']
        missing_cols = set(required_cols) - set(df.columns)
        if missing_cols:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {missing_cols}"
            )
        
        # Process and store
        telemetry_generator.load_from_dataframe(df)
        
        return {
            "status": "success",
            "message": f"Loaded {len(df)} records from CSV",
            "rows": len(df)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CSV processing error: {str(e)}")

# ============================================================================
# FEATURE & PREDICTION ENDPOINTS
# ============================================================================

@app.post("/features/compute")
async def compute_features(request: ComputeFeaturesRequest):
    """Compute Day-7 proxy features from telemetry window"""
    if not telemetry_generator:
        raise HTTPException(status_code=503, detail="Telemetry service not available")
    
    # Get telemetry history
    window_map = {
        "7d": timedelta(days=7),
        "14d": timedelta(days=14),
        "24h": timedelta(hours=24),
        "3d": timedelta(days=3),
    }
    
    time_delta = window_map.get(request.window, timedelta(days=7))
    history = telemetry_generator.get_history(time_delta)
    
    if len(history) < 10:  # Minimum data points
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient data. Need at least 10 readings, got {len(history)}"
        )
    
    # Aggregate features
    aggregator = FeatureAggregator()
    features = aggregator.aggregate(history)
    
    # Compute stability
    scorer = StabilityScorer()
    stability = scorer.compute_stability(history)
    
    return {
        "features": features,
        "stability": stability,
        "window": request.window,
        "data_points": len(history)
    }

@app.post("/predict/manual", response_model=PredictionResponse)
async def predict_manual(request: PredictManualRequest):
    print("🚨 HIT /predict/manual")

    """
    Manual prediction: user provides early-stage values
    """
    if not model_loader or not model_loader.is_loaded():
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    # Prepare feature vector
    X = {
        "d7_air_temp_mean": request.d7_air_temp_mean,
        "d7_lux_mean": request.d7_lux_mean,
        "d7_ph_mean": request.d7_ph_mean,
        "d7_water_temp_mean": request.d7_water_temp_mean,
        "d7_rh_mean": request.d7_rh_mean,
        "d7_ec_mean": request.d7_ec_mean,
        "d7_tds_mean": request.d7_tds_mean,
    }
    
    # Get predictions
    yield_pred = model_loader.predict_regression(X)
    category_pred = model_loader.predict_classification(X)
    cluster_pred = model_loader.predict_cluster(X)
    
    # Get feature importance
    feature_importance = model_loader.get_feature_importance()
    
    # Cluster interpretation
    interpreter = ClusterInterpreter()
    cluster_info = interpreter.interpret(cluster_pred["cluster"])
    
    # Generate recommendations
    rec_engine = RecommendationsEngine()
    recommendations = rec_engine.generate(
        features=X,
        predictions={
            "yield": yield_pred["yield"],
            "category": category_pred["category"],
            "cluster": cluster_pred["cluster"]
        },
        feature_importance=feature_importance,
        stability={"score": 75, "label": "Moderate", "message": "Manual entry - stability not computed"}
    )

    return PredictionResponse(
        mode="manual",
        timestamp=datetime.utcnow().isoformat(),
        predictions={
            "yield": yield_pred,
            "category": category_pred,
            "cluster": {**cluster_pred, **cluster_info}
        },
        features=X,
        stability={"score": 75, "label": "Moderate", "message": "Manual entry - stability not computed"},
        feature_importance=feature_importance,
        recommendations=recommendations,
        disclaimer="This is a decision-support tool only. Recommendations are general guidance. Adjust gradually and monitor carefully. Do not apply without agronomic expertise."
    )

@app.post("/predict/auto", response_model=PredictionResponse)
async def predict_auto(request: PredictAutoRequest):
    """
    Auto prediction: compute features from telemetry window
    """
    if not model_loader or not model_loader.is_loaded():
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    if not telemetry_generator:
        raise HTTPException(status_code=503, detail="Telemetry service not available")
    
    # Get telemetry history
    window_map = {
        "7d": timedelta(days=7),
        "14d": timedelta(days=14),
        "3d": timedelta(days=3),
    }
    
    time_delta = window_map.get(request.window, timedelta(days=7))
    history = telemetry_generator.get_history(time_delta)
    
    if len(history) < 10:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient telemetry data. Need at least 10 readings for {request.window} window"
        )
    
    # Aggregate features
    aggregator = FeatureAggregator()
    X = aggregator.aggregate(history)
    
    # Compute stability
    scorer = StabilityScorer()
    stability = scorer.compute_stability(history)
    
    # Get predictions
    yield_pred = model_loader.predict_regression(X)
    category_pred = model_loader.predict_classification(X)
    cluster_pred = model_loader.predict_cluster(X)
    
    # Get feature importance
    feature_importance = model_loader.get_feature_importance()
    
    # Cluster interpretation
    interpreter = ClusterInterpreter()
    cluster_info = interpreter.interpret(cluster_pred["cluster"])
    
    # Generate recommendations
    rec_engine = RecommendationsEngine()
    recommendations = rec_engine.generate(
        features=X,
        predictions={
            "yield": yield_pred["yield"],
            "category": category_pred["category"],
            "cluster": cluster_pred["cluster"]
        },
        feature_importance=feature_importance,
        stability=stability
    )
    
    return PredictionResponse(
        mode="auto",
        timestamp=datetime.utcnow().isoformat(),
        predictions={
            "yield": yield_pred,
            "category": category_pred,
            "cluster": {**cluster_pred, **cluster_info}
        },
        features=X,
        stability=stability,
        feature_importance=feature_importance,
        recommendations=recommendations,
        disclaimer="This is a decision-support tool only. Recommendations are general guidance. Adjust gradually and monitor carefully. Do not apply without agronomic expertise.",
        metadata={
            "window": request.window,
            "data_points": len(history)
        }
    )

@app.get("/explain/feature_importance", response_model=FeatureImportanceResponse)
async def get_feature_importance():
    """Get global feature importance from regression model"""
    if not model_loader or not model_loader.is_loaded():
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    importance = model_loader.get_feature_importance()
    
    return FeatureImportanceResponse(
        feature_importance=importance,
        description="Global feature importance from Random Forest regressor. Higher values indicate stronger influence on yield predictions."
    )

# ============================================================================
# HISTORY ENDPOINTS
# ============================================================================

@app.get("/history/analyses")
async def get_analysis_history(limit: int = 50):
    """Get analysis history"""
    if not db_manager:
        raise HTTPException(status_code=503, detail="Database not available")
    
    history = db_manager.get_analyses(limit=limit)
    return {"count": len(history), "analyses": history}

@app.post("/history/save")
async def save_analysis(request: SaveAnalysisRequest):
    """Save analysis result to history"""
    if not db_manager:
        raise HTTPException(status_code=503, detail="Database not available")
    
    analysis_id = db_manager.save_analysis(request.dict())
    return {
        "status": "saved",
        "analysis_id": analysis_id,
        "message": "Analysis saved to history"
    }

# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
