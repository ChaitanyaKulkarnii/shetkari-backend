# Sangli Soybean Yield & Market Advisory API

A production-ready FastAPI backend designed for the Sangli Soybean Advisory system. The backend delivers agronomic intelligence, harvest date predictions, yield risk estimations, and market holding/selling timing recommendations tailored to soybean farmers across Sangli district talukas.

---

## 📁 Project Architecture

```
Backend-Krishilense/
├── app/
│   ├── __init__.py
│   ├── main.py            # FastAPI entry point, lifespan, middleware & error handling
│   ├── config.py          # Environment configuration (pydantic-settings)
│   ├── schemas.py         # Pydantic v2 schemas and request validation
│   ├── model_loader.py    # Thread-safe model manager & atomic persistence
│   └── routes/
│       ├── __init__.py
│       ├── health.py       # Health check & model versioning
│       ├── options.py      # Dropdown options for UI
│       ├── model_card.py   # Model evaluation card & assumptions
│       ├── market.py       # Mandi price analysis & storage trade-off
│       ├── advisory.py     # Farmer crop advisory prediction
│       └── feedback.py     # Harvest date feedback collection & retraining
├── model/
│   └── soy_advisor.pkl    # Pre-trained SoybeanAdvisor model artifact
├── data/
│   └── harvest_feedback.csv # Real-world harvest observation store
├── tests/
│   ├── __init__.py
│   └── test_api.py        # Comprehensive pytest test suite (12+ tests)
├── sangli_soy_model.py    # Core domain logic & model class
├── Dockerfile             # Containerization with healthchecks
├── requirements.txt       # Project dependencies
├── .env.example           # Environment template
├── .env                   # Active local environment
└── README.md              # Documentation and curl examples
```

---

## 🚀 Quickstart

### 1. Prerequisites
- Python 3.10+ (tested with Python 3.12)
- Virtual environment

### 2. Setup Virtual Environment
```bash
# Create virtual environment
python -m venv .venv

# Activate environment
# On Windows PowerShell:
.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Configuration
Copy `.env.example` to `.env` if not already present:
```bash
cp .env.example .env
```

Available environment variables:
| Variable | Description | Default |
|---|---|---|
| `ADMIN_API_KEY` | Secret key for model retraining (`X-API-Key`) | `sangli-hackathon-admin-key-2026` |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated or `*`) | `*` |
| `MODEL_PATH` | Path to serialized model pickle | `model/soy_advisor.pkl` |
| `FEEDBACK_DATA_PATH` | CSV store for harvest observations | `data/harvest_feedback.csv` |
| `HOST` | Server host binding | `0.0.0.0` |
| `PORT` | Server port | `8000` |
| `LOG_LEVEL` | Logging level (`DEBUG`, `INFO`, `WARNING`) | `INFO` |

### 4. Run the Development Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Interactive API documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 5. Run Test Suite
```bash
pytest -v
```

---

## 📡 API Endpoints & `curl` Examples

### 1. Health Check
Returns system status, active model version, training timestamp, and market data currency.

```bash
curl -X GET "http://localhost:8000/api/health"
```
**Example Response:**
```json
{
  "status": "healthy",
  "model_version": "0.2.0",
  "trained_at": "2026-10-08T09:26:46",
  "market_data_as_of": "2026-09-24"
}
```

---

### 2. Dropdown Options
Fetches valid dropdown lists for UI forms (Talukas, Crops, Soils, Varieties).

```bash
curl -X GET "http://localhost:8000/api/options"
```
**Example Response:**
```json
{
  "talukas": ["Atpadi", "Jath", "Kadegaon", "Kavathe Mahankal", "Khanapur", "Miraj", "Palus", "Shirala", "Tasgaon", "Walwa"],
  "crops": ["Soybean"],
  "soils": [
    "Deep black (heavy)",
    "Medium black",
    "Alluvial / sandy loam",
    "Shallow / murum",
    "Red / laterite"
  ],
  "varieties": {
    "early": "Early (~90 days)",
    "medium": "Medium (~100 days)",
    "late": "Late (~110 days)"
  }
}
```

---

### 3. Model Card
Retrieves model architecture metadata, historical training baselines, and evaluation diagnostics.

```bash
curl -X GET "http://localhost:8000/api/model-card"
```

---

### 4. Market & Storage Report
Computes market trend analysis and a 6-month projected profit/loss timeline factoring monthly storage cost and interest.

```bash
curl -X GET "http://localhost:8000/api/market?storage=15.0&interest=0.01&msp=4892"
```
**Query Parameters:**
- `storage`: Monthly storage cost in ₹/quintal (default: 15.0)
- `interest`: Monthly cost of capital rate (default: 0.01 / 1%)
- `msp`: Optional Minimum Support Price in ₹/quintal
- `today`: Optional date string (`YYYY-MM-DD`)

---

### 5. Farmer Advisory Prediction
Generates a complete advisory including harvest window, expected yield range, revenue projection, holding vs selling recommendation, and Marathi explanation.

```bash
curl -X POST "http://localhost:8000/api/advisory" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Raju Patil",
    "taluka": "Miraj",
    "crop": "Soybean",
    "sowing_date": "2026-06-25",
    "soil": "Deep black (heavy)",
    "variety": "Medium (~100 days)",
    "acres": 5,
    "storage_cost": 15,
    "interest_rate": 0.01
  }'
```

---

### 6. Submit Harvest Feedback
Crowdsources actual harvest dates from farmers to calibrate local phenology curves.

```bash
curl -X POST "http://localhost:8000/api/harvest-feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "sowing_date": "2026-06-20",
    "harvest_date": "2026-09-30",
    "variety": "Medium (~100 days)",
    "taluka": "Miraj"
  }'
```

---

### 7. Retrain Harvest Model (Protected)
Triggers model recalibration using accumulated feedback data. Requires the `X-API-Key` header. Performs atomic file replacement and hot memory reload.

```bash
curl -X POST "http://localhost:8000/api/retrain-harvest" \
  -H "X-API-Key: sangli-hackathon-admin-key-2026"
```
**Example Response:**
```json
{
  "status": "success",
  "calibrated": true,
  "n_obs": 3,
  "message": "Harvest calibration successfully retrained with 3 observations."
}
```

---

## 🐳 Docker Deployment

### Build Image
```bash
docker build -t sangli-soy-backend:latest .
```

### Run Container
```bash
docker run -d \
  -p 8000:8000 \
  -e ADMIN_API_KEY="sangli-hackathon-admin-key-2026" \
  --name sangli-soy-backend \
  sangli-soy-backend:latest
```

---

## 🛡️ Error Handling Contract
All API errors return a standard JSON envelope without exposing internal stack traces:
```json
{
  "error": "Validation Error",
  "detail": "taluka must be one of ['Atpadi', 'Jath', 'Kadegaon', ...]"
}
```
