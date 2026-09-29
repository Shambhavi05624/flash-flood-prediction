# PS 26192 — Flash Flood Prediction System for Hilly Regions using Multi-Source Data

**Team:** CodeOrbit  
**Team ID:** 134501  
**Institution:** Amity University Jharkhand  
**Hackathon:** Smart India Hackathon  

---

## 1. Project Overview & Architecture

This system delivers an end-to-end operational disaster-intelligence and flash-flood early warning platform specifically built for hilly watersheds, plateau knickpoints, and steep river corridors (focused on the Chota Nagpur Plateau, Jharkhand).

### Production Architecture
```
USER / EMERGENCY OPERATOR
           ↓
REACT + VITE FRONTEND (TypeScript + Tailwind CSS + React-Leaflet + Recharts)
           ↓ (Axios API Service Layer with strict target leakage exclusion)
LOCATION SELECTION / TELEMETRY INTERPOLATION
           ↓
FASTAPI BACKEND (`POST /api/v1/predict`)
           ↓
PYDANTIC SCHEMA VALIDATION (33 Runtime Features Verified)
           ↓
PREPROCESSING PIPELINE (`ColumnTransformer` from `preprocessing_pipeline.joblib`)
           ↓
RANDOM FOREST MODEL (`flash_flood_model.joblib`)
           ↓
RISK PROCESSING ENGINE
  • Risk Level: LOW (0-24) | MODERATE (25-49) | HIGH (50-74) | VERY HIGH (75-100)
  • Risk Index: Probability × 100
  • Model Probability: Raw P(Proxy = 1)
           ↓
FASTAPI JSON RESPONSE
           ↓
REACT FRONTEND (GIS Map, Hydrological Trend Charts, Alert Center, Audit Log)
```

---

## 2. Directory Structure

```
PS26192_FLASH_FLOOD_SYSTEM/
│
├── frontend/ (and fullstack applet)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── RiskBadge.tsx
│   │   │   │   └── StatusIndicator.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── EnvironmentalCards.tsx
│   │   │   │   ├── RiskSummaryCards.tsx
│   │   │   │   └── TrendsCharts.tsx
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   └── map/
│   │   │       └── GisMap.tsx
│   │   │
│   │   ├── constants/
│   │   │   ├── dataSources.ts
│   │   │   ├── locations.ts
│   │   │   └── modelInfo.ts
│   │   │
│   │   ├── hooks/
│   │   │   └── useBackendHealth.ts
│   │   │
│   │   ├── pages/
│   │   │   ├── AlertsPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── DataSourcesPage.tsx
│   │   │   ├── HistoricalPage.tsx
│   │   │   ├── HistoryPage.tsx
│   │   │   ├── HomePage.tsx
│   │   │   ├── LocationDetailsPage.tsx
│   │   │   ├── MapPage.tsx
│   │   │   ├── ModelInfoPage.tsx
│   │   │   ├── NotFoundPage.tsx
│   │   │   ├── PredictionPage.tsx
│   │   │   ├── PredictionResultPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   │
│   │   ├── services/
│   │   │   └── api.ts
│   │   │
│   │   ├── types/
│   │   │   └── index.ts
│   │   │
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   │
│   ├── index.html
│   ├── metadata.json
│   ├── package.json
│   ├── server.ts
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
│
└── README.md
```

---

## 3. The Exact 33 Runtime Feature Contract

The frontend and FastAPI backend strictly synchronize on these **33 runtime features**:

