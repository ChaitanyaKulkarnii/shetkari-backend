# KrishiLens Backend & ML Model Integration Guide

> **Target:** `Backend-Krishilense` (Python FastAPI / Flask Backend)  
> **Frontend:** `krishilense` (React + Vite, runs on `http://localhost:5173`)  
> **Purpose:** Technical specification, API contracts, ML model integration, and live data sources for connecting the Python backend with the KrishiLens dashboard.

---

## 1. System Architecture

```
   ┌──────────────────────────────────────────────┐
   │            React Frontend (Vite)             │
   │            http://localhost:5173             │
   └──────────────────────┬───────────────────────┘
                          │ HTTP REST / JSON
                          ▼
   ┌──────────────────────────────────────────────┐
   │         Python Backend (FastAPI / Flask)     │
   │            http://localhost:8000             │
   ├──────────────────────┬───────────────────────┤
   │                      │                       │
   ▼                      ▼                       ▼
┌──────────────┐   ┌──────────────┐   ┌───────────────────────────┐
│ Python ML    │   │ Real Weather │   │ Real APMC Mandi / Sat     │
│ Model (.pkl) │   │ (Open-Meteo) │   │ (Agmarknet / Sentinel-2)  │
└──────────────┘   └──────────────┘   └───────────────────────────┘
```

---

## 2. CORS Setup (Crucial)

The frontend runs on port `5173` while the Python backend will run on port `8000` (or `5000`). To prevent browser CORS errors, configure CORS in your backend:

### FastAPI Example:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="KrishiLens Backend API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 3. Required API Endpoints

### 3.1 Authentication
* **Endpoint:** `POST /api/auth/login`
* **Request Body:**
```json
{
  "phone": "9876543210",
  "otp": "1234"
}
```
* **Response Body (`200 OK`):**
```json
{
  "token": "jwt_token_sample",
  "user": {
    "name": "Ramesh Patil",
    "phone": "9876543210",
    "language": "en"
  }
}
```

---

### 3.2 Crop Analysis & Prediction (Main ML Endpoint)
Triggered when the farmer finishes the **Crop Intake** form.

* **Endpoint:** `POST /api/crop/analyze`
* **Request Body (from React Frontend):**
```json
{
  "location": "Sangli, Maharashtra",
  "crop": "Soybean",
  "area": "2 hectares",
  "sowingDate": "June 2026",
  "season": "Kharif 2026",
  "coordinates": {
    "lat": 16.8524,
    "lon": 74.5815
  }
}
```

* **Response Body (Exact JSON Schema Required by the UI):**
```json
{
  "farm": {
    "location": "Sangli, Maharashtra",
    "crop": "Soybean",
    "area": "2 hectares",
    "sowing": "June 2026",
    "season": "Kharif 2026"
  },
  "yieldInfo": {
    "range": "2.3–2.7",
    "unit": "t/ha",
    "confidence": "Moderate",
    "regional": "2.1 t/ha",
    "harvest": "Early – Mid October"
  },
  "ndvi": [
    { "month": "Jun 12", "value": 0.24 },
    { "month": "Jun 28", "value": 0.31 },
    { "month": "Jul 14", "value": 0.46 },
    { "month": "Jul 30", "value": 0.59 },
    { "month": "Aug 15", "value": 0.68 },
    { "month": "Aug 31", "value": 0.72 },
    { "month": "Sep 16", "value": 0.67 },
    { "month": "Oct 02", "value": 0.61 }
  ],
  "weather": [
    { "week": "Aug 1", "rainfall": 24, "temp": 29 },
    { "week": "Aug 8", "rainfall": 38, "temp": 28 },
    { "week": "Aug 15", "rainfall": 19, "temp": 30 },
    { "week": "Aug 22", "rainfall": 31, "temp": 29 },
    { "week": "Aug 29", "rainfall": 14, "temp": 31 },
    { "week": "Sep 5", "rainfall": 22, "temp": 29 },
    { "week": "Sep 12", "rainfall": 18, "temp": 30 },
    { "week": "Sep 19", "rainfall": 12, "temp": 31 }
  ],
  "markets": [
    {
      "name": "Sangli APMC",
      "distance": "12 km",
      "price": 4760,
      "change": "+2.4%",
      "arrivals": "184 t",
      "quality": "Good",
      "trend": "up"
    },
    {
      "name": "Tasgaon APMC",
      "distance": "28 km",
      "price": 4725,
      "change": "+1.1%",
      "arrivals": "126 t",
      "quality": "Good",
      "trend": "up"
    },
    {
      "name": "Miraj APMC",
      "distance": "34 km",
      "price": 4680,
      "change": "−0.3%",
      "arrivals": "208 t",
      "quality": "Moderate",
      "trend": "flat"
    },
    {
      "name": "Kolhapur APMC",
      "distance": "51 km",
      "price": 4810,
      "change": "+0.8%",
      "arrivals": "96 t",
      "quality": "Partial",
      "trend": "up"
    }
  ],
  "prices7": [
    { "day": "Sep 26", "price": 4620 },
    { "day": "Sep 27", "price": 4650 },
    { "day": "Sep 28", "price": 4610 },
    { "day": "Sep 29", "price": 4690 },
    { "day": "Sep 30", "price": 4720 },
    { "day": "Oct 1", "price": 4680 },
    { "day": "Oct 2", "price": 4760 }
  ],
  "prices30": [
    { "day": "4 Sep", "price": 4380 },
    { "day": "8 Sep", "price": 4390 },
    { "day": "12 Sep", "price": 4470 },
    { "day": "16 Sep", "price": 4520 },
    { "day": "20 Sep", "price": 4550 },
    { "day": "24 Sep", "price": 4610 },
    { "day": "28 Sep", "price": 4650 },
    { "day": "2 Oct", "price": 4760 }
  ],
  "sellingSignal": {
    "signal": "Prepare to sell",
    "updated": "02 Oct 2026",
    "confidence": "Moderate",
    "reason": "Harvest window is approaching and local market prices remain comparatively favorable."
  },
  "factors": [
    "Harvest window is approaching",
    "Recent prices are comparatively favorable",
    "Market direction is being monitored",
    "Available data quality supports a moderate-confidence outlook"
  ]
}
```

