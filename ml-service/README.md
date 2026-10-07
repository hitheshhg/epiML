# epiML Standalone ML Service & Training Management Platform

Production-ready time-series microclimate forecasting, AQI estimation, model registry, and dataset management service for the **epiML (Chiguru)** precision agriculture platform.

---

## 1. Architecture Overview

The ML service is designed as an independent, containerized time-series forecasting microservice decoupled from the Next.js frontend:

```
[ IoT / Arduino Chambers ]
             ↓
[ Supabase Telemetry (All Accounts) ] + [ Kaggle Reference Datasets ]
             ↓                                     ↓
             └─── [ Canonical Dataset Normalizer ] ───┘
                                   ↓
                   [ Time-Series Feature Engineering ]
                    (Lags, Rolling Stats, VPD, Cyclic)
                                   ↓
                   [ Anti-Leakage Chronological Split ]
                      (Train 70% | Val 15% | Test 15%)
                                   ↓
                   [ Multi-Target Model Candidates ]
                     (XGBoost, RandomForest, Ridge)
                                   ↓
                   [ Validation Benchmark & Selection ]
                                   ↓
                   [ Artifact Registry & Smoke Test ]
                                   ↓
           [ Production Activation with 1-Click Rollback ]
                                   ↓
             [ High-Frequency Real-Time Predictions ]
```

### Supported Prediction Targets
1. **Air Quality Index (AQI)**:
   - Official US EPA (40 CFR Part 58) and CPCB NAQI calculation when particulate/pollutant channels (PM2.5, PM10, CO, NO2, SO2, O3, NH3) are measured.
   - Temperature/humidity-compensated calibrated proxy calculation when MQ-135 sensor gas ppm is measured.
   - Strictly flags estimates vs direct calculations. Never fabricates pollutant values.
2. **Temperature (°C)**: Thermal accumulation & diurnal cycle forecast.
3. **Relative Humidity (% RH)**: Chamber transpiration and boundary layer trajectory.
4. **Volumetric Soil Moisture (%)**: Root zone moisture depletion & irrigation pulse dissipation.

### Configurable Prediction Horizons
- **15 minutes** (Near-term closed-loop trigger)
- **30 minutes** (Default standard operational horizon)
- **60 minutes** (1-hour biological microclimate trend)
- **6 hours** (Diurnal shift forecast)
- **24 hours** (Next-day biological epoch projection)

---

## 2. Environment Variables

Create `.env` inside `ml-service/` or pass to Docker container:

| Variable | Description | Default |
|---|---|---|
| `PORT` | HTTP Server Port | `8000` |
| `HOST` | Bind address | `0.0.0.0` |
| `SUPABASE_URL` | Supabase Project URL | Configured project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side trusted service role key | (Secure server-only secret) |
| `DEFAULT_HORIZON_MINUTES` | Default prediction horizon | `30` |
| `AQI_STANDARD` | Breakpoint standard (`US_EPA` or `CPCB_NAQI`) | `US_EPA` |
| `KAGGLE_USERNAME` | Kaggle username for private datasets (optional) | `""` |
| `KAGGLE_KEY` | Kaggle API key for private datasets (optional) | `""` |

---

## 3. Local Development & Testing

### Prerequisites
- Python 3.10+ (tested on Python 3.11 & 3.14)
- `pip install -r requirements.txt`

### Running the Service Locally
```bash
cd ml-service
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The service will start at `http://localhost:8000` with interactive Swagger UI documentation at `http://localhost:8000/docs`.

### Running Automated Test Suite
```bash
PYTHONPATH=. pytest tests -v
```

---

## 4. Docker Deployment Instructions

### Build Container Image
```bash
docker build -t epiml-ml-service:latest .
```

### Run Container
```bash
docker run -d \
  --name epiml-ml-service \
  -p 8000:8000 \
  -e PORT=8000 \
  -e SUPABASE_URL="https://qbeqacmwaoufiwhafvyj.supabase.co" \
  -e SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
  --restart unless-stopped \
  epiml-ml-service:latest
```

---

## 5. API Reference

### Health & Information
- `GET /health`: Microservice liveness and active model version.
- `GET /model-info`: Active model metadata, targets, and training metrics.

### Inference
- `POST /predict`:
  ```json
  {
    "temperature_c": 24.8,
    "humidity_pct": 76.5,
    "soil_moisture_pct": 71.0,
    "gas_ppm": 38.0,
    "horizon_minutes": 30
  }
  ```
  **Response:**
  ```json
  {
    "timestamp": "2026-10-07T05:40:00Z",
    "horizon_minutes": 30,
    "predictions": {
      "aqi": 51.2,
      "temperature_c": 25.1,
      "humidity_pct": 75.8,
      "soil_moisture_pct": 70.8
    },
    "confidence": {
      "aqi": 0.91,
      "temperature_c": 0.96,
      "humidity_pct": 0.94,
      "soil_moisture_pct": 0.93
    },
    "prediction_intervals": {
      "temperature_c": { "estimate": 25.1, "lower_bound": 24.7, "upper_bound": 25.5 }
    },
    "model_version": "v1.0"
  }
  ```

### Admin Model Management
- `POST /admin/train`: Starts asynchronous training job.
- `GET /admin/training-jobs/{job_id}`: Polls live job progress, stages, and logs.
- `GET /admin/models`: Retrieves model leaderboard and candidate comparison.
- `POST /admin/models/{version_tag}/activate`: Runs smoke test and activates candidate model.
- `POST /admin/models/rollback`: One-click zero-downtime rollback to previous model.
- `GET /admin/drift-status`: Computes Population Stability Index (PSI) and data quality drift.