| # | Feature Key | Type | Description | Source Pipeline |
|---|-------------|------|-------------|-----------------|
| 1 | `latitude` | `float` | Station/coordinate latitude in decimal degrees | GPS / GIS Vector |
| 2 | `longitude` | `float` | Station/coordinate longitude in decimal degrees | GPS / GIS Vector |
| 3 | `elevation_m` | `float` | Surface elevation in meters above sea level | NASA SRTM 30m DEM |
| 4 | `slope_deg` | `float` | Topographic slope inclination in degrees | SRTM DEM Derivative |
| 5 | `aspect_deg` | `float` | Slope facing azimuth (0° to 360°) | SRTM DEM Derivative |
| 6 | `curvature_dem` | `float` | Profile planform curvature (flow convergence) | SRTM DEM Derivative |
| 7 | `aspect_northness` | `float` | $\cos(\text{aspect in radians})$ | Mathematical Transform |
| 8 | `aspect_eastness` | `float` | $\sin(\text{aspect in radians})$ | Mathematical Transform |
| 9 | `slope_sin` | `float` | $\sin(\text{slope in radians})$ | Gravitational Runoff Component |
| 10 | `slope_cos` | `float` | $\cos(\text{slope in radians})$ | Infiltration Component |
| 11 | `lulc_class` | `int` | Numerical land use category code | Copernicus Sentinel-2 / Bhuvan |
| 12 | `rain_1d_mm` | `float` | 24-hour antecedent rainfall (mm) | IMD Gridded Rainfall Grid |
| 13 | `rain_3d_mm` | `float` | 72-hour cumulative antecedent rainfall (mm) | IMD Gridded Rainfall Grid |
| 14 | `rain_7d_mm` | `float` | 7-day cumulative rainfall (mm) | IMD Gridded Rainfall Grid |
| 15 | `rain_15d_mm` | `float` | 15-day cumulative rainfall (mm) | IMD Gridded Rainfall Grid |
| 16 | `rain_30d_mm` | `float` | 30-day baseline antecedent rainfall (mm) | IMD Gridded Rainfall Grid |
| 17 | `hist_rain_mean_mm` | `float` | Multi-year historical mean rainfall (mm) | IMD 30-Year Climatology |
| 18 | `hist_rain_max_month_mm`| `float` | Maximum monthly rainfall on record (mm) | IMD Climatology |
| 19 | `hist_rain_std_mm` | `float` | Precipitation standard deviation | IMD Climatology |
| 20 | `soil_moisture_gwet_top`| `float`| Top-layer volumetric soil wetness ($0.0 - 1.0$) | NASA GLDAS / SMAP |
| 21 | `hist_soil_mean` | `float` | Historical mean surface soil wetness | NASA GLDAS Climatology |
| 22 | `hist_soil_max` | `float` | Historical peak saturated soil wetness | NASA GLDAS Climatology |
| 23 | `hist_soil_min` | `float` | Historical wilting/minimum soil wetness | NASA GLDAS Climatology |
| 24 | `hist_temp_mean` | `float` | Historical mean 2m air temperature (°C) | IMD / ERA5-Land |
| 25 | `hist_temp_max` | `float` | Historical maximum recorded temperature (°C) | IMD / ERA5-Land |
| 26 | `hist_temp_min` | `float` | Historical minimum recorded temperature (°C) | IMD / ERA5-Land |
| 27 | `hist_rh_mean` | `float` | Historical mean relative humidity (%) | IMD / ERA5-Land |
| 28 | `hist_wind_mean` | `float` | Historical mean wind speed (m/s) | IMD / ERA5-Land |
| 29 | `state` | `str` | Administrative State (e.g. `"Jharkhand"`) | Survey of India Boundaries |
| 30 | `district` | `str` | Administrative District (e.g. `"Ranchi"`, `"Ramgarh"`)| Administrative Boundaries |
| 31 | `lulc_name` | `str` | Descriptive land cover classification name | Bhuvan / ISRO Mask |
| 32 | `srtm_tile` | `str` | SRTM 1-arcsec raster tile ID (e.g. `"N23E085"`)| USGS / NASA SRTM |
| 33 | `nearest_river_name` | `str` | Drainage channel / river stem name | India WRIS Hydrography |

---

## 4. Strictly Forbidden Target Leakage Inputs

The following 12 fields are **never** submitted to the model. The client API layer and backend schemas reject requests with **HTTP 422** if any are detected:
- `flash_flood_proxy_label`
- `flash_flood_risk_score`
- `nearest_flood_distance_km`
- `nearest_flood_event_id`
- `flood_proximity_score`
- `flood_event_count_5km`
- `flood_event_count_10km`
- `flood_event_count_25km`
- `flood_event_count_50km`
- `flood_event_count_100km`
- `target_label`
- `target_class`

---

## 5. Required Backend Endpoints Contract

| Endpoint | Method | Input | Expected Response |
|---|---|---|---|
| `/health` | `GET` | None | `{"status": "ok", "model": "loaded"}` |
| `/api/v1/predict` | `POST` | Exact 33 features JSON | Prediction response object with Risk Level, Risk Index, and Probability |
| `/api/v1/location/{id}` | `GET` | Location path param | Environmental 33 features object for requested station |
| `/api/v1/features` | `POST` | `{"latitude": float, "longitude": float}` | Derived 33 features interpolated for coordinate point |
| `/api/v1/history` | `GET` | Optional query params | Array of historical flood proxy records |
| `/api/v1/predictions` | `GET` | None | Persisted prediction log |
| `/api/v1/alerts` | `GET` | None | Active hydrological alerts and warnings |
| `/api/v1/sources` | `GET` | None | Real-time status of data pipeline sources |

---

## 6. Exact Prediction Payload & Response Example

