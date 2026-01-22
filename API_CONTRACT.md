# HydroYield API Contract

**Complete API Specification with Schemas and Examples**

---

## Base URL

```
http://localhost:8000
```

---

## Authentication

Currently, no authentication is required. For production deployment, implement JWT or API key authentication.

---

## Response Format

All responses follow standard REST conventions:
- **Success**: HTTP 200-299 with JSON payload
- **Client Error**: HTTP 400-499 with error detail
- **Server Error**: HTTP 500-599 with error detail

Error response format:
```json
{
  "detail": "Error message describing the issue"
}
```

---

## Endpoints

### 1. Health Check

**GET** `/health`

Check system health and status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-21T10:30:00.000000",
  "models_loaded": true,
  "telemetry_active": false
}
```

---

### 2. Model Information

**GET** `/models/info`

Get model metadata and expected features.

**Response:**
```json
{
  "version": "v1",
  "expected_features": [
    "d7_air_temp_mean",
    "d7_lux_mean",
    "d7_ph_mean",
    "d7_water_temp_mean",
    "d7_rh_mean",
    "d7_ec_mean",
    "d7_tds_mean"
  ],
  "feature_count": 7,
  "models": {
    "regressor": {
      "type": "RandomForestRegressor",
      "has_feature_importance": true
    },
    "classifier": {
      "type": "RandomForestClassifier",
      "classes": ["Low", "Medium", "High"]
    },
    "clusterer": {
      "type": "KMeans",
      "n_clusters": 4
    }
  },
  "dataset_version": "V1",
  "feature_window": "Day 7 (≥7 days early-stage)"
}
```

---

### 3. Get Current Telemetry

**GET** `/telemetry/current`

Get the most recent telemetry reading.

**Response:**
```json
{
  "data": {
    "timestamp": "2026-01-21T10:30:00.000000",
    "air_temp": 24.2,
    "water_temp": 20.1,
    "ph": 6.18,
    "ec": 1.82,
    "tds": 910.0,
    "lux": 23500.0,
    "rh": 64.5
  },
  "message": null
}
```

**Response (No Data):**
```json
{
  "data": null,
  "message": "No telemetry data available. Start simulation first."
}
```

---

### 4. Get Telemetry History

**GET** `/telemetry/history?window={window}`

Get historical telemetry within a time window.

**Query Parameters:**
- `window` (string): Time window - `24h`, `3d`, `7d`, `14d`, `30d`

**Response:**
```json
{
  "window": "7d",
  "count": 672,
  "data": [
    {
      "timestamp": "2026-01-14T10:00:00.000000",
      "air_temp": 24.0,
      "water_temp": 20.0,
      "ph": 6.2,
      "ec": 1.8,
      "tds": 900.0,
      "lux": 23000.0,
      "rh": 65.0
    },
    // ... more readings
  ]
}
```

---

### 5. Start Telemetry Simulation

**POST** `/telemetry/sim/start`

Start synthetic telemetry generation.

**Request Body:**
```json
{
  "scenario": "Stable Farm",
  "freq_minutes": 15,
  "duration_hours": 24
}
```

**Request Schema:**
- `scenario` (string): One of: `Stable Farm`, `pH Drift`, `Heat Stress`, `Nutrient Dilution`, `Light Spike`, `Random Noise`
- `freq_minutes` (integer): Generation frequency in minutes (1-60)
- `duration_hours` (integer, optional): Duration limit in hours (null = unlimited)

**Response:**
```json
{
  "status": "started",
  "scenario": "Stable Farm",
  "freq_minutes": 15,
  "duration_hours": 24,
  "message": "Simulation started with 'Stable Farm' scenario"
}
```

---

### 6. Stop Telemetry Simulation

**POST** `/telemetry/sim/stop`

Stop telemetry generation.

**Response:**
```json
{
  "status": "stopped",
  "message": "Simulation stopped"
}
```

---

### 7. Reset Telemetry Data

**POST** `/telemetry/sim/reset`

Clear all telemetry data.

**Response:**
```json
{
  "status": "reset",
  "message": "Telemetry data cleared"
}
```

---

### 8. Upload CSV Telemetry

**POST** `/telemetry/upload_csv`

Upload CSV file with telemetry data.

**Request:**
- Content-Type: `multipart/form-data`
- File field: `file`

**CSV Format:**
```csv
timestamp,air_temp,lux,ph,water_temp,rh,ec,tds
2026-01-01T00:00:00,24.0,23000,6.2,20.0,65.0,1.8,900
2026-01-01T00:15:00,24.1,23100,6.19,20.1,64.8,1.81,905
...
```

**Required columns:**
- `timestamp`
- `air_temp`
- `lux`
- `ph`
- `water_temp`
- `rh`
- `ec`
- `tds`

**Response:**
```json
{
  "status": "success",
  "message": "Loaded 672 records from CSV",
  "rows": 672
}
```

---

### 9. Compute Features from Telemetry

**POST** `/features/compute`

Compute Day-7 proxy features from telemetry window.

**Request Body:**
```json
{
  "window": "7d"
}
```

**Request Schema:**
- `window` (string): Time window - `24h`, `3d`, `7d`, `14d`

**Response:**
```json
{
  "features": {
    "d7_air_temp_mean": 24.15,
    "d7_lux_mean": 23200.5,
    "d7_ph_mean": 6.18,
    "d7_water_temp_mean": 20.08,
    "d7_rh_mean": 64.82,
    "d7_ec_mean": 1.79,
    "d7_tds_mean": 895.3
  },
  "stability": {
    "score": 82.3,
    "label": "Stable",
    "color": "green",
    "message": "Environmental conditions are stable. Predictions are reliable.",
    "sensors": {
      "air_temp": {
        "std": 0.8,
        "normalized_variance": 0.4,
        "stability_score": 85.2
      },
      "ph": {
        "std": 0.09,
        "normalized_variance": 0.3,
        "stability_score": 88.1
      }
      // ... other sensors
    }
  },
  "window": "7d",
  "data_points": 672
}
```

---

### 10. Manual Prediction

**POST** `/predict/manual`

Predict yield from user-provided early-stage values.

**Request Body:**
```json
{
  "d7_air_temp_mean": 24.0,
  "d7_lux_mean": 23000.0,
  "d7_ph_mean": 6.2,
  "d7_water_temp_mean": 20.0,
  "d7_rh_mean": 65.0,
  "d7_ec_mean": 1.8,
  "d7_tds_mean": 900.0
}
```

**Request Schema:**
All fields required, numeric values within realistic ranges:
- `d7_air_temp_mean`: 15-35°C
- `d7_lux_mean`: 5000-50000 lux
- `d7_ph_mean`: 4.0-8.0
- `d7_water_temp_mean`: 15-30°C
- `d7_rh_mean`: 30-90%
- `d7_ec_mean`: 0.5-3.5 mS/cm
- `d7_tds_mean`: 250-1750 ppm

**Response:**
```json
{
  "mode": "manual",
  "timestamp": "2026-01-21T10:30:00.000000",
  "predictions": {
    "yield": {
      "yield": 185.4,
      "unit": "grams"
    },
    "category": {
      "category": "Medium",
      "probabilities": {
        "Low": 0.15,
        "Medium": 0.70,
        "High": 0.15
      }
    },
    "cluster": {
      "cluster": 0,
      "label": "Optimal Balanced",
      "description": "Balanced environmental conditions with moderate nutrients and ideal temperature range",
      "typical_pattern": "Air ~24°C, Water ~20°C, pH ~6.0, EC ~1.6, Lux ~22k",
      "recommended_focus": "Maintain current balance; monitor for drift"
    }
  },
  "features": {
    "d7_air_temp_mean": 24.0,
    "d7_lux_mean": 23000.0,
    "d7_ph_mean": 6.2,
    "d7_water_temp_mean": 20.0,
    "d7_rh_mean": 65.0,
    "d7_ec_mean": 1.8,
    "d7_tds_mean": 900.0
  },
  "stability": {
    "score": 75.0,
    "label": "Moderate",
    "color": "yellow",
    "message": "Manual entry - stability not computed",
    "sensors": {}
  },
  "feature_importance": {
    "d7_lux_mean": 0.22,
    "d7_air_temp_mean": 0.18,
    "d7_ph_mean": 0.15,
    "d7_ec_mean": 0.14,
    "d7_water_temp_mean": 0.12,
    "d7_tds_mean": 0.11,
    "d7_rh_mean": 0.08
  },
  "recommendations": [
    {
      "priority": "High",
      "category": "Stability",
      "action": "Stabilize environmental conditions",
      "reason": "High variability detected (stability score: 45.2/100). Unstable conditions reduce prediction confidence.",
      "caution": "Focus on reducing fluctuations before making other adjustments. Monitor sensors for equipment issues.",
      "controllable": true
    },
    {
      "priority": "Medium",
      "category": "Environmental Parameter",
      "action": "Consider gradually increasing Light Intensity",
      "reason": "Light Intensity is below optimal range (23000.00 < 25000). Feature importance: 22.00%.",
      "caution": "Adjust light height or intensity. Avoid sudden changes that can stress plants.",
      "controllable": true,
      "feature": "d7_lux_mean",
      "current_value": 23000.0
    }
  ],
  "disclaimer": "This is a decision-support tool only. Recommendations are general guidance. Adjust gradually and monitor carefully. Do not apply without agronomic expertise."
}
```

---

### 11. Auto Prediction

**POST** `/predict/auto`

Automatically compute features from telemetry and predict yield.

**Request Body:**
```json
{
  "window": "7d"
}
```

**Request Schema:**
- `window` (string): Time window for aggregation - `3d`, `7d`, `14d`

**Response:**
Same structure as Manual Prediction response, with additions:
- `mode`: `"auto"`
- `stability`: Real stability computation (not manual entry)
- `metadata`: Additional info about data quality

```json
{
  "mode": "auto",
  "timestamp": "2026-01-21T10:30:00.000000",
  "predictions": { /* same as manual */ },
  "features": { /* computed from telemetry */ },
  "stability": {
    "score": 82.3,
    "label": "Stable",
    "color": "green",
    "message": "Environmental conditions are stable. Predictions are reliable.",
    "sensors": { /* sensor-specific stability */ }
  },
  "feature_importance": { /* same as manual */ },
  "recommendations": [ /* same as manual */ ],
  "disclaimer": "...",
  "metadata": {
    "window": "7d",
    "data_points": 672
  }
}
```

**Error Response (Insufficient Data):**
```json
{
  "detail": "Insufficient telemetry data. Need at least 10 readings for 7d window"
}
```

---

### 12. Get Feature Importance

**GET** `/explain/feature_importance`

Get global feature importance from regression model.

**Response:**
```json
{
  "feature_importance": {
    "d7_lux_mean": 0.22,
    "d7_air_temp_mean": 0.18,
    "d7_ph_mean": 0.15,
    "d7_ec_mean": 0.14,
    "d7_water_temp_mean": 0.12,
    "d7_tds_mean": 0.11,
    "d7_rh_mean": 0.08
  },
  "description": "Global feature importance from Random Forest regressor. Higher values indicate stronger influence on yield predictions."
}
```

---

### 13. Get Analysis History

**GET** `/history/analyses?limit={limit}`

Get saved analysis history.

**Query Parameters:**
- `limit` (integer, optional): Max results to return (default: 50)

**Response:**
```json
{
  "count": 15,
  "analyses": [
    {
      "id": 1,
      "timestamp": "2026-01-21T10:30:00.000000",
      "mode": "auto",
      "scenario": "Stable Farm",
      "yield_estimate": 185.4,
      "yield_category": "Medium",
      "cluster_id": 0,
      "cluster_label": "Optimal Balanced",
      "stability_score": 82.3,
      "stability_label": "Stable",
      "features": { /* feature dict */ },
      "recommendations": [ /* recommendations array */ ],
      "created_at": "2026-01-21T10:30:15.000000"
    },
    // ... more analyses
  ]
}
```

---

### 14. Save Analysis

**POST** `/history/save`

Save analysis result to history.

**Request Body:**
```json
{
  "timestamp": "2026-01-21T10:30:00.000000",
  "mode": "auto",
  "scenario": "Stable Farm",
  "yield_estimate": 185.4,
  "yield_category": "Medium",
  "cluster_id": 0,
  "cluster_label": "Optimal Balanced",
  "stability_score": 82.3,
  "stability_label": "Stable",
  "features": {
    "d7_air_temp_mean": 24.0,
    "d7_lux_mean": 23000.0,
    "d7_ph_mean": 6.2,
    "d7_water_temp_mean": 20.0,
    "d7_rh_mean": 65.0,
    "d7_ec_mean": 1.8,
    "d7_tds_mean": 900.0
  },
  "recommendations": [ /* recommendations array */ ]
}
```

**Response:**
```json
{
  "status": "saved",
  "analysis_id": 16,
  "message": "Analysis saved to history"
}
```

---

## Data Types

### Telemetry Point
```typescript
{
  timestamp: string;        // ISO 8601 format
  air_temp: number;         // °C
  water_temp: number;       // °C
  ph: number;               // pH units
  ec: number;               // mS/cm
  tds: number;              // ppm
  lux: number;              // lux
  rh: number;               // %
}
```

### Feature Vector
```typescript
{
  d7_air_temp_mean: number;      // °C
  d7_lux_mean: number;           // lux
  d7_ph_mean: number;            // pH units
  d7_water_temp_mean: number;    // °C
  d7_rh_mean: number;            // %
  d7_ec_mean: number;            // mS/cm
  d7_tds_mean: number;           // ppm
}
```

### Stability Report
```typescript
{
  score: number;              // 0-100
  label: "Stable" | "Moderate" | "Unstable";
  color: "green" | "yellow" | "red";
  message: string;
  sensors: {
    [sensor: string]: {
      std: number;
      normalized_variance: number;
      stability_score: number;
    }
  }
}
```

### Recommendation
```typescript
{
  priority: "High" | "Medium" | "Low";
  category: string;
  action: string;
  reason: string;
  caution: string;
  controllable: boolean;
  feature?: string;
  current_value?: number;
}
```

---

## Rate Limiting

Currently no rate limiting. For production, implement rate limiting:
- 100 requests/minute per IP for standard endpoints
- 10 requests/minute for prediction endpoints

---

## CORS

CORS is enabled for:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000`
- All origins (`*`) for development

For production, restrict to specific allowed origins.

---

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource not found |
| 422 | Validation Error - Pydantic validation failed |
| 500 | Internal Server Error |
| 503 | Service Unavailable - Models not loaded |

---

## Versioning

Current API version: **v1**

Future versions will be prefixed: `/v2/predict/auto`

---

## WebSocket Support (Future)

Future versions may include WebSocket support for real-time telemetry streaming:

```
ws://localhost:8000/ws/telemetry
```

---

## Notes

1. All timestamps are in UTC ISO 8601 format
2. Numeric values are rounded to appropriate precision
3. Feature order must match model's `feature_names_in_`
4. Recommendations never include dosing quantities (safety constraint)
5. SQLite database is created automatically on first run

---

**For interactive API testing, visit:** http://localhost:8000/docs
