# HydroYield — Comprehensive Application Description

**Version:** 1.0  
**Stack:** FastAPI (Python) · React · TypeScript · Vite · Tailwind CSS · SQLite · scikit-learn

---

## Table of Contents

1. [What HydroYield Is](#1-what-hydroyield-is)
2. [Problem It Solves](#2-problem-it-solves)
3. [Target Users](#3-target-users)
4. [High-Level Architecture](#4-high-level-architecture)
5. [Backend — FastAPI Python Service](#5-backend--fastapi-python-service)
   - 5.1 [Startup & Lifecycle](#51-startup--lifecycle)
   - 5.2 [API Endpoints (18 total)](#52-api-endpoints-18-total)
   - 5.3 [ML Model Loader](#53-ml-model-loader)
   - 5.4 [Telemetry Generator](#54-telemetry-generator)
   - 5.5 [Feature Aggregator](#55-feature-aggregator)
   - 5.6 [Stability Scorer](#56-stability-scorer)
   - 5.7 [Cluster Interpreter](#57-cluster-interpreter)
   - 5.8 [Recommendations Engine](#58-recommendations-engine)
   - 5.9 [Database Manager (SQLite)](#59-database-manager-sqlite)
   - 5.10 [Pydantic Schemas](#510-pydantic-schemas)
6. [Frontend — React + TypeScript SPA](#6-frontend--react--typescript-spa)
   - 6.1 [Application Shell & Routing](#61-application-shell--routing)
   - 6.2 [Dashboard Page](#62-dashboard-page)
   - 6.3 [Manual Predict Page](#63-manual-predict-page)
   - 6.4 [Auto Predict Page](#64-auto-predict-page)
   - 6.5 [History Page](#65-history-page)
   - 6.6 [Reusable UI Components](#66-reusable-ui-components)
   - 6.7 [API Client & Mock API](#67-api-client--mock-api)
   - 6.8 [TypeScript Type Definitions](#68-typescript-type-definitions)
7. [Machine Learning Pipeline](#7-machine-learning-pipeline)
   - 7.1 [Input Features](#71-input-features)
   - 7.2 [Regression Model](#72-regression-model)
   - 7.3 [Classification Model](#73-classification-model)
   - 7.4 [Clustering Model](#74-clustering-model)
   - 7.5 [Feature Importance](#75-feature-importance)
   - 7.6 [Mock Models (Fallback)](#76-mock-models-fallback)
8. [Telemetry Simulation System](#8-telemetry-simulation-system)
9. [Stability & Confidence Assessment](#9-stability--confidence-assessment)
10. [Recommendations Engine — Design & Safety Rules](#10-recommendations-engine--design--safety-rules)
11. [Demo Mode vs. Full-Stack Mode](#11-demo-mode-vs-full-stack-mode)
12. [Data Storage](#12-data-storage)
13. [Technology Stack (Complete)](#13-technology-stack-complete)
14. [Project File Tree](#14-project-file-tree)
15. [Configuration & Environment Variables](#15-configuration--environment-variables)
16. [Running the Application](#16-running-the-application)
17. [Security Posture & Known Limitations](#17-security-posture--known-limitations)
18. [Extending the System](#18-extending-the-system)

---

## 1. What HydroYield Is

HydroYield is a **full-stack AIoT (Artificial Intelligence of Things) decision-support system** for hydroponic farming. It ingests simulated (or real) IoT sensor data from a growing environment and uses three pre-trained machine-learning models to forecast:

| Output | Type | Description |
|--------|------|-------------|
| **Yield estimate** | Regression | Predicted final harvest weight in grams |
| **Yield category** | Classification | Low / Medium / High label with per-class probabilities |
| **Growth cluster** | Clustering | Which of 4 known growth-pattern archetypes the crop belongs to |

Beyond raw predictions the system also delivers:

- **Environmental stability score** (0–100) computed from real-time sensor variance.
- **Ranked, safe recommendations** for pH, EC, temperature, humidity, and light.
- **Feature importance visualization** showing which sensor readings matter most.
- **Human-readable cluster descriptions** explaining what each growth archetype means.

All computation runs entirely on local infrastructure — there are **no cloud dependencies**.

---

## 2. Problem It Solves

In traditional hydroponics, growers must wait until harvest to know whether conditions were optimal. HydroYield addresses this by:

1. **Early yield forecasting** — given sensor data from **≥ 7 days** into the crop cycle, the system predicts final harvest weight. Growers can act while there is still time to adjust.
2. **Explainability** — the system shows *why* it made a prediction (feature importances) and *where* conditions are suboptimal.
3. **Safe guidance** — recommendations never include exact dosing quantities or automated control actions; they use language like "consider gradually increasing" with specific safety cautions.
4. **Pattern recognition** — clustering identifies which environmental archetype a crop is experiencing, enabling comparison against known patterns.

---

## 3. Target Users

| User | Key Needs | HydroYield Offers |
|------|-----------|-------------------|
| **Commercial growers** | Early yield forecast, harvest planning | Regression output, stability badge |
| **Agronomic researchers** | Scenario exploration, model transparency | 6 simulation scenarios, feature importance, cluster analysis |
| **Software/ML engineers** | Clean architecture, API-first design | Full REST API + OpenAPI docs, demo mode, extensible services |
| **Educators** | AIoT teaching example | Mock models, demo mode, documented code |

---

## 4. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                 FRONTEND  (React + TypeScript)               │
│                                                              │
│  ┌───────────┐ ┌──────────────┐ ┌─────────────┐ ┌────────┐  │
│  │ Dashboard │ │Manual Predict│ │ Auto Predict│ │History │  │
│  └───────────┘ └──────────────┘ └─────────────┘ └────────┘  │
│                         │                                    │
│              ┌──────────▼──────────┐                         │
│              │  API Client         │  ← Real (api.ts)        │
│              │  (or Mock API)      │  ← Demo (mockApi.ts)    │
│              └──────────┬──────────┘                         │
└─────────────────────────│────────────────────────────────────┘
                          │  HTTP / JSON  (port 8000)
┌─────────────────────────▼────────────────────────────────────┐
│                  BACKEND  (FastAPI, Python)                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  18 REST Endpoints  (CORS-enabled, Pydantic-validated)│   │
│  └────┬────────────────┬───────────────┬────────────────┘   │
│       │                │               │                     │
│  ┌────▼───┐   ┌────────▼────────┐  ┌──▼────────┐            │
│  │ Model  │   │   Telemetry     │  │ Database  │            │
│  │ Loader │   │   Generator     │  │ (SQLite)  │            │
│  │ ·Regr. │   │   6 scenarios   │  │ ·telemetry│            │
│  │ ·Class.│   │   in-memory     │  │ ·analyses │            │
│  │ ·Clust.│   └────────┬────────┘  └───────────┘            │
│  └────┬───┘            │                                     │
│       │       ┌────────▼────────────────────────────────┐   │
│       │       │           Services Layer                 │   │
│       └──────►│  Feature Aggregator  │  Stability Scorer│   │
│               │  Cluster Interpreter │  Recommendations  │   │
│               └─────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

**Communication flow:**
1. Frontend requests data via `fetch()` from the API client.
2. The FastAPI backend validates requests with Pydantic, calls the appropriate services, and returns typed JSON responses.
3. In **demo mode** the frontend bypasses the backend entirely and uses `mockApi.ts` with pre-generated realistic data.

---

## 5. Backend — FastAPI Python Service

Entry point: `backend/main.py`  
Server: Uvicorn (ASGI) on port 8000 by default

### 5.1 Startup & Lifecycle

The application uses a FastAPI **lifespan context manager** to:

1. Instantiate and load all three ML models (`ModelLoader.load_all_models()`).
2. Instantiate the `TelemetryGenerator` (ready to receive start commands).
3. Instantiate the `DatabaseManager` and auto-create tables if they don't exist.

On shutdown, the telemetry background thread is stopped and the database connection is closed cleanly.

CORS is configured to allow `http://localhost:5173`, `http://localhost:3000`, and all origins (`*`) for development convenience.

### 5.2 API Endpoints (18 total)

#### Health & Info

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Returns system health: models loaded, telemetry active, timestamp |
| `GET` | `/models/info` | Returns model metadata: type names, feature list, dataset version |

#### Telemetry

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/telemetry/current` | Most recent sensor reading from in-memory buffer |
| `GET` | `/telemetry/history?window=7d` | Historical readings within `24h`, `3d`, `7d`, `14d`, or `30d` |
| `POST` | `/telemetry/sim/start` | Start background IoT simulation (body: `scenario`, `freq_minutes`, `duration_hours`) |
| `POST` | `/telemetry/sim/stop` | Stop the simulation thread |
| `POST` | `/telemetry/sim/reset` | Clear all in-memory telemetry data |
| `POST` | `/telemetry/upload_csv` | Upload a CSV file containing timestamped sensor data |

The CSV upload expects columns: `timestamp`, `air_temp`, `lux`, `ph`, `water_temp`, `rh`, `ec`, `tds`.

#### Features & Predictions

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/features/compute` | Compute Day-7 mean features + stability from telemetry window |
| `POST` | `/predict/manual` | Run all 3 ML tasks on user-supplied feature values |
| `POST` | `/predict/auto` | Compute features from telemetry then run all 3 ML tasks |
| `GET` | `/explain/feature_importance` | Global feature importances from the Random Forest regressor |

`/predict/manual` and `/predict/auto` both return the same `PredictionResponse` schema containing: yield, category, cluster, stability, feature importance, and ranked recommendations.

#### History

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/history/analyses?limit=50` | List saved analyses from SQLite |
| `POST` | `/history/save` | Persist an analysis result to the database |

### 5.3 ML Model Loader

File: `backend/models/model_loader.py`

`ModelLoader` follows a **singleton** pattern. On startup it tries to load three `.pkl` files from the `backend/models/` directory:

| File | Role |
|------|------|
| `rf_yield_regressor_v1.pkl` | Random Forest regressor (yield in grams) |
| `rf_yield_classifier_v1.pkl` | Random Forest classifier (Low / Medium / High) |
| `kmeans_growth_clusters_v1.pkl` | KMeans clusterer (4 growth patterns) |
| `scaler_v1.pkl` | Feature scaler (required for clustering) |
| `yield_class_thresholds.pkl` | Classification thresholds |

If any model file is absent the loader falls back to a **mock implementation** (see §7.6). Feature order is enforced by reading `feature_names_in_` from the regressor; if unavailable a hard-coded canonical order is used:

```
d7_air_temp_mean, d7_lux_mean, d7_ph_mean, d7_water_temp_mean,
d7_rh_mean, d7_ec_mean, d7_tds_mean
```

### 5.4 Telemetry Generator

File: `backend/services/telemetry_generator.py`

Simulates IoT sensors using a **background Python thread** and numpy random distributions. Each scenario defines per-sensor `mean`, `std`, and `drift` parameters.

**Six built-in scenarios:**

| Scenario | What It Simulates |
|----------|-------------------|
| **Stable Farm** | Optimal, near-constant conditions (all sensors at ideal means, minimal noise) |
| **pH Drift** | pH starts at 6.5 and drifts downward −0.015 per iteration; all other sensors stable |
| **Heat Stress** | Elevated air temp (~28 °C, slight upward drift) and water temp; humidity drops |
| **Nutrient Dilution** | EC and TDS both gradually decrease; simulates reservoir water top-up without nutrient replenishment |
| **Light Spike** | Normal conditions except lux adds a +5 000–10 000 spike every 20 iterations |
| **Random Noise** | All sensors have 2–5× normal standard deviation; unstable environment |

**Sensor realistic clamp ranges** (values are never generated outside these bounds):

| Sensor | Min | Max | Unit |
|--------|-----|-----|------|
| `air_temp` | 15 | 35 | °C |
| `water_temp` | 15 | 30 | °C |
| `ph` | 4.0 | 8.0 | — |
| `ec` | 0.5 | 3.5 | mS/cm |
| `tds` | 250 | 1750 | ppm |
| `lux` | 5 000 | 40 000 | lux |
| `rh` | 30 | 90 | % |

**Storage:** data is kept in a Python list (in-memory). Maximum capacity is 10 000 readings; older entries are discarded (FIFO).

**Frequency:** configurable via `freq_minutes` (default 15 minutes). In demo mode the frontend accelerates perceived time.

### 5.5 Feature Aggregator

File: `backend/services/feature_aggregator.py`

Takes a list of telemetry readings and computes the **arithmetic mean** of each sensor over the selected window. The output is the 7-element feature vector used for ML inference:

```python
{
  "d7_air_temp_mean": float,
  "d7_lux_mean":      float,
  "d7_ph_mean":       float,
  "d7_water_temp_mean": float,
  "d7_rh_mean":       float,
  "d7_ec_mean":       float,
  "d7_tds_mean":      float,
}
```

A minimum of **10 readings** is required; the endpoint returns HTTP 400 otherwise.

### 5.6 Stability Scorer

File: `backend/services/stability_scorer.py`

Measures how stable the environment was over the selected telemetry window using per-sensor standard deviation, normalized against reference values:

```
normalized_variance = std(sensor_values) / reference_std[sensor]
sensor_score = 100 × exp(−normalized_variance)
overall_score = mean(all sensor_scores)
```

**Reference standard deviations** (tuned to typical hydroponic variability):

| Sensor | Reference std |
|--------|--------------|
| `air_temp` | 2.0 °C |
| `water_temp` | 1.5 °C |
| `ph` | 0.3 |
| `ec` | 0.3 mS/cm |
| `tds` | 150 ppm |
| `lux` | 3 000 lux |
| `rh` | 8.0 % |

**Score labels:**

| Score | Label | Color | Meaning |
|-------|-------|-------|---------|
| 75–100 | Stable | Green | Reliable predictions |
| 50–74 | Moderate | Yellow | Moderate confidence |
| < 50 | Unstable | Red | Stabilize environment before acting |

The response also includes per-sensor breakdown (std, normalized variance, sensor-level score) for transparency.

### 5.7 Cluster Interpreter

File: `backend/services/cluster_interpreter.py`

Maps KMeans cluster IDs (0–3) to human-readable descriptions derived from centroid analysis and domain knowledge:

| Cluster | Label | Key Characteristic |
|---------|-------|--------------------|
| 0 | **Hot High-Light Dry** | Very high light and air temperature, low humidity; transpiration stress risk |
| 1 | **Low-Light Nutrient Heavy** | Low light + high EC/TDS; nutrient excess with insufficient photosynthesis |
| 2 | **Humid Balanced Growth** | High humidity, moderate temperature, balanced nutrients; closest to optimal |
| 3 | **Over-Driven High-Input** | High light + high nutrients + high heat + low humidity; vulnerable to burnout |

Each cluster description includes: `label`, `description`, `typical_pattern` (centroid values), and `recommended_focus` (targeted guidance).

### 5.8 Recommendations Engine

File: `backend/services/recommendations_engine.py`

Generates a ranked list of actionable recommendations by comparing current feature values against **optimal hydroponic ranges**:

| Feature | Optimal Min | Optimal Max | Unit |
|---------|-------------|-------------|------|
| `d7_ph_mean` | 5.8 | 6.5 | — |
| `d7_ec_mean` | 1.2 | 2.2 | mS/cm |
| `d7_air_temp_mean` | 20 | 26 | °C |
| `d7_water_temp_mean` | 18 | 22 | °C |
| `d7_lux_mean` | 20 000 | 30 000 | lux |
| `d7_rh_mean` | 50 | 70 | % |
| `d7_tds_mean` | 600 | 1 100 | ppm |

**Priority scoring formula:**

```
priority_score = feature_importance × deviation_from_optimal × stability_factor
```

Where `stability_factor = 1.0` if stability ≥ 70, else `0.7`.

| Priority score | Label |
|----------------|-------|
| > 0.15 | High |
| 0.08–0.15 | Medium |
| < 0.08 | Low |

**Safety constraints enforced by design:**
- No dosing quantities ever appear in any output.
- No chemical mixing steps.
- Every recommendation uses language: "consider gradually increasing/decreasing…"
- Every recommendation includes a specific safety caution per parameter (e.g., "Adjust pH gradually over 24–48 hours").
- If all parameters are within range, a "continue monitoring" recommendation is returned.
- If yield category is Low, an additional "review overall system performance" recommendation is appended.
- If stability score < 50, a high-priority "stabilize environment first" recommendation is prepended.

### 5.9 Database Manager (SQLite)

File: `backend/database/db_manager.py`

Auto-creates `backend/data/hydroyield.db` on first run. Two tables:

- **`telemetry_archive`** — time-indexed sensor readings written when telemetry is archived.
- **`analysis_history`** — each saved prediction with its full parameter set, predictions, recommendations, and timestamp.

The SQLite database has **no practical size limit** for analysis history and requires no external database server.

### 5.10 Pydantic Schemas

Files: `backend/schemas/requests.py`, `backend/schemas/responses.py`

All request and response bodies are validated by Pydantic v2, which also drives the automatic OpenAPI / Swagger UI generation at `http://localhost:8000/docs`.

**Key request models:**

| Model | Used By | Fields |
|-------|---------|--------|
| `SimStartRequest` | `/telemetry/sim/start` | `scenario`, `freq_minutes`, `duration_hours` |
| `PredictManualRequest` | `/predict/manual` | All 7 `d7_*_mean` fields |
| `PredictAutoRequest` | `/predict/auto` | `window` (7d, 14d, 3d) |
| `ComputeFeaturesRequest` | `/features/compute` | `window` |
| `SaveAnalysisRequest` | `/history/save` | Full analysis dict |

**Key response models:**

| Model | Returned By |
|-------|-------------|
| `HealthResponse` | `/health` |
| `ModelInfoResponse` | `/models/info` |
| `PredictionResponse` | `/predict/manual`, `/predict/auto` |
| `FeatureImportanceResponse` | `/explain/feature_importance` |
| `AnalysisHistoryResponse` | `/history/analyses` |

---

## 6. Frontend — React + TypeScript SPA

Entry point: `index.html` → `src/main.tsx`  
Build tool: Vite 6.3.5 with HMR  
Dev server: `http://localhost:5173`

### 6.1 Application Shell & Routing

File: `src/app/App.tsx`

The app is a **Single Page Application** with client-side routing between 4 pages. The persistent header contains:
- HydroYield logo and title.
- Navigation links: Dashboard · Manual Predict · Auto Predict · History.
- **Demo Mode toggle** (top-right checkbox) — when enabled all API calls go to `mockApi.ts` instead of the real backend.

The `demoMode` boolean is passed as a prop to every page.

### 6.2 Dashboard Page

File: `src/app/pages/DashboardPage.tsx`

The real-time monitoring hub. Features:

- **Scenario selector** — dropdown listing all 6 telemetry scenarios.
- **ScenarioControls** — Start / Stop / Reset buttons that POST to `/telemetry/sim/*`.
- **7 KPI cards** — one per sensor (air temp, water temp, pH, EC, TDS, lux, humidity), showing the latest value with unit.
- **TimeSeriesChart** — Recharts line chart of all sensors over a configurable time window (24h / 3d / 7d / 14d). Data is fetched by polling `/telemetry/history` every 5 seconds while simulation is running.
- **StabilityBadge** — color-coded indicator of current environmental stability (Stable / Moderate / Unstable).

### 6.3 Manual Predict Page

File: `src/app/pages/ManualPredictPage.tsx`

Allows a grower to type in 7 Day-7 mean values and get an instant prediction. Features:

- **7-field form** (managed by React Hook Form 7.55.0) pre-filled with agronomically optimal defaults:
  - Air Temp: 24 °C · Lux: 23 000 · pH: 6.2 · Water Temp: 20 °C · RH: 65% · EC: 1.8 mS/cm · TDS: 900 ppm
- **Predict Yield button** — POSTs to `/predict/manual`.
- On success the page renders:
  - **PredictionCards** — three cards: yield (grams), category (Low/Medium/High + probabilities), cluster (number + label).
  - **ClusterCard** — expanded cluster description with typical pattern and recommended focus.
  - **FeatureImportanceChart** — horizontal bar chart showing each feature's relative importance.
  - **RecommendationList** — ranked list of recommendations with priority badge, action, reason, and caution.
  - A disclaimer reminding users this is a decision-support tool only.

### 6.4 Auto Predict Page

File: `src/app/pages/AutoPredictPage.tsx`

Computes features automatically from live telemetry. Features:

- **Time-window selector** — choose 3d / 7d / 14d of telemetry to aggregate.
- **Run Auto Prediction button** — POSTs to `/predict/auto`.
- Before the prediction cards, shows:
  - **Computed Features table** — the 7 Day-7 mean values that were derived from telemetry (transparency).
  - **Stability score** with label and color.
  - Data point count used for aggregation.
- Then renders the same PredictionCards, ClusterCard, FeatureImportanceChart, and RecommendationList as manual mode.

### 6.5 History Page

File: `src/app/pages/HistoryPage.tsx`

Browses saved analyses stored in SQLite (or mock data in demo mode). Features:

- **Analysis list** — each entry shows timestamp, prediction mode (manual/auto), yield estimate, and category.
- **Detail view** — click an entry to expand: all 7 input features, all 3 prediction outputs, stability score, and recommendations.
- **Comparison** across predictions over time.
- **Export** functionality for result data.

### 6.6 Reusable UI Components

All components live in `src/components/`:

| Component | File | Purpose |
|-----------|------|---------|
| **KpiCard** | `KpiCard.tsx` | Large metric tile with value, unit, optional trend indicator |
| **TimeSeriesChart** | `TimeSeriesChart.tsx` | Multi-sensor Recharts `LineChart` with configurable time window |
| **StabilityBadge** | `StabilityBadge.tsx` | Color-coded badge (green/yellow/red) with score and label |
| **PredictionCards** | `PredictionCards.tsx` | Three-card row: yield, category (with probabilities), cluster |
| **ClusterCard** | `ClusterCard.tsx` | Expanded cluster detail: label, description, pattern, focus |
| **RecommendationList** | `RecommendationList.tsx` | Ranked list, each item has priority badge, action, reason, caution |
| **FeatureImportanceChart** | `FeatureImportanceChart.tsx` | Horizontal `BarChart` (Recharts) of feature importances |
| **ScenarioControls** | `ScenarioControls.tsx` | Scenario dropdown + Start / Stop / Reset buttons |

Additional low-level Shadcn UI primitives (50+) live in `src/components/ui/` — buttons, cards, inputs, dialogs, etc.

### 6.7 API Client & Mock API

**Real API** (`src/services/api.ts`):
- `APIClient` class with a base URL defaulting to `http://localhost:8000`.
- `fetch()` wrapper with 15-second timeout and JSON error handling.
- One typed method per backend endpoint.

**Mock API** (`src/services/mockApi.ts`):
- Identical interface to `APIClient`.
- Returns pre-generated, realistic mock data with simulated async delays.
- Used when demo mode is enabled; no network requests are made.

### 6.8 TypeScript Type Definitions

File: `src/types/index.ts`

Centralized TypeScript interfaces for all data structures:

```typescript
TelemetryPoint          // { timestamp, air_temp, lux, ph, water_temp, rh, ec, tds }
FeatureVector           // { d7_air_temp_mean, d7_lux_mean, d7_ph_mean, ... }
YieldPrediction         // { yield: number, unit: "grams" }
CategoryPrediction      // { category: "Low"|"Medium"|"High", probabilities: {...} }
ClusterPrediction       // { cluster: number, label, description, ... }
StabilityReport         // { score, label, color, message, sensors: {...} }
Recommendation          // { priority, category, action, reason, caution, controllable }
PredictionResponse      // Aggregates all of the above + features + feature_importance + disclaimer
AnalysisHistoryEntry    // Stored prediction with metadata
```

---

## 7. Machine Learning Pipeline

### 7.1 Input Features

The models accept exactly **7 scalar features** representing 7-day means of environmental sensors. Identifier columns (experiment ID, treatment, replicate, plant number) are **never** used as model inputs.

| Feature | Sensor | Unit | Typical Range |
|---------|--------|------|---------------|
| `d7_air_temp_mean` | Air temperature | °C | 20–26 |
| `d7_lux_mean` | Light intensity (PAR proxy) | lux | 20 000–30 000 |
| `d7_ph_mean` | Nutrient solution pH | — | 5.8–6.5 |
| `d7_water_temp_mean` | Nutrient solution temperature | °C | 18–22 |
| `d7_rh_mean` | Relative humidity | % | 50–70 |
| `d7_ec_mean` | Electrical conductivity | mS/cm | 1.2–2.2 |
| `d7_tds_mean` | Total dissolved solids | ppm | 600–1 100 |

### 7.2 Regression Model

- **Algorithm:** Random Forest Regressor
- **File:** `rf_yield_regressor_v1.pkl`
- **Output:** Continuous yield estimate in grams
- **Feature importance:** Extracted from `feature_importances_` attribute — used for the bar chart and to rank recommendations.

### 7.3 Classification Model

- **Algorithm:** Random Forest Classifier
- **File:** `rf_yield_classifier_v1.pkl`
- **Classes:** `Low`, `Medium`, `High`
- **Output:** Predicted class + per-class probabilities via `predict_proba()`
- **Thresholds:** Defined in `yield_class_thresholds.pkl`

### 7.4 Clustering Model

- **Algorithm:** KMeans
- **File:** `kmeans_growth_clusters_v1.pkl`
- **Clusters:** 4 (IDs 0–3)
- **Preprocessing:** Features are scaled using `scaler_v1.pkl` before cluster assignment
- **Output:** Cluster ID → passed to `ClusterInterpreter` for human-readable description

### 7.5 Feature Importance

Global importances from the Random Forest regressor (normalized, sum to 1.0). The mock model uses these default importances:

| Feature | Importance |
|---------|------------|
| `d7_lux_mean` | 0.22 |
| `d7_air_temp_mean` | 0.18 |
| `d7_ph_mean` | 0.15 |
| `d7_ec_mean` | 0.14 |
| `d7_water_temp_mean` | 0.12 |
| `d7_tds_mean` | 0.11 |
| `d7_rh_mean` | 0.08 |

### 7.6 Mock Models (Fallback)

If `.pkl` files are absent (e.g., first run or demo), the system instantiates in-memory mock classes:

- **Mock Regressor:** Heuristic using pH factor × light factor × EC factor on a 180 g base yield.
- **Mock Classifier:** Thresholds the mock regressor output (< 150 g → Low, 150–200 g → Medium, > 200 g → High).
- **Mock Clusterer:** Nearest-centroid distance on 4 hard-coded centroids.

---

## 8. Telemetry Simulation System

The simulation runs as a **daemon thread** inside the FastAPI process. Each iteration:

1. Applies drift (`mean + drift × iteration_count`) to shift the target mean over time.
2. Samples from a Gaussian distribution (`np.random.normal(drifted_mean, std)`).
3. Optionally adds a spike (Light Spike scenario, every 20 iterations).
4. Clamps values to realistic sensor bounds.
5. Appends the reading dict (with ISO timestamp) to the in-memory list.
6. Sleeps for `freq_minutes × 60` seconds.

The background thread is a **daemon thread** so it does not prevent Python process exit.

**Thread safety:** All reads and writes to the data list are protected by a `threading.Lock()`.

---

## 9. Stability & Confidence Assessment

The stability score answers: *"How much did sensor conditions vary during the analysis window?"*

A score of **100** means perfectly stable (no variance); **0** means extremely noisy.

The exponential decay formula (`100 × exp(−normalized_variance)`) means:
- A sensor reading with variance equal to the reference std scores ~37.
- A sensor reading with half the reference std scores ~61.
- A sensor reading well below the reference std (very stable) scores close to 100.

The overall score is the arithmetic mean across all 7 sensors. In **manual prediction mode** stability is fixed at 75 ("Moderate") because there is no telemetry window to assess.

---

## 10. Recommendations Engine — Design & Safety Rules

The engine is deliberately conservative:

1. **No quantities** — "Consider gradually increasing EC" not "Add 5 mL of nutrient concentrate per liter".
2. **Gradual emphasis** — cautions always mention incremental adjustment and monitoring.
3. **Controllable-only focus** — humidity and TDS receive lower controllability flags since they are harder to adjust directly.
4. **Stability gate** — if the environment is unstable, the top-priority recommendation is to stabilize first, before any parameter adjustments.
5. **Ranked output** — High → Medium → Low priority ordering so the most urgent action is always first.
6. **Safety cautions per parameter** — each of the 7 features has a bespoke caution string (pH: warn about 24–48 h adjustment window; temperature: warn about max 1–2 °C per day change; etc.).
7. **No automated control** — the system never writes to actuators, dosing pumps, or environmental controls.

---

## 11. Demo Mode vs. Full-Stack Mode

| Aspect | Demo Mode | Full-Stack Mode |
|--------|-----------|-----------------|
| Backend required | No | Yes (port 8000) |
| Telemetry data | Mock (in-memory, pre-generated) | Real simulation via FastAPI |
| Predictions | Mock heuristic responses | Real ML model inference |
| History persistence | In-memory only (lost on refresh) | SQLite database |
| Feature importance | Mock values | Real model importances |
| Toggle | Checkbox in top-right of app | Checkbox in top-right of app |

Demo mode is activated by a boolean `demoMode` state in `App.tsx`. When true, the API client is swapped from `api.ts` to `mockApi.ts` at the page component level.

---

## 12. Data Storage

### In-Memory Telemetry Buffer

- Up to **10 000 telemetry readings** stored as Python dicts in a list.
- FIFO eviction: when capacity is exceeded, the oldest readings are discarded.
- Survives API restarts only if the simulation is re-started.

### SQLite Database (`backend/data/hydroyield.db`)

- Auto-created on first backend startup.
- **`telemetry_archive` table** — optional archival of telemetry points.
- **`analysis_history` table** — every saved prediction (features, predictions, stability, recommendations, timestamp).
- No external database server required.
- For scale beyond ~10 000 analyses, PostgreSQL migration is recommended (architecture supports it via the `db_manager` abstraction).

---

## 13. Technology Stack (Complete)

### Backend

| Technology | Version | Role |
|------------|---------|------|
| Python | 3.8+ | Runtime |
| FastAPI | 0.109.0 | Web framework, OpenAPI generation |
| Uvicorn | 0.27.0 | ASGI server |
| Pydantic | 2.5.3 | Request/response validation |
| scikit-learn | 1.4.0 | ML model training & inference |
| NumPy | 1.26.3 | Numerical operations |
| Pandas | 2.1.4 | CSV parsing, DataFrame operations |
| joblib | (via scikit-learn) | Model serialization (`.pkl`) |
| SQLite 3 | built-in | Persistent storage |
| python-multipart | 0.0.6 | File upload (CSV) |

### Frontend

| Technology | Version | Role |
|------------|---------|------|
| React | 18.3.1 | UI framework |
| TypeScript | — | Type safety |
| Vite | 6.3.5 | Build tool, dev server, HMR |
| Tailwind CSS | v4 | Utility-first styling |
| Recharts | — | Data visualization (line & bar charts) |
| Lucide React | — | Icon library |
| Radix UI / Shadcn | — | 50+ accessible UI primitives |
| React Hook Form | 7.55.0 | Form state management |

---

## 14. Project File Tree

```
hydro-yield/
├── backend/
│   ├── main.py                        # FastAPI app, all 18 endpoints
│   ├── requirements.txt               # Python dependencies
│   ├── __init__.py
│   ├── models/
│   │   ├── model_loader.py            # ML model serving (singleton)
│   │   ├── rf_yield_regressor_v1.pkl  # Pre-trained Random Forest regressor
│   │   ├── rf_yield_classifier_v1.pkl # Pre-trained Random Forest classifier
│   │   ├── kmeans_growth_clusters_v1.pkl # Pre-trained KMeans
│   │   ├── scaler_v1.pkl              # Feature scaler
│   │   └── yield_class_thresholds.pkl # Classification thresholds
│   ├── services/
│   │   ├── telemetry_generator.py     # IoT simulation (6 scenarios)
│   │   ├── feature_aggregator.py      # 7-day mean computation
│   │   ├── stability_scorer.py        # Variance-based stability (0–100)
│   │   ├── cluster_interpreter.py     # Cluster ID → human description
│   │   └── recommendations_engine.py  # Safe, ranked recommendations
│   ├── database/
│   │   └── db_manager.py              # SQLite manager
│   ├── schemas/
│   │   ├── requests.py                # Pydantic request models
│   │   └── responses.py               # Pydantic response models
│   └── data/
│       └── hydroyield.db              # Auto-created SQLite database
│
├── src/
│   ├── main.tsx                       # React entry point
│   ├── app/
│   │   ├── App.tsx                    # Shell: routing + demo toggle
│   │   └── pages/
│   │       ├── DashboardPage.tsx      # Live telemetry + scenario controls
│   │       ├── ManualPredictPage.tsx  # Manual input → predictions
│   │       ├── AutoPredictPage.tsx    # Auto feature compute → predictions
│   │       └── HistoryPage.tsx        # Analysis history browser
│   ├── components/
│   │   ├── KpiCard.tsx
│   │   ├── TimeSeriesChart.tsx
│   │   ├── StabilityBadge.tsx
│   │   ├── PredictionCards.tsx
│   │   ├── ClusterCard.tsx
│   │   ├── RecommendationList.tsx
│   │   ├── FeatureImportanceChart.tsx
│   │   ├── ScenarioControls.tsx
│   │   └── ui/                        # Shadcn/Radix primitives (50+)
│   ├── services/
│   │   ├── api.ts                     # Real API client
│   │   └── mockApi.ts                 # Mock API for demo mode
│   └── types/
│       └── index.ts                   # TypeScript interfaces
│
├── index.html                         # HTML entry point
├── package.json                       # npm dependencies & scripts
├── tsconfig.json                      # TypeScript config
├── vite.config.ts                     # Vite + Tailwind config
├── postcss.config.mjs
├── run-backend.sh                     # Backend startup script
├── run-frontend.sh                    # Frontend startup script
├── README.md                          # Quick start & overview
├── APP_DESCRIPTION.md                 # This file
├── SETUP_INSTRUCTIONS.md              # Detailed setup guide
├── API_CONTRACT.md                    # Full API specification
├── SYSTEM_DESIGN.md                   # Architecture document
├── DELIVERY_SUMMARY.md                # Checklist & deliverables
└── QUICK_START.md                     # 2-minute getting-started guide
```

---

## 15. Configuration & Environment Variables

Create a `.env` file from `.env.example`:

```env
VITE_API_URL=http://localhost:8000   # Backend base URL (used by api.ts)
VITE_DEMO_MODE=false                 # Set true to start in demo mode
```

These are injected at build time by Vite and read at runtime via `import.meta.env`.

---

## 16. Running the Application

### Option A — Demo Mode (frontend only, no Python required)

```bash
npm install
npm run dev
# Open http://localhost:5173
# Click the Demo Mode checkbox if not already enabled
```

### Option B — Full Stack

**Terminal 1 — Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs auto-generated at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

**Terminal 2 — Frontend:**
```bash
npm install
npm run dev
# Open http://localhost:5173
# Disable Demo Mode to connect to the backend
```

### Production Build

```bash
# Frontend static files
npm run build           # Output → dist/

# Backend production server
pip install gunicorn
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

---

## 17. Security Posture & Known Limitations

### Current Security State (Reference Implementation)

| Control | Status |
|---------|--------|
| Input validation (Pydantic) | ✅ Implemented |
| CORS headers | ✅ Implemented |
| HTTP error codes | ✅ Implemented |
| Authentication / JWT | ❌ Not implemented |
| Rate limiting | ❌ Not implemented |
| HTTPS / TLS | ❌ Not implemented |
| Audit logging | ❌ Not implemented |

### For Production Deployment

- Add JWT authentication to all endpoints.
- Implement rate limiting (recommended: 100 req/min per client).
- Enable HTTPS with valid TLS certificates.
- Scope CORS `allow_origins` to the exact frontend domain.
- Add structured logging and monitoring.
- Implement automated backups of the SQLite database.

### Known Limitations

1. **Mock models** are used if `.pkl` files are absent — predictions are heuristic, not real ML.
2. **SQLite** is suitable for a single server but cannot scale horizontally.
3. **Single-threaded telemetry** — one scenario runs at a time; parallel scenario comparison is not supported.
4. **No WebSocket streaming** — the dashboard polls the API every 5 seconds rather than receiving push events.
5. **In-memory telemetry** does not survive server restarts.
6. **Not designed for PII** — the system stores sensor data only, not user or crop identity data.

---

## 18. Extending the System

### Add a New Telemetry Scenario

Edit `backend/services/telemetry_generator.py` → `SCENARIOS` dict. Add a new key with per-sensor `mean`, `std`, and `drift` values.

### Customize Optimal Ranges

Edit `backend/services/recommendations_engine.py` → `OPTIMAL_RANGES`. Changes take effect immediately on the next request.

### Add a New Sensor / Feature

1. Add the sensor to `TelemetryGenerator.SCENARIOS` and `_clamp_value`.
2. Add it to `FeatureAggregator` and `StabilityScorer.REFERENCE_STD`.
3. Retrain models with the new feature included.
4. Update `ModelLoader.feature_names` and `PredictManualRequest` schema.
5. Add input field to `ManualPredictPage.tsx` and the corresponding TypeScript type.

### Integrate Real IoT Sensors

Replace `telemetry_generator.py`'s background thread with a real data-ingestion adapter:
- **MQTT**: Subscribe to a broker topic; parse payloads into the same `TelemetryPoint` dict format.
- **HTTP push**: Add a `POST /telemetry/ingest` endpoint that accepts readings from edge devices.

### Retrain Models

The application is **inference-only** by design. Train new models offline (using scikit-learn), serialize them with `joblib.dump()`, replace the `.pkl` files, and restart the backend. No code changes are required if the feature order is preserved.

---

*HydroYield v1.0 — Grow Smarter, Not Harder* 🌱
