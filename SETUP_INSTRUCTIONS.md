# HydroYield - Setup & Run Instructions

**Production AIoT Decision-Support System for Hydroponic Yield Intelligence**

---

## 📋 System Overview

HydroYield is a full-stack AIoT decision-support system consisting of:

- **Backend**: FastAPI (Python) - ML model serving, telemetry generation, feature aggregation
- **Frontend**: React + TypeScript (Vite) - Interactive dashboard, predictions, visualizations
- **Database**: SQLite - Local storage for telemetry and analysis history
- **ML Models**: Pre-trained Random Forest (regression, classification) + KMeans (clustering)

---

## 🏗️ Architecture

```
hydroyield/
├── backend/                    # FastAPI Backend
│   ├── main.py                 # API server
│   ├── models/
│   │   ├── model_loader.py     # Model serving singleton
│   │   ├── rf_yield_regressor_v1.pkl      # (Place your model here)
│   │   ├── rf_yield_classifier_v1.pkl     # (Place your model here)
│   │   └── kmeans_growth_clusters_v1.pkl  # (Place your model here)
│   ├── services/
│   │   ├── telemetry_generator.py         # IoT simulation
│   │   ├── feature_aggregator.py          # Feature computation
│   │   ├── stability_scorer.py            # Stability assessment
│   │   ├── cluster_interpreter.py         # Cluster descriptions
│   │   └── recommendations_engine.py      # Safe recommendations
│   ├── database/
│   │   └── db_manager.py                  # SQLite manager
│   ├── schemas/
│   │   ├── requests.py                    # Pydantic request models
│   │   └── responses.py                   # Pydantic response models
│   ├── requirements.txt
│   └── data/
│       └── hydroyield.db                  # (Auto-created SQLite DB)
│
├── src/                        # React Frontend
│   ├── app/
│   │   ├── App.tsx             # Main app component
│   │   └── pages/
│   │       ├── DashboardPage.tsx          # Live telemetry
│   │       ├── ManualPredictPage.tsx      # Manual prediction
│   │       ├── AutoPredictPage.tsx        # Auto prediction
│   │       └── HistoryPage.tsx            # Analysis history
│   ├── components/             # Reusable UI components
│   ├── services/
│   │   ├── api.ts              # Backend API client
│   │   └── mockApi.ts          # Mock API for demo mode
│   └── types/
│       └── index.ts            # TypeScript types
│
└── .env.example                # Environment variables template
```

---

## 🚀 Quick Start

### Option 1: Demo Mode (Frontend Only)

**Run immediately without backend setup:**

```bash
# 1. Navigate to project root
cd hydroyield

# 2. Install dependencies (if not already done)
npm install

# 3. Start frontend dev server
npm run dev

# 4. Open browser to http://localhost:5173
```

✅ **Demo Mode** uses mock data and simulated API responses. Perfect for UI testing and demonstration.

---

### Option 2: Full Stack (Backend + Frontend)

#### **Step 1: Setup Backend**

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create Python virtual environment
python3 -m venv venv

# 3. Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# 4. Install Python dependencies
pip install -r requirements.txt

# 5. (Optional) Place pre-trained models in backend/models/
# If models are not present, the system will use mock models for demo purposes:
#   - rf_yield_regressor_v1.pkl
#   - rf_yield_classifier_v1.pkl
#   - kmeans_growth_clusters_v1.pkl

# 6. Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Server will start at: http://localhost:8000
# API docs available at: http://localhost:8000/docs
```

#### **Step 2: Setup Frontend**

```bash
# In a new terminal, navigate to project root
cd hydroyield

# 1. Install dependencies (if not already done)
npm install

# 2. Create .env file (or use default)
cp .env.example .env

# 3. Edit .env to connect to backend:
# VITE_API_URL=http://localhost:8000
# VITE_DEMO_MODE=false

# 4. Start frontend dev server
npm run dev

# Frontend will start at: http://localhost:5173
```

✅ **Full Stack Mode**: Frontend communicates with the real FastAPI backend.

---

## 📡 API Endpoints

Once the backend is running, explore the interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | System health check |
| GET | `/models/info` | Model metadata |
| GET | `/telemetry/current` | Latest sensor reading |
| GET | `/telemetry/history?window=7d` | Historical telemetry |
| POST | `/telemetry/sim/start` | Start simulation |
| POST | `/telemetry/sim/stop` | Stop simulation |
| POST | `/telemetry/sim/reset` | Reset telemetry |
| POST | `/predict/manual` | Manual prediction |
| POST | `/predict/auto` | Auto prediction |
| GET | `/explain/feature_importance` | Feature importance |
| GET | `/history/analyses` | Analysis history |

---

## 🧪 Testing the System

### 1. **Start Telemetry Simulation**

Navigate to **Dashboard** → Select scenario (e.g., "Stable Farm") → Click **Start**

Available scenarios:
- **Stable Farm**: Optimal conditions
- **pH Drift**: Gradual pH decline
- **Heat Stress**: Elevated temperatures
- **Nutrient Dilution**: EC decreasing
- **Light Spike**: Periodic light spikes
- **Random Noise**: High variability

### 2. **Manual Prediction**

Navigate to **Manual Predict** → Enter early-stage values → Click **Predict Yield**

Example values (optimal):
- Air Temp: 24°C
- Light: 23000 lux
- pH: 6.2
- Water Temp: 20°C
- Humidity: 65%
- EC: 1.8 mS/cm
- TDS: 900 ppm

### 3. **Auto Prediction**

Navigate to **Auto Predict** → Select window (e.g., "7d") → Click **Run Auto Prediction**

The system will:
- Compute mean features from telemetry
- Assess stability
- Generate predictions
- Provide ranked recommendations

### 4. **View History**

Navigate to **History** → Browse saved analyses (requires backend with database)

---

## 🔧 Configuration

### Backend Configuration

Edit `backend/main.py` to customize:
- CORS origins
- Database path
- Model paths

### Frontend Configuration

Edit `.env`:
```bash
# Backend API URL
VITE_API_URL=http://localhost:8000

