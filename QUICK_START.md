# 🚀 HydroYield - Quick Start Guide

**Get up and running in 2 minutes!**

---

## Option 1: Demo Mode (Fastest - No Backend Needed)

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open browser
# Visit: http://localhost:5173
```

✅ **Done!** The app runs with mock data instantly.

**Toggle Demo Mode:** Use the checkbox in the top-right corner to switch between demo and real backend.

---

## Option 2: Full Stack (Backend + Frontend)

### Terminal 1: Start Backend

```bash
# Quick start with script
chmod +x run-backend.sh
./run-backend.sh
```

**Or manually:**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend ready at: http://localhost:8000  
API docs at: http://localhost:8000/docs

### Terminal 2: Start Frontend

```bash
# Quick start with script
chmod +x run-frontend.sh
./run-frontend.sh
```

**Or manually:**

```bash
npm install
npm run dev
```

Frontend ready at: http://localhost:5173

---

## 🧪 Test the System (5-Minute Tour)

### 1. Dashboard - Live Telemetry (1 min)

1. Go to **Dashboard** page
2. Select scenario: **"Stable Farm"**
3. Click **Start**
4. Watch KPI cards and charts update

### 2. Manual Prediction (2 min)

1. Go to **Manual Predict** page
2. Leave default values (already optimal)
3. Click **Predict Yield**
4. Review:
   - Yield estimate
   - Category (Low/Medium/High)
   - Growth cluster
   - Feature importance chart
   - Recommendations

### 3. Auto Prediction (2 min)

1. Go to **Auto Predict** page
2. Select window: **7d**
3. Click **Run Auto Prediction**
4. Review computed features + predictions
5. Check stability score

---

## 📚 Next Steps

- **Read Full Documentation**: [README.md](./README.md)
- **Setup Guide**: [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)
- **API Documentation**: [API_CONTRACT.md](./API_CONTRACT.md)
- **System Design**: [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md)

---

## 🔧 Troubleshooting

**"Connection Error" when demo mode is off:**
- Make sure backend is running on port 8000
- Check console for CORS errors
- Toggle demo mode back on to use mock data

**Backend won't start:**
- Check Python version: `python3 --version` (need 3.8+)
- Try manual installation: `pip install -r backend/requirements.txt`

**Charts not showing:**
- Wait for telemetry simulation to generate data
- Check that simulation is running (green indicator)

---

## 💡 Pro Tips

1. **Start in Demo Mode** first to explore the UI
2. **Use the API docs** at `/docs` to test endpoints
3. **Try different scenarios** to see how telemetry varies
4. **Compare manual vs auto** predictions with same values
5. **Check stability score** before trusting predictions

---

**Need help?** See [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) for detailed troubleshooting.

🌱 **Happy Growing!** 🌱
