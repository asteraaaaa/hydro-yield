# HydroYield System Design Document

**Version:** 1.0  
**Last Updated:** January 21, 2026  
**System:** Production AIoT Decision-Support System for Hydroponic Yield Intelligence

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Requirements](#system-requirements)
3. [Architecture Overview](#architecture-overview)
4. [Backend Design](#backend-design)
5. [Frontend Design](#frontend-design)
6. [Data Flow](#data-flow)
7. [ML Pipeline](#ml-pipeline)
8. [Safety & Constraints](#safety--constraints)
9. [Performance Considerations](#performance-considerations)
10. [Future Enhancements](#future-enhancements)

---

## Executive Summary

HydroYield is a production-grade AIoT decision-support system designed to predict final crop yield using early-stage environmental data (≥7 days) from hydroponic farming operations. The system combines:

- **Machine Learning**: Pre-trained Random Forest models (regression, classification) + KMeans clustering
- **Real-time Telemetry**: Synthetic IoT sensor data generation with 6 realistic scenarios
- **Explainability**: Feature importance, cluster interpretation, stability assessment
- **Safe Recommendations**: Actionable guidance without dosing quantities or automated control

### Key Design Principles

1. **Safety-First**: No automated control, no dosing quantities, gradual adjustment emphasis
2. **Transparency**: All predictions include feature values, importance, and explanations
3. **Offline-First**: No cloud dependencies, runs entirely on local infrastructure
4. **Extensibility**: Modular architecture allows easy addition of scenarios, features, models
5. **Production-Ready**: Clean separation of concerns, comprehensive error handling, API documentation

---

## System Requirements

### Functional Requirements

**FR1**: System shall predict final yield (grams) from Day-7 environmental features  
**FR2**: System shall classify yield into categories (Low/Medium/High)  
**FR3**: System shall identify growth pattern clusters  
**FR4**: System shall generate ranked recommendations based on predictions + stability  
**FR5**: System shall compute stability score from telemetry variance  
**FR6**: System shall provide two prediction modes: Manual (user input) and Auto (telemetry aggregation)  
**FR7**: System shall generate synthetic telemetry with configurable scenarios  
**FR8**: System shall store analysis history in SQLite database  
**FR9**: System shall provide global feature importance from Random Forest  
**FR10**: System shall interpret cluster IDs into human-readable descriptions  

### Non-Functional Requirements

**NFR1**: All predictions must complete within 2 seconds  
**NFR2**: System must operate fully offline (no external API dependencies)  
**NFR3**: API must be RESTful and documented with OpenAPI/Swagger  
**NFR4**: Frontend must be responsive (desktop + tablet)  
**NFR5**: Recommendations must NEVER include dosing quantities  
**NFR6**: All numeric outputs must include units and appropriate precision  
**NFR7**: System must handle missing models gracefully (fallback to mock models)  

### Data Requirements

**DR1**: Telemetry frequency: Configurable (default 15 minutes)  
**DR2**: Feature window: ≥7 days early-stage (representative of Day 7)  
**DR3**: Minimum data points for auto prediction: 10 readings  
**DR4**: Expected features (7 total): air_temp, lux, pH, water_temp, RH, EC, TDS  
**DR5**: Identifiers (experiment, treatment, replicate, plant_no) must NEVER be used as features  

---

## Architecture Overview

### High-Level Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                         USER                                   │
│                    (Web Browser)                               │
└─────────────────────────┬─────────────────────────────────────┘
                          │ HTTP/JSON
┌─────────────────────────▼─────────────────────────────────────┐
│                   FRONTEND (React + TS)                        │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Presentation Layer                                      │  │
│  │  • Dashboard, Manual Predict, Auto Predict, History     │  │
│  └──────────────────────────┬───────────────────────────────┘  │
│  ┌──────────────────────────▼───────────────────────────────┐  │
│  │  UI Components Layer                                     │  │
│  │  • KpiCard, Charts, Predictions, Recommendations        │  │
│  └──────────────────────────┬───────────────────────────────┘  │
│  ┌──────────────────────────▼───────────────────────────────┐  │
│  │  Services Layer                                          │  │
│  │  • API Client (Real + Mock)                             │  │
│  └──────────────────────────┬───────────────────────────────┘  │
└─────────────────────────────┼─────────────────────────────────┘
                              │ REST API
┌─────────────────────────────▼─────────────────────────────────┐
│                    BACKEND (FastAPI)                          │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  API Layer (main.py)                                     │  │
│  │  • Endpoints, Request/Response Models, CORS             │  │
│  └──────────────────────────┬───────────────────────────────┘  │
│  ┌──────────────────────────▼───────────────────────────────┐  │
│  │  Business Logic Layer (Services)                        │  │
│  │  • TelemetryGenerator, FeatureAggregator               │  │
│  │  • StabilityScorer, ClusterInterpreter                 │  │
│  │  • RecommendationsEngine                               │  │
│  └─────┬────────────────────┬────────────────────┬──────────┘  │
│  ┌─────▼─────┐  ┌───────────▼──────┐  ┌──────────▼────────┐  │
│  │Model      │  │ Database         │  │ Telemetry         │  │
│  │Loader     │  │ Manager          │  │ Storage           │  │
│  │(Singleton)│  │ (SQLite)         │  │ (In-Memory)       │  │
│  └───────────┘  └──────────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 + TypeScript | UI framework |
| UI Components | Recharts, Lucide Icons | Data viz + icons |
| Styling | Tailwind CSS v4 | Responsive styling |
| Build | Vite | Fast dev server + build |
| Backend | FastAPI (Python 3.8+) | REST API server |
| Validation | Pydantic v2 | Request/response schemas |
| ML Framework | scikit-learn | Model serving |
| Database | SQLite | Analysis history |
| Data Processing | NumPy, Pandas | Telemetry aggregation |

---

## Backend Design

### Module Structure

```
backend/
├── main.py                      # API entry point, endpoint definitions
├── models/
│   └── model_loader.py          # Singleton for loading/serving ML models
├── services/
│   ├── telemetry_generator.py   # Synthetic IoT data generation
│   ├── feature_aggregator.py    # Compute Day-7 features from telemetry
│   ├── stability_scorer.py      # Variance-based stability assessment
│   ├── cluster_interpreter.py   # Cluster ID → description mapping
│   └── recommendations_engine.py # Generate safe recommendations
├── database/
│   └── db_manager.py            # SQLite CRUD operations
└── schemas/
    ├── requests.py              # Pydantic request models
    └── responses.py             # Pydantic response models
```

### Key Classes & Responsibilities

#### 1. ModelLoader (Singleton)

**Purpose**: Load and serve ML models on startup

**Methods**:
- `load_all_models()`: Load .pkl files, extract feature names
- `predict_regression(X)`: Return yield estimate
- `predict_classification(X)`: Return category + probabilities
- `predict_cluster(X)`: Return cluster ID
- `get_feature_importance()`: Return global importance dict
- `get_model_info()`: Return metadata

**State**:
- `regressor`: Random Forest regressor
- `classifier`: Random Forest classifier
- `clusterer`: KMeans clusterer
- `feature_names`: List of expected features in correct order

**Design Decisions**:
- Singleton pattern ensures models loaded once
- Graceful fallback to mock models if .pkl files missing
- Validates feature order using `feature_names_in_`

#### 2. TelemetryGenerator

**Purpose**: Generate realistic sensor streams with scenarios

**Scenarios**:
1. **Stable Farm**: Optimal, low variance
2. **pH Drift**: Slow drift downward
3. **Heat Stress**: Elevated temps, rising
4. **Nutrient Dilution**: EC declining
5. **Light Spike**: Periodic lux spikes
6. **Random Noise**: High variance

**Methods**:
- `start(scenario, freq_minutes, duration_hours)`: Begin generation
- `stop()`: Halt generation
- `reset()`: Clear data
- `get_current_reading()`: Latest point
- `get_history(time_delta)`: Filtered history
- `load_from_dataframe(df)`: CSV upload

**State**:
- `data`: List of telemetry points (in-memory, max 10k)
- `running`: Boolean flag
- `thread`: Background thread for generation

**Design Decisions**:
- Thread-safe with locks
- Smooth trends (not random jumps) via drift + noise
- Clamping to realistic ranges
- Configurable frequency and duration

#### 3. FeatureAggregator

**Purpose**: Compute Day-7 mean features from telemetry window

**Logic**:
```python
for sensor in [air_temp, lux, ph, water_temp, rh, ec, tds]:
    d7_{sensor}_mean = mean(sensor_values_in_window)
```

**Output**: Feature dict matching model's expected schema

#### 4. StabilityScorer

**Purpose**: Assess environmental stability from variance

**Algorithm**:
1. Compute std for each sensor over window
2. Normalize std against reference values (from training data distribution)
3. Convert to stability score: `score = 100 * exp(-normalized_variance)`
4. Average across sensors → overall score
5. Classify: Stable (≥75), Moderate (50-74), Unstable (<50)

**Design Decisions**:
- Heuristic, not statistical certainty
- Exponential decay ensures high scores only for low variance
- Reference stds are domain-specific (adjustable)

#### 5. ClusterInterpreter

**Purpose**: Map cluster IDs to human-readable descriptions

**Data Structure**:
```python
CLUSTER_DESCRIPTIONS = {
    0: {
        "label": "Optimal Balanced",
        "description": "...",
        "typical_pattern": "Air ~24°C, Water ~20°C, ...",
        "recommended_focus": "..."
    },
    ...
}
```

**Design Decisions**:
- Descriptions derived from centroid analysis + domain expertise
- Fallback for unknown cluster IDs
- Extensible for additional clusters

#### 6. RecommendationsEngine

**Purpose**: Generate ranked, safe, actionable recommendations

**Algorithm**:
1. Check stability → high priority if unstable
2. For each feature:
   - Compare to optimal range
   - Compute deviation
   - Priority = importance × deviation × stability_factor
3. Generate recommendation with:
   - Action (qualitative: "consider increasing/decreasing")
   - Reason (quantitative: deviation + importance)
   - Caution (safety notes, NO dosing quantities)
4. Sort by priority (High → Medium → Low)

**Constraints**:
- **NO dosing quantities** (e.g., "add 5ml of pH Down")
- **Only controllable parameters** (exclude humidity if uncontrollable)
- **Gradual adjustments** emphasized
- **Safety cautions** for each action

**Optimal Ranges** (configurable):
- pH: 5.8 - 6.5
- EC: 1.2 - 2.2 mS/cm
- Air Temp: 20 - 26°C
- Water Temp: 18 - 22°C
- Lux: 20,000 - 30,000
- RH: 50 - 70%
- TDS: 600 - 1100 ppm

#### 7. DatabaseManager

**Purpose**: Persist analysis history

**Schema**:
```sql
CREATE TABLE analyses (
    id INTEGER PRIMARY KEY,
    timestamp TEXT,
    mode TEXT,  -- manual | auto
    scenario TEXT,
    yield_estimate REAL,
    yield_category TEXT,
    cluster_id INTEGER,
    cluster_label TEXT,
    stability_score REAL,
    stability_label TEXT,
    features TEXT,  -- JSON
    recommendations TEXT,  -- JSON
    created_at TEXT
);
```

**Methods**:
- `initialize()`: Create tables if not exist
- `save_analysis(data)`: Insert record
- `get_analyses(limit)`: Retrieve history

**Design Decisions**:
- SQLite for simplicity (no separate DB server)
- JSON fields for flexibility (features, recommendations)
- Auto-create DB on first run

---

## Frontend Design

### Page Structure

```
src/app/
├── App.tsx                    # Main app, routing, nav
├── pages/
│   ├── DashboardPage.tsx      # Live telemetry + scenario control
│   ├── ManualPredictPage.tsx  # Manual feature entry + prediction
│   ├── AutoPredictPage.tsx    # Auto feature computation + prediction
│   └── HistoryPage.tsx        # Browse saved analyses
```

### Component Hierarchy

```
App
├── NavBar
└── CurrentPage
    ├── DashboardPage
    │   ├── ScenarioControls
    │   ├── KpiCard (×7)
    │   ├── StabilityBadge
    │   └── TimeSeriesChart (×6)
    ├── ManualPredictPage
    │   ├── InputForm
    │   ├── PredictionCards
    │   ├── ClusterCard
    │   ├── FeatureImportanceChart
    │   └── RecommendationList
    ├── AutoPredictPage
    │   ├── WindowSelector
    │   ├── ComputedFeaturesTable
    │   ├── PredictionCards
    │   ├── ClusterCard
    │   ├── FeatureImportanceChart
    │   └── RecommendationList
    └── HistoryPage
        ├── AnalysisList
        └── AnalysisDetailView
```

### Key Components

#### KpiCard
- Display single sensor value with unit
- Optional trend indicator
- Color-coded by sensor type

#### TimeSeriesChart (Recharts)
- Line chart for sensor history
- X-axis: Time (localized)
- Y-axis: Sensor value with unit
- Tooltip with full timestamp

#### PredictionCards
- 3-card layout: Yield | Category | Cluster
- Visual hierarchy: Large numbers, color-coded categories

#### RecommendationList
- Priority badges (High/Medium/Low)
- Expandable details (action, reason, caution)
- Safety disclaimer at bottom

#### FeatureImportanceChart (Recharts)
- Horizontal bar chart
- Color-coded bars
- Sorted descending by importance

#### StabilityBadge
- Color-coded (green/yellow/red)
- Score display (X/100)
- Optional detailed message

### State Management

**Strategy**: React useState (no Redux needed for this scale)

**State Locations**:
- App-level: `currentPage`, `demoMode`
- Page-level: `loading`, `error`, `data`
- Component-level: `selectedWindow`, `formData`

**API Communication**:
- Centralized API client (`services/api.ts`)
- Mock API client (`services/mockApi.ts`) for demo mode
- Error handling at service layer

---

## Data Flow

### Manual Prediction Flow

```
User enters values in form
    ↓
Frontend validates input
    ↓
POST /predict/manual {features}
    ↓
Backend: ModelLoader.predict_regression(X)
Backend: ModelLoader.predict_classification(X)
Backend: ModelLoader.predict_cluster(X)
Backend: ModelLoader.get_feature_importance()
Backend: ClusterInterpreter.interpret(cluster_id)
Backend: RecommendationsEngine.generate(...)
    ↓
Response: PredictionResponse
    ↓
Frontend: Display results
```

### Auto Prediction Flow

```
User selects window (e.g., 7d)
    ↓
POST /predict/auto {window}
    ↓
Backend: TelemetryGenerator.get_history(window)
Backend: FeatureAggregator.aggregate(telemetry) → X
Backend: StabilityScorer.compute_stability(telemetry)
Backend: ModelLoader.predict_*(X)
Backend: ClusterInterpreter.interpret(...)
Backend: RecommendationsEngine.generate(...)
    ↓
Response: PredictionResponse + metadata
    ↓
Frontend: Display computed features + results
```

### Telemetry Simulation Flow

```
User selects scenario + clicks Start
    ↓
POST /telemetry/sim/start {scenario, freq_minutes}
    ↓
Backend: TelemetryGenerator.start()
    ↓
Background thread generates data every freq_minutes
    ↓
Frontend polls GET /telemetry/current every 5 seconds
    ↓
Display updates in real-time
```

---

## ML Pipeline

### Training (Offline)

**Note**: Training is NOT part of this application. Pre-trained models are expected.

Expected training process:
1. Collect historical data: environmental sensors + final yield
2. Feature engineering: Compute Day-7 means per plant
3. Train/test split: Group-based 70/30 (by experiment/treatment)
4. Train Random Forest regressor (yield)
5. Train Random Forest classifier (category: Low/Medium/High)
6. Train KMeans clusterer (k=4, growth patterns)
7. Save models as .pkl files

### Inference (Online)

**Input**: Feature vector (7 features, Day-7 means)

**Process**:
1. Validate feature order matches `feature_names_in_`
2. Convert dict → numpy array in correct order
3. Call `model.predict(X)`
4. Post-process output (rounding, units)
5. Return structured response

**Performance**:
- Prediction latency: <100ms
- Batch predictions: Not required (single-plant predictions)

**Model Versioning**:
- Current: v1
- Future: Load models from versioned directory (e.g., `models/v2/`)

---

## Safety & Constraints

### Hard Constraints

1. **NO Dosing Quantities**: Recommendations NEVER include "add Xml of Y"
2. **NO Automated Control**: System NEVER sends commands to actuators
3. **NO Identifiers as Features**: experiment, treatment, replicate, plant_no excluded
4. **Gradual Adjustments Only**: All recommendations emphasize slow changes
5. **Expert Consultation**: Disclaimer on every prediction output

### Soft Constraints

1. **Stability Awareness**: Low stability → warn user before trusting prediction
2. **Controllability Focus**: Prioritize controllable parameters (pH, EC, temp, light)
3. **Range Validation**: Input values clamped/validated to realistic ranges
4. **Unit Display**: All numbers include units and appropriate precision

### Error Handling

**Backend**:
- Pydantic validation errors → HTTP 422 with detail
- Insufficient data → HTTP 400 with message
- Models not loaded → HTTP 503 with detail
- Database errors → HTTP 500 with generic message

**Frontend**:
- Network errors → Display error message + retry option
- Loading states → Spinner + "Loading..." text
- Empty states → Helpful message + CTA

---

## Performance Considerations

### Backend

- **Model Loading**: Once on startup (singleton)
- **Telemetry Storage**: In-memory (max 10k points, FIFO)
- **Database**: SQLite (sufficient for <10k analyses)
- **Concurrency**: Single-threaded FastAPI (sufficient for low-concurrency use)

**Bottlenecks**:
- Telemetry generation thread (minimal overhead)
- Database writes (async recommended for production)

**Optimizations**:
- Pre-compute feature importance on startup
- Cache cluster descriptions (static)

### Frontend

- **Bundle Size**: Code-splitting by page (Vite handles)
- **Chart Rendering**: Recharts with virtualization for >1000 points
- **Polling**: 5-second interval for current telemetry (acceptable)

**Bottlenecks**:
- Large telemetry datasets (>1000 points) → consider pagination

**Optimizations**:
- Lazy load pages
- Memoize expensive computations
- Debounce API calls

---

## Future Enhancements

### Phase 2 (Production Hardening)

1. **Authentication**: JWT-based API authentication
2. **Multi-User**: User accounts + role-based access
3. **WebSocket**: Real-time telemetry streaming
4. **Rate Limiting**: Prevent abuse
5. **Logging**: Structured logging (JSON)
6. **Monitoring**: Prometheus metrics + Grafana dashboards

### Phase 3 (Advanced Features)

1. **Model Retraining**: Upload new data → retrain models
2. **A/B Testing**: Compare model versions
3. **Alert System**: Email/SMS alerts for anomalies
4. **Export**: CSV/PDF report generation
5. **Multi-Crop**: Separate models per crop type
6. **Mobile App**: React Native companion app

### Phase 4 (Integration)

1. **Real IoT Sensors**: MQTT, Modbus, HTTP integration
2. **Actuator Control**: Semi-automated recommendations with approval
3. **Cloud Sync**: Optional cloud backup
4. **Multi-Farm**: Manage multiple farms
5. **Benchmark Database**: Compare against global dataset

---

## Deployment Architecture (Production)

```
┌────────────────────────────────────────────────────────┐
│                    Load Balancer                       │
│                     (Nginx/HAProxy)                    │
└──────┬─────────────────────────────────┬──────────────┘
       │                                 │
┌──────▼─────────┐             ┌─────────▼──────────┐
│   Frontend      │             │   Frontend         │
│  (Static Files) │             │  (Static Files)    │
│   Nginx/CDN     │             │   Nginx/CDN        │
└─────────────────┘             └────────────────────┘
       │                                 │
       └─────────────┬───────────────────┘
                     │ API Requests
           ┌─────────▼──────────┐
           │   API Gateway      │
           │  (Rate Limiting)   │
           └─────────┬──────────┘
                     │
       ┌─────────────┴──────────────┐
       │                            │
┌──────▼────────┐          ┌────────▼──────┐
│ Backend 1     │          │ Backend 2     │
│ (FastAPI +    │          │ (FastAPI +    │
│  Gunicorn)    │          │  Gunicorn)    │
└───────┬───────┘          └───────┬───────┘
        │                          │
        └────────┬──────────────────┘
                 │
        ┌────────▼─────────┐
        │   PostgreSQL     │
        │  (Replicated)    │
        └──────────────────┘
```

---

## Conclusion

HydroYield is designed as a production-ready, safety-first, explainable AIoT decision-support system. The architecture prioritizes:

✅ **Safety**: No automated control, safe recommendations  
✅ **Transparency**: Explainable predictions, feature importance  
✅ **Reliability**: Offline operation, graceful degradation  
✅ **Extensibility**: Modular design, easy to extend  
✅ **Performance**: Fast predictions, responsive UI  

The system is ready for deployment in research and commercial hydroponic operations with appropriate production hardening (authentication, monitoring, backup).

---

**Document Version:** 1.0  
**System Version:** 1.0.0  
**Last Review:** January 21, 2026