---

## 4. Connecting the Python ML Model

Load your model in your Python backend script:

```python
import joblib
import numpy as np

# Load once on startup
try:
    yield_model = joblib.load("models/yield_model.pkl")
    print("✓ ML Model loaded successfully")
except Exception as e:
    print("Warning: Could not load ML model, using fallback:", e)
    yield_model = None

def predict_yield(crop, area_ha, avg_rainfall, avg_temp, peak_ndvi):
    if yield_model:
        # Construct feature array according to model training specs
        features = np.array([[area_ha, avg_rainfall, avg_temp, peak_ndvi]])
        prediction = float(yield_model.predict(features)[0])
    else:
        # Fallback heuristic calculation if model file is not present
        base_yields = {"Soybean": 2.5, "Wheat": 3.8, "Cotton": 1.9, "Rice": 3.2}
        prediction = base_yields.get(crop, 2.5)

    low_bound = round(prediction * 0.9, 1)
    high_bound = round(prediction * 1.1, 1)
    
    return {
        "range": f"{low_bound}–{high_bound}",
        "unit": "t/ha",
        "confidence": "Moderate" if peak_ndvi > 0.5 else "Low",
        "regional": "2.1 t/ha",
        "harvest": "Early – Mid October"
    }
```

---

## 5. Fetching Real Data (APIs)

### 5.1 Real Weather (Open-Meteo - Free, No API Key Required)
```python
import requests

def get_real_weather(lat: float, lon: float):
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=temperature_2m_max,precipitation_sum&timezone=auto"
    res = requests.get(url).json()
    daily = res.get("daily", {})
    
    # Process last 7-14 days into weekly summaries
    return {
        "recent_rain": sum(daily.get("precipitation_sum", [18])[-7:]),
        "avg_temp": round(sum(daily.get("temperature_2m_max", [29])[-7:]) / 7, 1)
    }
```

### 5.2 Real Mandi APMC Prices
Use the official Government of India Agmarknet API via `data.gov.in`:
* **Dataset:** Daily Mandi Market Prices (Agmarknet)
* **API URL:** `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070`
* **Filter params:** `filters[state]=Maharashtra`, `filters[commodity]=Soyabean`, `filters[market]=Sangli`

### 5.3 Satellite NDVI
* **Source:** Copernicus Sentinel-2 / Google Earth Engine (GEE)
* Compute NDVI using Band 8 (NIR) and Band 4 (Red):
  $$\text{NDVI} = \frac{\text{NIR} - \text{Red}}{\text{NIR} + \text{Red}}$$