# Enable/disable demo mode
VITE_DEMO_MODE=false
```

---

## 📦 Model Files

The system expects three pre-trained models in `backend/models/`:

1. **rf_yield_regressor_v1.pkl** - Random Forest regressor for yield prediction
2. **rf_yield_classifier_v1.pkl** - Random Forest classifier for yield category
3. **kmeans_growth_clusters_v1.pkl** - KMeans clusterer for growth patterns

**If models are not present**, the system will automatically use mock models that provide realistic predictions for demonstration purposes.

### Model Requirements:

- **Regressor**: Must have `feature_names_in_` and `feature_importances_` attributes
- **Classifier**: Must have `classes_` attribute and `predict_proba()` method
- **Clusterer**: Must have `n_clusters` and `cluster_centers_` attributes

### Expected Feature Order:

1. `d7_air_temp_mean`
2. `d7_lux_mean`
3. `d7_ph_mean`
4. `d7_water_temp_mean`
5. `d7_rh_mean`
6. `d7_ec_mean`
7. `d7_tds_mean`

---

## 🐳 Docker Deployment (Optional)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - ./backend/data:/app/data
    environment:
      - PYTHONUNBUFFERED=1
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build: .
    ports:
      - "5173:5173"
    volumes:
      - ./src:/app/src
    environment:
      - VITE_API_URL=http://localhost:8000
    depends_on:
      - backend
```

Run with:
```bash
docker-compose up
```

---

## ⚠️ Safety & Disclaimers

**This is a DECISION-SUPPORT tool only.**

- **No Automated Control**: Does not control actuators or dosing systems
- **No Dosing Quantities**: Recommendations are qualitative, not prescriptive
- **Gradual Adjustments**: All recommendations emphasize gradual changes
- **Expert Consultation**: Agronomic expertise is required before making changes
- **Not for PII**: This system is not designed to collect personally identifiable information
- **Not for Production**: This is a reference implementation. Additional security, validation, and testing required for production deployment

---

## 🛠️ Troubleshooting

### Backend won't start
- Check Python version (3.8+)
- Verify all dependencies installed: `pip install -r requirements.txt`
- Check port 8000 is available

### Frontend can't connect to backend
- Verify backend is running: `curl http://localhost:8000/health`
- Check CORS settings in `backend/main.py`
- Verify `.env` has correct `VITE_API_URL`

### "Insufficient data" error in Auto Predict
- Start telemetry simulation first
- Wait for at least 10 data points to accumulate
- Or upload CSV with historical data

### Models not loading
- Check model files exist in `backend/models/`
- Verify file permissions
- Check logs for detailed error messages
- System will use mock models if real models are missing

---

## 📊 Sample API Requests

### Start Simulation
```bash
curl -X POST http://localhost:8000/telemetry/sim/start \
  -H "Content-Type: application/json" \
  -d '{"scenario": "Stable Farm", "freq_minutes": 15, "duration_hours": 24}'
```

### Manual Prediction
```bash
curl -X POST http://localhost:8000/predict/manual \
  -H "Content-Type: application/json" \
  -d '{
    "d7_air_temp_mean": 24.0,
    "d7_lux_mean": 23000.0,
    "d7_ph_mean": 6.2,
    "d7_water_temp_mean": 20.0,
    "d7_rh_mean": 65.0,
    "d7_ec_mean": 1.8,
    "d7_tds_mean": 900.0
  }'
```

### Auto Prediction
```bash
curl -X POST http://localhost:8000/predict/auto \
  -H "Content-Type: application/json" \
  -d '{"window": "7d"}'
```

---

## 📝 Development Notes

### Adding New Scenarios

Edit `backend/services/telemetry_generator.py` and add to `SCENARIOS` dict.

### Customizing Recommendations

Edit `backend/services/recommendations_engine.py`:
- Adjust `OPTIMAL_RANGES`
- Modify priority scoring logic
- Add domain-specific rules

### Extending Cluster Descriptions

Edit `backend/services/cluster_interpreter.py` and update `CLUSTER_DESCRIPTIONS`.

---

## 📄 License & Credits

**HydroYield v1.0**  
Production AIoT Decision-Support System for Hydroponic Yield Intelligence

Built with:
- FastAPI
- React + TypeScript
- Recharts
- Tailwind CSS
- scikit-learn
- SQLite

---

## 🎯 Next Steps

1. ✅ Test in demo mode
2. ✅ Start backend and connect frontend
3. ✅ Run telemetry simulations
4. ✅ Test manual and auto predictions
5. ⚙️ Train your own models on real data
6. 🚀 Deploy to production environment
7. 📊 Integrate with real IoT sensors

---

**For questions or issues, please consult the API documentation at `/docs` when the backend is running.**