### Request Payload (`POST /api/v1/predict`)
```json
{
  "latitude": 23.6338,
  "longitude": 85.2922,
  "elevation_m": 412.0,
  "slope_deg": 26.5,
  "aspect_deg": 198.0,
  "curvature_dem": 0.045,
  "aspect_northness": -0.9511,
  "aspect_eastness": -0.3090,
  "slope_sin": 0.4462,
  "slope_cos": 0.8949,
  "lulc_class": 2,
  "rain_1d_mm": 112.5,
  "rain_3d_mm": 198.0,
  "rain_7d_mm": 275.4,
  "rain_15d_mm": 340.2,
  "rain_30d_mm": 460.0,
  "hist_rain_mean_mm": 1420.0,
  "hist_rain_max_month_mm": 410.0,
  "hist_rain_std_mm": 98.4,
  "soil_moisture_gwet_top": 0.86,
  "hist_soil_mean": 0.56,
  "hist_soil_max": 0.92,
  "hist_soil_min": 0.25,
  "hist_temp_mean": 25.1,
  "hist_temp_max": 40.2,
  "hist_temp_min": 8.5,
  "hist_rh_mean": 76.8,
  "hist_wind_mean": 4.1,
  "state": "Jharkhand",
  "district": "Ramgarh",
  "lulc_name": "Deciduous Dense Forest",
  "srtm_tile": "N23E085",
  "nearest_river_name": "Nalkari"
}
```

### Response Payload (`HTTP 200 OK`)
```json
{
  "prediction_id": "pred-1790663267647-67",
  "timestamp": "2026-09-29T06:27:47.647Z",
  "location": {
    "state": "Jharkhand",
    "district": "Ramgarh",
    "latitude": 23.6338,
    "longitude": 85.2922,
    "nearest_river_name": "Nalkari"
  },
  "risk_level": "HIGH",
  "risk_index": 67.2,
  "model_probability": 0.672,
  "environmental_summary": {
    "rainfall_1d_mm": 112.5,
    "rainfall_3d_mm": 198.0,
    "rainfall_7d_mm": 275.4,
    "rainfall_15d_mm": 340.2,
    "rainfall_30d_mm": 460.0,
    "elevation_m": 412.0,
    "slope_deg": 26.5,
    "aspect_deg": 198.0,
    "soil_moisture": 0.86,
    "land_cover": "Deciduous Dense Forest",
    "nearest_river": "Nalkari"
  },
  "meta": {
    "model_type": "Random Forest Classifier",
    "features_count": 33,
    "pipeline": "ColumnTransformer (StandardScaler + OneHotEncoder)",
    "risk_algorithm": "P(Flood Proxy) × 100"
  }
}
```

---

## 7. Connecting to Teammate's FastAPI Backend

1. In your teammate's FastAPI repository, run:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```
2. In the React application, either:
   - Create or update `.env`:
     ```env
     VITE_API_BASE_URL=http://localhost:8000
     ```
   - OR navigate to the in-app **Settings** page (`/settings`), type `http://localhost:8000` into the FastAPI Base URL field, and click **Save URL**.
3. Click **Test GET /health** to verify the connection and model readiness.

---

## 8. Model Evaluation Benchmark & Disclaimer

| Metric | Supplied Value |
|---|---|
| **Accuracy** | 0.999865 |
| **Precision** | 0.999639 |
| **Recall** | 0.999819 |
| **F1-Score** | 0.999729 |
| **ROC-AUC** | ~1.000000 |
| **PR-AUC** | ~0.999999 |
| **Brier Score** | 0.003819 |

> **Operational Clarification:**
> *"These evaluation metrics describe performance on the project's historical flood-proximity proxy test set. They should not be interpreted as field accuracy for operational flash-flood forecasting."*  
> The system explicitly avoids claiming 100% real-world accuracy; ground truth reflects historical proxy convergence.

---

## 9. Integration Verification Checklist

- [x] React SPA builds and runs with Vite and Tailwind CSS.
- [x] All 13 routes active and tested (Landing, Dashboard, Predict, Map, Details, Result, Historical, Alerts, History, Model Info, Data Sources, Settings, 404).
- [x] `GET /health` verified responding with `{"status": "ok", "model": "loaded"}`.
- [x] `POST /api/v1/predict` verified accepting 33 runtime features.
- [x] Forbidden target leakage features detected and rejected with HTTP 422.
- [x] Separate Risk Level, Risk Index, and Model Probability cards displayed.
- [x] 12 Environmental Context Cards populated from telemetry.
- [x] Hydrological trends and soil saturation charts rendered with Recharts.
- [x] GIS Map rendered with OpenTopoMap, river vector polylines, coordinates readout, and click-to-query.
- [x] Offline / Unavailability handling: shows `SYSTEM STATUS: Unavailable` without fabricating fake predictions.
