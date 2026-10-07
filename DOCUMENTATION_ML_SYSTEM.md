# epiML: Production-Ready Agricultural ML Training & Model Management Center

Comprehensive architecture, operational manual, database specification, and deployment guide for the **epiML** agricultural IoT environmental forecasting platform.

---

## 1. System Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │               IoT Chamber & Edge Hardware              │
                    │   • Arduino Uno / ATmega328P (115200 baud)             │
                    │   • DHT22 (Temp & Humidity)                            │
                    │   • Capacitive Soil Moisture Sensors (Analogs A0, A1)  │
                    │   • MQ-135 Air Quality Gas Sensor (A2)                 │
                    │   • Actuators: Submersible Pump (D13), Roof Vent (D5)  │
                    └───────────────────────────┬────────────────────────────┘
                                                │ Serial Telemetry / Web Serial API
                                                ▼
                    ┌────────────────────────────────────────────────────────┐
                    │               Next.js 14 Frontend Application          │
                    │   • Chamber Cockpit & Real-Time Monitoring             │
                    │   • User Profile & Historical Experiment Trials        │
                    │   • Mud Nursery Tray 2D CV Sowing Canvas               │
                    │   • Real-Time Multi-Horizon Environmental Predictor    │
                    │   • Admin ML Training & Model Management Center UI     │
                    └─────────────┬───────────────────────────┬──────────────┘
                                  │                           │
          User Ingestion & RLS    │                           │ Admin Aggregation
                                  ▼                           ▼