---

## 6. Ready-to-Run Backend Boilerplate (`main.py`)

You can place this file in `C:\Users\mansi\Documents\Backend-Krishilense\main.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="KrishiLens Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CropAnalysisRequest(BaseModel):
    location: str
    crop: str
    area: str
    sowingDate: str
    season: Optional[str] = "Kharif 2026"

@app.get("/")
def read_root():
    return {"message": "KrishiLens Python Backend is running!"}

@app.post("/api/crop/analyze")
def analyze_crop(req: CropAnalysisRequest):
    # 1. User inputs
    crop = req.crop
    location = req.location

    # 2. Real / ML calculation
    predicted_range = "2.4–2.8" if crop == "Soybean" else "2.1–2.6"
    
    # 3. Formulate the UI contract response
    return {
        "farm": {
            "location": location,
            "crop": crop,
            "area": req.area,
            "sowing": req.sowingDate,
            "season": req.season
        },
        "yieldInfo": {
            "range": predicted_range,
            "unit": "t/ha",
            "confidence": "Moderate",
            "regional": "2.1 t/ha",
            "harvest": "Early – Mid October"
        },
        "ndvi": [
            { "month": "Jun 12", "value": 0.24 },
            { "month": "Jun 28", "value": 0.31 },
            { "month": "Jul 14", "value": 0.46 },
            { "month": "Jul 30", "value": 0.59 },
            { "month": "Aug 15", "value": 0.68 },
            { "month": "Aug 31", "value": 0.72 },
            { "month": "Sep 16", "value": 0.67 },
            { "month": "Oct 02", "value": 0.61 }
        ],
        "weather": [
            { "week": "Aug 1", "rainfall": 24, "temp": 29 },
            { "week": "Aug 8", "rainfall": 38, "temp": 28 },
            { "week": "Aug 15", "rainfall": 19, "temp": 30 },
            { "week": "Aug 22", "rainfall": 31, "temp": 29 },
            { "week": "Aug 29", "rainfall": 14, "temp": 31 },
            { "week": "Sep 5", "rainfall": 22, "temp": 29 },
            { "week": "Sep 12", "rainfall": 18, "temp": 30 },
            { "week": "Sep 19", "rainfall": 12, "temp": 31 }
        ],
        "markets": [
            { "name": f"{location.split(',')[0]} APMC", "distance": "12 km", "price": 4760, "change": "+2.4%", "arrivals": "184 t", "quality": "Good", "trend": "up" },
            { "name": "Tasgaon APMC", "distance": "28 km", "price": 4725, "change": "+1.1%", "arrivals": "126 t", "quality": "Good", "trend": "up" },
            { "name": "Miraj APMC", "distance": "34 km", "price": 4680, "change": "−0.3%", "arrivals": "208 t", "quality": "Moderate", "trend": "flat" }
        ],
        "prices7": [
            { "day": "Sep 26", "price": 4620 },
            { "day": "Sep 27", "price": 4650 },
            { "day": "Sep 28", "price": 4610 },
            { "day": "Sep 29", "price": 4690 },
            { "day": "Sep 30", "price": 4720 },
            { "day": "Oct 1", "price": 4680 },
            { "day": "Oct 2", "price": 4760 }
        ],
        "prices30": [
            { "day": "4 Sep", "price": 4380 },
            { "day": "8 Sep", "price": 4390 },
            { "day": "12 Sep", "price": 4470 },
            { "day": "16 Sep", "price": 4520 },
            { "day": "20 Sep", "price": 4550 },
            { "day": "24 Sep", "price": 4610 },
            { "day": "28 Sep", "price": 4650 },
            { "day": "2 Oct", "price": 4760 }
        ],
        "sellingSignal": {
            "signal": "Prepare to sell",
            "updated": "02 Oct 2026",
            "confidence": "Moderate",
            "reason": "Harvest window is approaching and local market prices remain comparatively favorable."
        },
        "factors": [
            "Harvest window is approaching",
            "Recent prices are comparatively favorable",
            "Market direction is being monitored",
            "Available data quality supports a moderate-confidence outlook"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

---

## 7. How to Run the Backend
1. Install dependencies in your Python backend environment:
   ```bash
   pip install fastapi uvicorn pydantic requests joblib scikit-learn numpy
   ```
2. Start the server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
3. Test the interactive Swagger documentation in your browser:
   `http://localhost:8000/docs`
