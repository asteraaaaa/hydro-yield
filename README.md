# 🌱 HydroYield

**Production-Grade AIoT Decision-Support System for Early-Stage Hydroponic Yield Intelligence**

![System Architecture](https://img.shields.io/badge/Stack-FastAPI%20%2B%20React%20%2B%20TypeScript-blue)
![ML Models](https://img.shields.io/badge/ML-Random%20Forest%20%2B%20KMeans-green)
![License](https://img.shields.io/badge/License-Reference%20Implementation-orange)

---

## 📌 Overview

HydroYield is a comprehensive AIoT decision-support system designed to predict final crop yield using **early-stage environmental data (≥7 days)** from hydroponic farming systems. The system combines machine learning, real-time telemetry, and agronomic expertise to provide:

✅ **Yield Predictions**: Estimate final harvest weight (grams)  
✅ **Category Classification**: Low / Medium / High yield classification  
✅ **Growth Pattern Clustering**: Identify growth clusters for comparison  
✅ **Explainability**: Feature importance and transparent predictions  
✅ **Safe Recommendations**: Actionable guidance without dosing quantities  
✅ **Stability Assessment**: Environmental variability monitoring  

---

## 🎯 Key Features

### For Growers
- **Early Yield Forecasting**: Know expected yield ≥7 days before harvest
- **Environmental Optimization**: Data-driven recommendations for pH, EC, temperature, light
- **Risk Detection**: Stability alerts for unstable conditions
- **Growth Benchmarking**: Compare against typical growth patterns

### For Researchers
- **Scenario Simulation**: Test 6 different environmental scenarios
- **Model Serving**: Production-ready ML pipeline
- **Data Export**: Analysis history and telemetry export
- **Offline Operation**: No cloud dependencies

### For Engineers
- **Clean Architecture**: Separated backend (FastAPI) and frontend (React + TS)
- **RESTful API**: Complete API documentation with Swagger/ReDoc
- **Mock Mode**: Demo without backend setup
- **Extensible**: Easy to add scenarios, features, or models

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (React + TS)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │Dashboard │  │  Manual  │  │   Auto   │  │History │ │
│  │  Page    │  │ Predict  │  │ Predict  │  │  Page  │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
│         │              │             │            │     │
│         └──────────────┴─────────────┴────────────┘     │
│                        │                                │
│              ┌─────────▼─────────┐                      │
│              │   API Client      │                      │
│              │  (Mock / Real)    │                      │
│              └─────────┬─────────┘                      │
└─────────────────────────│──────────────────────────────┘
                          │ HTTP/JSON
┌─────────────────────────▼──────────────────────────────┐
│                 BACKEND (FastAPI)                      │
│  ┌────────────────────────────────────────────────┐   │
│  │              API Endpoints                      │   │
│  │  /predict/manual  /predict/auto  /telemetry/*  │   │
│  └──────────┬────────────────┬─────────────┬──────┘   │
│             │                │             │           │
│  ┌──────────▼─────┐  ┌──────▼──────┐  ┌──▼────────┐  │
│  │ Model Loader   │  │  Telemetry  │  │ Database  │  │
│  │ • Regressor    │  │  Generator  │  │ (SQLite)  │  │
│  │ • Classifier   │  │ • Scenarios │  │           │  │
│  │ • Clusterer    │  │ • IoT Sim   │  │           │  │
│  └────────┬───────┘  └──────┬──────┘  └───────────┘  │
│           │                  │                         │
│  ┌────────▼──────────────────▼─────────────────────┐  │
│  │          Services Layer                         │  │
│  │  • Feature Aggregator                           │  │
│  │  • Stability Scorer                             │  │
│  │  • Cluster Interpreter                          │  │
│  │  • Recommendations Engine                       │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### **Option 1: Demo Mode (Frontend Only)**

```bash
# Clone and navigate
cd hydroyield

# Install dependencies
npm install

# Start dev server
npm run dev

# Open browser to http://localhost:5173
```

✅ Demo mode runs immediately with mock data!

### **Option 2: Full Stack (Recommended)**

#### Terminal 1: Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

#### Terminal 2: Frontend
```bash
npm install
npm run dev
```

Visit: http://localhost:5173  
API Docs: http://localhost:8000/docs

📖 **Detailed instructions:** See [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)

---

## 📊 System Workflow

### 1. **Dashboard: Live Monitoring**
- Start telemetry simulation (6 scenarios available)
- Monitor live sensor readings (air temp, water temp, pH, EC, TDS, light, humidity)
- View time-series charts with configurable windows (24h / 3d / 7d / 14d)
- Check environmental stability

### 2. **Manual Prediction**
- Enter early-stage environmental values manually
- Get yield estimate + category + growth cluster
- View feature importance
- Receive ranked recommendations

### 3. **Auto Prediction**
- System computes features from telemetry window
- Automatic stability assessment
- Same predictions + transparency into computed features

### 4. **History**
- Browse saved analyses
- Compare predictions over time
- Export results

---

## 🧪 ML Models

The system uses three pre-trained models:

| Model | Type | Purpose | Output |
|-------|------|---------|--------|
| **Regressor** | Random Forest | Yield estimation | Grams (continuous) |
| **Classifier** | Random Forest | Yield category | Low / Medium / High |
| **Clusterer** | KMeans | Growth pattern | Cluster 0-3 |

### Model Input Features (Day 7 Means)

1. **d7_air_temp_mean** - Air temperature (°C)
2. **d7_lux_mean** - Light intensity (lux)
3. **d7_ph_mean** - pH level
4. **d7_water_temp_mean** - Water temperature (°C)
5. **d7_rh_mean** - Relative humidity (%)
6. **d7_ec_mean** - Electrical conductivity (mS/cm)
7. **d7_tds_mean** - Total dissolved solids (ppm)

**Note:** Identifier columns (experiment, treatment, replicate, plant_no) are **NEVER** used as model inputs.

---

## 📡 Telemetry Scenarios

| Scenario | Description |
|----------|-------------|
| **Stable Farm** | Optimal, balanced conditions |
| **pH Drift** | Gradual pH decline over time |
| **Heat Stress** | Elevated air/water temperatures |
| **Nutrient Dilution** | EC gradually decreasing |
| **Light Spike** | Periodic light intensity spikes |
| **Random Noise** | High variability across sensors |

---

## 🔍 Explainability

### Feature Importance
Global importance from Random Forest regressor showing which environmental factors most influence yield.

### Cluster Interpretation
Each cluster has human-readable descriptions:
- **Cluster 0**: Optimal Balanced
- **Cluster 1**: Warm Moderate
- **Cluster 2**: Cool High-Light
- **Cluster 3**: Nutrient-Rich Balanced

### Stability Score
Heuristic assessment (0-100) based on sensor variability:
- **Stable (75-100)**: Reliable predictions
- **Moderate (50-74)**: Moderate confidence
- **Unstable (<50)**: High variability, stabilize first

---

## ⚙️ Recommendations Engine

Generates **safe, actionable recommendations** with these constraints:

✅ **No dosing quantities** - Only "consider increasing/decreasing gradually"  
✅ **Controllable parameters** - Focus on pH, EC, temperature, light  
✅ **Ranked by priority** - Based on importance × deviation × stability  
✅ **Safety cautions** - Every recommendation includes safety notes  

Example recommendation:
```
Priority: High
Action: Consider gradually decreasing pH
Reason: pH is above optimal range (6.8 > 6.5). Feature importance: 15.00%.
Caution: Adjust pH gradually over 24-48 hours. Use pH down products carefully. Monitor frequently.
```

---

## 🛡️ Safety & Disclaimers

**⚠️ THIS IS A DECISION-SUPPORT TOOL ONLY**

- ❌ **Not for automated control** - Does not operate actuators or dosing systems
- ❌ **Not prescriptive** - Provides guidance, not instructions
- ❌ **Requires expertise** - Consult agronomic professionals before changes
- ✅ **Gradual adjustments** - All recommendations emphasize slow, monitored changes
- ✅ **Offline operation** - No cloud dependencies or data leakage

**Not designed for:**
- Collecting personally identifiable information (PII)
- Production deployment without additional security/validation
- Direct actuator control

---

## 📂 Project Structure

```
hydroyield/
├── backend/                     # FastAPI Backend
│   ├── main.py                  # API server entry point
│   ├── models/
│   │   ├── model_loader.py      # ML model serving
│   │   ├── *.pkl                # Pre-trained models (user-provided)
│   ├── services/
│   │   ├── telemetry_generator.py
│   │   ├── feature_aggregator.py
│   │   ├── stability_scorer.py
│   │   ├── cluster_interpreter.py
│   │   └── recommendations_engine.py
│   ├── database/
│   │   └── db_manager.py        # SQLite manager
│   ├── schemas/
│   │   ├── requests.py          # Pydantic request models
│   │   └── responses.py         # Pydantic response models
│   └── requirements.txt
│
├── src/                         # React + TypeScript Frontend
│   ├── app/
│   │   ├── App.tsx              # Main app component
│   │   └── pages/
│   │       ├── DashboardPage.tsx
│   │       ├── ManualPredictPage.tsx
│   │       ├── AutoPredictPage.tsx
│   │       └── HistoryPage.tsx
│   ├── components/              # Reusable UI components
│   │   ├── KpiCard.tsx
│   │   ├── TimeSeriesChart.tsx
│   │   ├── PredictionCards.tsx
│   │   ├── RecommendationList.tsx
│   │   └── ...
│   ├── services/
│   │   ├── api.ts               # API client
│   │   └── mockApi.ts           # Mock API for demo mode
│   └── types/
│       └── index.ts             # TypeScript type definitions
│
├── SETUP_INSTRUCTIONS.md        # Detailed setup guide
├── API_CONTRACT.md              # Complete API documentation
└── README.md                    # This file
```

---

## 🔧 Technologies

**Backend:**
- FastAPI (Python 3.8+)
- scikit-learn (ML models)
- Pydantic (validation)
- SQLite (database)
- NumPy, Pandas

**Frontend:**
- React 18
- TypeScript
- Vite (build tool)
- Recharts (data visualization)
- Tailwind CSS (styling)
- Lucide React (icons)

---

## 📖 Documentation

- **[SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)** - Complete setup and run guide
- **[API_CONTRACT.md](./API_CONTRACT.md)** - Full API specification with examples
- **Interactive API Docs** - http://localhost:8000/docs (when backend is running)

---

## 🧩 Extending the System

### Add a New Scenario
Edit `backend/services/telemetry_generator.py` and add to `SCENARIOS` dict.

### Customize Optimal Ranges
Edit `backend/services/recommendations_engine.py` → `OPTIMAL_RANGES`.

### Add New Features
1. Update model training to include new feature
2. Add feature to `expected_features` in model loader
3. Update frontend input forms

### Integrate Real IoT Sensors
Replace `telemetry_generator.py` with real sensor data ingestion (MQTT, HTTP, etc.).

---

## 🎓 Use Cases

1. **Commercial Hydroponics**: Early yield forecasting for planning and sales
2. **Research**: Experiment analysis and environmental optimization
3. **Education**: Teaching ML applications in agriculture
4. **IoT Demonstrations**: Showcase AIoT decision-support systems

---

## 🤝 Contributing

This is a reference implementation. To adapt for your use case:

1. Train models on your own dataset
2. Adjust optimal ranges for your crops
3. Customize cluster descriptions
4. Add crop-specific scenarios
5. Implement authentication for production

---

## 📄 License

This is a **reference implementation** for educational and demonstration purposes.

**For production use:**
- Add authentication and authorization
- Implement rate limiting
- Add comprehensive input validation
- Conduct security audit
- Add logging and monitoring
- Implement backup and recovery

---

## 🙋 FAQ

**Q: Can I use this in production?**  
A: This is a reference implementation. Additional security, testing, and validation required for production.

**Q: What if I don't have pre-trained models?**  
A: The system includes mock models for demonstration. Train your own models on real data for actual predictions.

**Q: Can it control my hydroponic system automatically?**  
A: **No.** This is a decision-support tool only. It provides recommendations, not automated control.

**Q: Does it work offline?**  
A: Yes! Fully offline with SQLite database and local model serving.

**Q: What crops is it designed for?**  
A: The system is crop-agnostic. Optimal ranges and models should be trained for your specific crop.

---

## 📞 Support

- **API Documentation**: http://localhost:8000/docs
- **Setup Guide**: [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)
- **API Contract**: [API_CONTRACT.md](./API_CONTRACT.md)

---

## ✨ Acknowledgments

Built with open-source technologies:
- FastAPI by Sebastián Ramírez
- React by Meta
- scikit-learn by scikit-learn developers
- Recharts by recharts team

---

**HydroYield v1.0** - Early-Stage Hydroponic Yield Intelligence  
*Helping growers make data-driven decisions with confidence*

🌱 **Grow Smarter, Not Harder** 🌱