┌───────────────────────────────────────────────┐   ┌──────────────────────────────────────────────┐
│           Supabase PostgreSQL & Storage       │   │        Secure Server APIs & Next.js          │
│ • profiles (Role, Consent Flag)               │   │ • Elevated Server Client (Service-Role Key)  │
│ • experiments (Metadata & Phenotypes)         │   │ • /api/admin/ml/* (Admin-Guarded Routes)     │
│ • ml_datasets & ml_dataset_versions           │   │ • /api/ml/predict (Resilient Proxy)          │
│ • ml_models & ml_model_versions (Registry)    │   └──────────────────────┬───────────────────────┘
│ • ml_training_jobs & ml_drift_metrics         │                          │
└───────────────────────────────────────────────┘                          │ Internal REST (Port 8000)
                                                                           ▼
                    ┌────────────────────────────────────────────────────────┐
                    │       Standalone Containerized Python ML Service       │
                    │   • FastAPI Engine (/health, /predict, /admin/*)       │
                    │   • Official US EPA & CPCB Breakpoint AQI Calculator   │
                    │   • Kaggle Dynamic Ingestion (kagglehub)               │
                    │   • Strict Chronological Time-Series Feature Store     │
                    │   • Champion Model Selector (XGBoost, Extra Trees, RF) │
                    │   • PyTorch GRU/LSTM Deep Learning Pipeline            │
                    │   • Population Stability Index (PSI) Drift Monitor     │
                    │   • Joblib Artifact Serializer & One-Click Rollback    │
                    └────────────────────────────────────────────────────────┘
```

---

## 2. Core Machine Learning Objectives & Targets

The platform is designed as an **environmental time-series trajectory forecasting engine** for microclimate chambers, predicting four critical physical parameters:

1. **Air Quality Index (AQI)**: Dimensionless index (0–500) indicating chamber atmospheric purity.
2. **Chamber Temperature**: Degrees Celsius (°C).
3. **Relative Humidity (RH)**: Percentage (0–100% RH).
4. **Volumetric Soil Moisture**: Percentage (0–100% WAP).

### Multi-Horizon Forecasting
The models are trained with dynamic forward-looking projection horizons:
- **+15 Minutes**: Fast microclimate drift detection (fan and vent response).
- **+30 Minutes (Production Default)**: Actuation stabilization window.
- **+60 Minutes**: Transpiration and diurnal shift forecasting.
- **+6 Hours**: Photoperiod and thermal cycle prediction.
- **+24 Hours**: Daily circadian cycle trajectory.

---

## 3. Scientific AQI Calculation & Standards Isolation

The system strictly follows international environmental standards:

### Standard Sub-Index Interpolation
Located at [`ml-service/app/aqi/calculator.py`](file:///c:/Users/gurud/OneDrive/Desktop/terrabyte/ml-service/app/aqi/calculator.py):
The linear breakpoint interpolation formula is implemented for both **US-EPA AQI** and **Indian CPCB NAQI**:

$$I_p = \frac{I_{high} - I_{low}}{C_{high} - C_{low}} \times (C_p - C_{low}) + I_{low}$$

Where:
- $C_p$: Measured pollutant concentration
- $C_{low}, C_{high}$: Breakpoint concentration interval for the pollutant
- $I_{low}, I_{high}$: Corresponding AQI sub-index interval
- Overall AQI: $\max(I_{p_1}, I_{p_2}, \dots, I_{p_n})$

Supported pollutant sub-indices:
- $\text{PM}_{2.5}$ ($\mu g/m^3$)
- $\text{PM}_{10}$ ($\mu g/m^3$)
- $\text{CO}$ ($mg/m^3$ or $ppm$)
- $\text{NO}_2$ ($\mu g/m^3$ or $ppb$)
- $\text{SO}_2$ ($\mu g/m^3$ or $ppb$)
- $\text{O}_3$ ($\mu g/m^3$ or $ppb$)
- $\text{NH}_3$ ($\mu g/m^3$)

### MQ-135 Electrochemical Calibration Proxy
Located at [`ml-service/app/aqi/gas_conversion.py`](file:///c:/Users/gurud/OneDrive/Desktop/terrabyte/ml-service/app/aqi/gas_conversion.py):
When low-cost MQ-135 sensors are used instead of lab analyzers, raw resistance values are temperature and humidity compensated:

$$R_s = R_{load} \times \left(\frac{V_{in} - V_{out}}{V_{out}}\right)$$

$$\text{Compensated } R_s = \frac{R_s}{1.0 + 0.005 \times (T - 20) - 0.002 \times (RH - 65)}$$

$$\text{Calibrated PPM} = a \times \left(\frac{R_s}{R_0}\right)^b$$

### Non-Fabrication Rule
- **Never fabricate pollutant measurements**: If raw pollutant channels are unavailable, the platform flags the target as an **ML-predicted predictive estimate** based on gas sensor trends and ambient temperature/humidity patterns. It is explicitly labeled as such in the UI to prevent scientific misrepresentation.

---

## 4. Canonical Schema & Feature Engineering

### Canonical Training Schema
Every raw dataset (whether user telemetry, trial phenotypes, or external Kaggle downloads) is normalized into the canonical feature schema defined in [`ml-service/app/datasets/canonical_schema.py`](file:///c:/Users/gurud/OneDrive/Desktop/terrabyte/ml-service/app/datasets/canonical_schema.py):

| Canonical Field | Type | Description |
|---|---|---|
| `record_id` | String / UUID | Unique record identifier |
| `experiment_id` | String | Source experiment or trial ID |
| `user_id` | String | Obfuscated researcher UUID |
| `timestamp` | ISO-8601 UTC | Telemetry collection moment |
| `crop` | String | Common crop variety (Tomato, Wheat, etc.) |
| `growth_stage` | String | Biological epoch (Emergence, Vegetative, etc.) |
| `temperature_c` | Float | Ambient temperature in Celsius |
| `humidity_pct` | Float | Relative humidity (0-100%) |
| `soil_moisture_pct` | Float | Volumetric soil moisture index |
| `aqi` | Float | Measured, calculated, or baseline AQI |
| `gas_ppm` | Float | Raw metal-oxide gas sensor reading |
| `pm25`, `pm10`, `co`, `no2` | Float | Optional raw pollutant measurements |
| `fan_state` | Integer (0/1) | Chamber exhaust ventilation actuator state |
| `irrigation_state` | Integer (0/1) | Submersible peristaltic pump state |
| `provenance_source` | String | `user_iot`, `experiment_history`, or `kaggle_reference` |

### Time-Series Feature Store
To prevent simplistic static regression, the engine creates advanced temporal features ([`ml-service/app/features/engineering.py`](file:///c:/Users/gurud/OneDrive/Desktop/terrabyte/ml-service/app/features/engineering.py)):
1. **Lags**: $t-1$, $t-3$, $t-6$, $t-12$, $t-24$ for all sensor channels.
2. **Rolling Statistics**: Rolling mean, median, min, max, and standard deviation across rolling windows of 3, 6, and 12 steps.
3. **Rates of Change**: Instantaneous first difference $\Delta x = x_t - x_{t-1}$.
4. **Vapor Pressure Deficit (VPD)**:

   $$\text{SVP} = 0.61078 \times \exp\left(\frac{17.27 \times T}{T + 237.3}\right)$$

   $$\text{VPD} = \text{SVP} \times \left(1 - \frac{\text{RH}}{100}\right)$$

5. **Agronomic Inter-Sensor Interactions**:
   - $\text{Temp} \times \text{Humidity}$
   - $\text{Temp} \times \text{Soil Moisture}$
   - $\text{Humidity} \times \text{Soil Moisture}$
   - $\text{AQI} \times \text{Temp}$
6. **Cyclical Temporal Embeddings**:
   - $\sin(2\pi \times \text{hour}/24)$, $\cos(2\pi \times \text{hour}/24)$
   - Day of week, month seasonality.

### Strict Anti-Leakage Chronological Splitting
Random $k$-fold cross validation or random train/test splits are strictly forbidden for time-series data:
- **Training Set (Oldest 70%)**: $t_0 \to t_{0.70}$
- **Validation Set (Next 15%)**: $t_{0.70} \to t_{0.85}$ (used for candidate comparison and early stopping)
- **Test Set (Latest 15%)**: $t_{0.85} \to t_{1.0}$ (strictly hold-out for final unbiased evaluation)

---

## 5. Kaggle Reference Bootstrapping

Located at [`ml-service/app/datasets/kaggle_ingestion.py`](file:///c:/Users/gurud/OneDrive/Desktop/terrabyte/ml-service/app/datasets/kaggle_ingestion.py):
- Reference dataset: `arkabhowmik/crop-recommendation`.
- Downloaded automatically via `kagglehub`.
- Dynamic format inspection: Handles both `.xlsx` (OpenPyXL) and `.csv` files.
- Provenance tracking: Saves raw column names, record counts, file SHA hashes, and normalized output into `ml_datasets` and `ml_dataset_versions`.

---

## 6. Model Training, Selection & Registry

### Model Zoo
- **XGBoost Regressor**: Optimized gradient boosted trees with depth regulation.
- **Random Forest**: Ensemble of randomized trees resistant to sensor noise.
- **Extra Trees**: Extremely randomized trees providing fast variance reduction.
- **Gradient Boosting Regressor**: Huber loss for outlier rejection.
- **Deep Sequence Model (PyTorch)**: 2-layer GRU with linear head for large datasets ($N > 10,000$).

### Metric-Based Champion Selection
Located at [`ml-service/app/models/forecaster.py`](file:///c:/Users/gurud/OneDrive/Desktop/terrabyte/ml-service/app/models/forecaster.py):
The pipeline independently trains candidate algorithms across all 4 targets, evaluating each on the held-out validation set. The champion is selected using Root Mean Squared Error (RMSE):

$$\text{Champion} = \arg\min_m \text{RMSE}_{\text{val}}(m)$$

Metrics computed:
- **MAE** (Mean Absolute Error)
- **RMSE** (Root Mean Squared Error)
- **$R^2$ Score** (Coefficient of Determination)
- **MAPE** (Mean Absolute Percentage Error)
- **Empirical 95% Prediction Intervals**: $\hat{y} \pm 1.96 \times \text{RMSE}_{\text{val}}$

### Model Registry & One-Click Rollback
Located at [`ml-service/app/deployment/registry.py`](file:///c:/Users/gurud/OneDrive/Desktop/terrabyte/ml-service/app/deployment/registry.py):
- Serialized to disk/storage: `<artifacts_dir>/<model_id>.joblib`
- Versioning schema: `v1.0.0-champion`, `v1.0.1`, etc.
- **Activation Lifecycle**:
  1. Verify artifact exists and feature schema hash matches.
  2. Run isolated smoke prediction on sample payload.
  3. Demote currently active model to `archived` or `candidate`.
  4. Promote candidate model to `active`.
  5. Store rollback pointer (`previous_active_model_id`).
- **One-Click Rollback**: Instantly restores previous active version without retraining.

---

## 7. Database Migrations & Security (RLS)

Migration file: [`supabase/migrations/20261007_admin_ml_management.sql`](file:///c:/Users/gurud/OneDrive/Desktop/terrabyte/supabase/migrations/20261007_admin_ml_management.sql).

### Key Tables
1. `ml_datasets`: Catalog of datasets (user aggregated, experiments, Kaggle reference).
2. `ml_dataset_versions`: Snapshot records with provenance metadata and row counts.
3. `ml_feature_schemas`: Versioned list of input and engineered features.
4. `ml_models`: Base model definitions.
5. `ml_model_versions`: Trained model versions with hyperparameters, metrics, and artifact locations.
6. `ml_training_jobs`: Job execution lifecycle (`QUEUED`, `RUNNING`, `COMPLETED`, `FAILED`) and stdout logs.
7. `ml_deployments`: Deployment history with activation logs.
8. `ml_predictions`: Production prediction audit log with latency tracking.
9. `ml_drift_metrics`: Feature drift monitoring history (PSI metrics).

### Security Architecture
- **Row Level Security (RLS)** is strictly enabled on all ML tables.
- Standard users are locked out via the `is_admin()` policy check.
- **Consent Governance**: `profiles.include_in_research_training` and `experiments.include_in_research_training` (default: `true`). Normal users can opt out at any time; the aggregation query excludes opted-out records automatically.
- **Zero Browser Secrets**: `SUPABASE_SERVICE_ROLE_KEY` is never prefixed with `NEXT_PUBLIC_` and never imported into client-side code.

---

## 8. Standalone Python ML Service Deployment

### Directory Structure
```
ml-service/
├── app/
│   ├── aqi/
│   │   ├── calculator.py       # EPA & CPCB linear breakpoint calculator
│   │   └── gas_conversion.py   # MQ-135 calibration & compensation
│   ├── datasets/
│   │   ├── canonical_schema.py # Universal feature and target definition
│   │   ├── kaggle_ingestion.py # KaggleHub downloader & excel/csv reader
│   │   ├── quality_checks.py   # Anomaly, spike & staleness validator
│   │   └── user_aggregator.py  # Supabase multi-user consent aggregator
│   ├── features/
│   │   ├── engineering.py      # Lags, rolling stats, cyclic time & VPD
│   │   ├── mapping.py          # Column synonym dictionary & unit scaler
│   │   └── split.py            # Strict chronological 70/15/15 time split
│   ├── models/
│   │   ├── forecaster.py       # Multi-target champion training pipeline
│   │   ├── ensemble.py         # Weighted blending ensemble
│   │   └── deep_learning.py    # PyTorch GRU/LSTM architecture
│   ├── deployment/
│   │   └── registry.py         # Joblib persistence, smoke test & rollback
│   ├── monitoring/
│   │   └── drift.py            # Population Stability Index (PSI)
│   ├── api/
│   │   └── routes.py           # FastAPI REST API endpoints
│   ├── config.py               # Pydantic environment configuration
│   └── main.py                 # FastAPI application factory
├── tests/
│   ├── test_aqi.py             # AQI breakpoint & MQ-135 unit tests
│   ├── test_features.py        # Feature engineering & time-split tests
│   └── test_pipeline.py        # End-to-end training, registry & prediction
├── Dockerfile                  # Production container definition
├── requirements.txt            # Python dependencies
└── README.md                   # Quickstart guide
```

### Running Locally (Without Docker)
```bash
# 1. Navigate to ML service directory
cd ml-service

# 2. Create virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set environment variables (or copy .env.example)
set SUPABASE_URL=https://qbeqacmwaoufiwhafvyj.supabase.co
set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
set ML_SERVICE_PORT=8000

# 5. Launch FastAPI server with Uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Running with Docker
```bash
# Build Docker image
docker build -t epiml-ml-service:latest ./ml-service

# Run Docker container
docker run -d \
  --name epiml-ml-worker \
  -p 8000:8000 \
  -e SUPABASE_URL=https://qbeqacmwaoufiwhafvyj.supabase.co \
  -e SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here \
  -e STORAGE_DIR=/app/artifacts \
  -v epiml_model_artifacts:/app/artifacts \
  epiml-ml-service:latest

# Check container health
curl http://localhost:8000/health
```

---

## 9. API Reference

### Real-Time Prediction API
`POST /api/ml/predict`

**Request Body:**
```json
{
  "horizon_minutes": 30,
  "crop": "Tomato",
  "current_features": {
    "temperature_c": 24.8,
    "humidity_pct": 76.5,
    "soil_moisture_pct": 71.0,
    "gas_ppm": 38.0,
    "temp_x_humidity": 1897.2,
    "vpd_kpa": 0.73
  }
}
```

**Response Body:**
```json
{
  "timestamp": "2026-10-07T00:30:00Z",
  "horizon_minutes": 30,
  "predictions": {
    "aqi": 51.3,
    "temperature_c": 25.1,
    "humidity_pct": 75.2,
    "soil_moisture_pct": 69.8
  },
  "confidence": {
    "aqi": 0.88,
    "temperature": 0.94,
    "humidity": 0.92,
    "soil_moisture": 0.91
  },
  "intervals": {
    "aqi": [46.1, 56.5],
    "temperature_c": [24.3, 25.9],
    "humidity_pct": [72.7, 77.7],
    "soil_moisture_pct": [67.8, 71.8]
  },
  "model_version": "v1.0.0-champion",
  "method": "xgboost_timeseries_model"
}
```

### Model Management Endpoints
- `GET /api/admin/ml/stats`: System-wide statistics for the admin dashboard.
- `GET /api/admin/ml/data-explorer`: Filterable multi-user records query with pagination.
- `GET /api/admin/ml/datasets`: Dataset catalog with row counts and provenance details.
- `GET /api/admin/ml/training-jobs`: Current and historical ML training job statuses.
- `POST /api/admin/ml/training-jobs`: Asynchronous training job dispatcher.
- `GET /api/admin/ml/models`: Model leaderboard with RMSE, MAE, $R^2$ validation scores.
- `POST /api/admin/ml/models`: Promote candidate model or perform one-click rollback.
- `GET /api/admin/ml/drift`: Real-time PSI drift monitoring metrics across input sensors.

---

## 10. Fail-Safe Operations & Production Resilience

1. **ML Service Degraded / Offline**: If the Python service goes offline, the Next.js API route (`frontend/src/app/api/ml/predict/route.ts`) automatically falls back to an internal calibrated microclimate estimation model with clearly communicated UI badges. Sensor monitoring and closed-loop microcontroller actuation never stop.
2. **Corrupted Model Artifact**: The registry runs an isolated smoke prediction test on every candidate model before promotion. If the test fails, promotion is aborted, and the current active model remains in production.
3. **Data Quality Quarantine**: If an incoming batch contains excessive missing values (>40%) or sensor spikes beyond physical limits (-10°C to 60°C for temperature, 0-100% for humidity/soil), the dataset ingestion layer quaratines the bad records and logs a quality penalty score without halting the system.
4. **Reproducibility**: Every model version persists its exact random seeds, hyperparameters, canonical feature schema hash, and training dataset snapshot ID.
