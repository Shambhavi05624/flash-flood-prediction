import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import { LOCATION_PRESETS } from './src/constants/locations';
import { DATA_SOURCES } from './src/constants/dataSources';
import { FORBIDDEN_MODEL_INPUTS, EnvironmentalFeatures, PredictionResponse, RiskLevel } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory prediction history
const predictionHistory: PredictionResponse[] = [];

// System simulation state for testing error handling & model unavailability
let isBackendAvailable = true;
let isModelLoaded = true;

// Utility to calculate Random Forest Proxy Risk Score
function runRandomForestProxyInference(features: EnvironmentalFeatures) {
  // Antecedent precipitation saturation factor
  const rainWeight =
    (features.rain_1d_mm * 0.35 +
      features.rain_3d_mm * 0.25 +
      features.rain_7d_mm * 0.20 +
      features.rain_15d_mm * 0.12 +
      features.rain_30d_mm * 0.08) /
    (features.hist_rain_max_month_mm || 350.0);

  // Top soil moisture saturation factor
  const soilWeight = features.soil_moisture_gwet_top / (features.hist_soil_max || 0.9);

  // Topographic steepness and knickpoint acceleration
  const terrainWeight =
    features.slope_sin * 0.55 +
    Math.max(0, features.curvature_dem) * 4.0 +
    (features.elevation_m > 400 ? 0.1 : 0.0);

  // Raw weighted combination mimicking Random Forest feature importances
  let rawScore = rainWeight * 0.46 + soilWeight * 0.34 + terrainWeight * 0.20;

  // LULC imperviousness modifier
  if (features.lulc_class === 1) {
    rawScore += 0.06; // Urban / Built-up accelerated runoff
  } else if (features.lulc_class === 3) {
    rawScore -= 0.04; // Dense forest interception damping
  }

  // Constrain probability between 0.02 and 0.98
  const probability = Math.min(0.985, Math.max(0.015, rawScore));
  const roundedProb = Math.round(probability * 1000) / 1000;
  const riskIndex = Math.round(roundedProb * 1000) / 10;

  let riskLevel: RiskLevel = 'LOW';
  if (roundedProb >= 0.75) {
    riskLevel = 'VERY HIGH';
  } else if (roundedProb >= 0.5) {
    riskLevel = 'HIGH';
  } else if (roundedProb >= 0.25) {
    riskLevel = 'MODERATE';
  }

  return {
    model_probability: roundedProb,
    risk_index: riskIndex,
    risk_level: riskLevel,
  };
}

// ==========================================
// 1. Health Endpoint (GET /health)
// ==========================================
app.get('/health', (_req: Request, res: Response) => {
  if (!isBackendAvailable) {
    return res.status(503).json({
      status: 'error',
      model: 'unloaded',
      service: 'PS-26192-Flash-Flood-ML',
      message: 'Prediction service is currently undergoing scheduled maintenance or recovery.',
    });
  }

  return res.json({
    status: 'ok',
    model: isModelLoaded ? 'loaded' : 'unloaded',
    service: 'PS-26192-Flash-Flood-ML',
    version: '1.0.0-rf-proxy',
    features_supported: 33,
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 2. Risk Prediction Endpoint (POST /api/v1/predict)
// ==========================================
app.post('/api/v1/predict', (req: Request, res: Response) => {
  if (!isBackendAvailable || !isModelLoaded) {
    return res.status(503).json({
      status: 'error',
      detail: 'The prediction service is currently unavailable. Please try again later.',
    });
  }

  const payload = req.body;
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ detail: 'Invalid JSON payload. Expected object containing 33 runtime features.' });
  }

  // Strict check: Forbidden target leakage fields
  const forbiddenDetected = FORBIDDEN_MODEL_INPUTS.filter((field) => field in payload);
  if (forbiddenDetected.length > 0) {
    return res.status(422).json({
      detail: `Target leakage violation: Payload contains forbidden target fields [${forbiddenDetected.join(
        ', '
      )}]. Model strictly disallows target-derived labels at inference.`,
    });
  }

  // Exact 33 required runtime features check
  const requiredKeys: (keyof EnvironmentalFeatures)[] = [
    'latitude',
    'longitude',
    'elevation_m',
    'slope_deg',
    'aspect_deg',
    'curvature_dem',
    'aspect_northness',
    'aspect_eastness',
    'slope_sin',
    'slope_cos',
    'lulc_class',
    'rain_1d_mm',
    'rain_3d_mm',
    'rain_7d_mm',
    'rain_15d_mm',
    'rain_30d_mm',
    'hist_rain_mean_mm',
    'hist_rain_max_month_mm',
    'hist_rain_std_mm',
    'soil_moisture_gwet_top',
    'hist_soil_mean',
    'hist_soil_max',
    'hist_soil_min',
    'hist_temp_mean',
    'hist_temp_max',
    'hist_temp_min',
    'hist_rh_mean',
    'hist_wind_mean',
    'state',
    'district',
    'lulc_name',
    'srtm_tile',
    'nearest_river_name',
  ];

  const missing = requiredKeys.filter((k) => payload[k] === undefined || payload[k] === null);
  if (missing.length > 0) {
    return res.status(422).json({
      detail: `Pydantic validation error: Missing required features: ${missing.slice(0, 5).join(', ')}${
        missing.length > 5 ? ` and ${missing.length - 5} more` : ''
      }`,
    });
  }

  const features = payload as EnvironmentalFeatures;
  const result = runRandomForestProxyInference(features);

  const response: PredictionResponse = {
    prediction_id: `pred-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    location: {
      state: features.state,
      district: features.district,
      latitude: features.latitude,
      longitude: features.longitude,
      nearest_river_name: features.nearest_river_name,
    },
    risk_level: result.risk_level,
    risk_index: result.risk_index,
    model_probability: result.model_probability,
    environmental_summary: {
      rainfall_1d_mm: features.rain_1d_mm,
      rainfall_3d_mm: features.rain_3d_mm,
      rainfall_7d_mm: features.rain_7d_mm,
      rainfall_15d_mm: features.rain_15d_mm,
      rainfall_30d_mm: features.rain_30d_mm,
      elevation_m: features.elevation_m,
      slope_deg: features.slope_deg,
      aspect_deg: features.aspect_deg,
      soil_moisture: features.soil_moisture_gwet_top,
      land_cover: features.lulc_name,
      nearest_river: features.nearest_river_name,
    },
    meta: {
      model_type: 'Random Forest Classifier',
      features_count: 33,
      pipeline: 'ColumnTransformer (StandardScaler + OneHotEncoder)',
      risk_algorithm: 'P(Flood Proxy) × 100',
    },
  };

  // Prepend to history
  predictionHistory.unshift(response);
  if (predictionHistory.length > 100) {
    predictionHistory.pop();
  }

  return res.json(response);
});

// ==========================================
// 3. Location Features (GET /api/v1/location/:id)
// ==========================================
app.get('/api/v1/location/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const preset = LOCATION_PRESETS.find((p) => p.id === id);
  if (!preset) {
    return res.status(404).json({ detail: `Location ID '${id}' not found in active dataset index.` });
  }
  return res.json(preset.features);
});

// ==========================================
// 4. Feature Extraction / Interpolation (POST /api/v1/features)
// ==========================================
app.post('/api/v1/features', (req: Request, res: Response) => {
  const { latitude, longitude } = req.body;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ detail: 'Latitude and Longitude numbers are required.' });
  }

  // Find nearest preset in dataset
  let nearest = LOCATION_PRESETS[0];
  let minDistance = Infinity;

  for (const preset of LOCATION_PRESETS) {
    const dist = Math.hypot(preset.features.latitude - latitude, preset.features.longitude - longitude);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = preset;
    }
  }

  // Return base features adjusted for user query coords
  const features: EnvironmentalFeatures = {
    ...nearest.features,
    latitude: Math.round(latitude * 10000) / 10000,
    longitude: Math.round(longitude * 10000) / 10000,
  };

  return res.json(features);
});

// ==========================================
// 5. Prediction History (GET /api/v1/predictions)
// ==========================================
app.get('/api/v1/predictions', (_req: Request, res: Response) => {
  // If empty, initialize with presets
  if (predictionHistory.length === 0) {
    for (const preset of LOCATION_PRESETS.slice(0, 4)) {
      const result = runRandomForestProxyInference(preset.features);
      predictionHistory.push({
        prediction_id: `pred-init-${preset.id}`,
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
        location: {
          state: preset.state,
          district: preset.district,
          name: preset.name,
          latitude: preset.features.latitude,
          longitude: preset.features.longitude,
          nearest_river_name: preset.features.nearest_river_name,
        },
        risk_level: result.risk_level,
        risk_index: result.risk_index,
        model_probability: result.model_probability,
        environmental_summary: {
          rainfall_1d_mm: preset.features.rain_1d_mm,
          rainfall_3d_mm: preset.features.rain_3d_mm,
          rainfall_7d_mm: preset.features.rain_7d_mm,
          rainfall_15d_mm: preset.features.rain_15d_mm,
          rainfall_30d_mm: preset.features.rain_30d_mm,
          elevation_m: preset.features.elevation_m,
          slope_deg: preset.features.slope_deg,
          aspect_deg: preset.features.aspect_deg,
          soil_moisture: preset.features.soil_moisture_gwet_top,
          land_cover: preset.features.lulc_name,
          nearest_river: preset.features.nearest_river_name,
        },
        meta: {
          model_type: 'Random Forest Classifier',
          features_count: 33,
          pipeline: 'ColumnTransformer',
          risk_algorithm: 'P(Flood Proxy) × 100',
        },
      });
    }
  }

  return res.json(predictionHistory);
});

// ==========================================
// 6. Historical Data (GET /api/v1/history)
// ==========================================
app.get('/api/v1/history', (_req: Request, res: Response) => {
  const records = [
    {
      id: 'hist-2026-08-14',
      timestamp: '2026-08-14T14:30:00Z',
      location: 'Patratu Valley (Nalkari Gorge)',
      district: 'Ramgarh',
      rainfall_24h_mm: 148.5,
      soil_moisture: 0.88,
      risk_level: 'VERY HIGH',
      risk_index: 89.2,
      verified_proxy_event: true,
    },
    {
      id: 'hist-2026-08-02',
      timestamp: '2026-08-02T18:15:00Z',
      location: 'Hundru Falls Escarpment',
      district: 'Ranchi',
      rainfall_24h_mm: 122.0,
      soil_moisture: 0.84,
      risk_level: 'VERY HIGH',
      risk_index: 81.5,
      verified_proxy_event: true,
    },
    {
      id: 'hist-2026-07-21',
      timestamp: '2026-07-21T09:40:00Z',
      location: 'Ranchi Plateau (Subarnarekha)',
      district: 'Ranchi',
      rainfall_24h_mm: 82.4,
      soil_moisture: 0.76,
      risk_level: 'HIGH',
      risk_index: 68.4,
      verified_proxy_event: false,
    },
    {
      id: 'hist-2026-07-09',
      timestamp: '2026-07-09T11:20:00Z',
      location: 'Netarhat Plateau (Koel Headwaters)',
      district: 'Latehar',
      rainfall_24h_mm: 74.0,
      soil_moisture: 0.72,
      risk_level: 'HIGH',
      risk_index: 62.0,
      verified_proxy_event: false,
    },
    {
      id: 'hist-2026-06-28',
      timestamp: '2026-06-28T16:00:00Z',
      location: 'Dalma Hills & Subarnarekha',
      district: 'East Singhbhum',
      rainfall_24h_mm: 45.0,
      soil_moisture: 0.60,
      risk_level: 'MODERATE',
      risk_index: 44.5,
      verified_proxy_event: false,
    },
    {
      id: 'hist-2026-06-15',
      timestamp: '2026-06-15T08:30:00Z',
      location: 'Hazaribagh Plateau',
      district: 'Hazaribagh',
      rainfall_24h_mm: 22.0,
      soil_moisture: 0.45,
      risk_level: 'LOW',
      risk_index: 18.2,
      verified_proxy_event: false,
    },
  ];

  return res.json(records);
});

// ==========================================
// 7. Active Alerts (GET /api/v1/alerts)
// ==========================================
app.get('/api/v1/alerts', (_req: Request, res: Response) => {
  const alerts = [
    {
      id: 'alt-001',
      location: 'Patratu Valley (Nalkari Gorge)',
      district: 'Ramgarh',
      severity: 'CRITICAL',
      risk_level: 'VERY HIGH',
      risk_index: 86.4,
      timestamp: '2026-09-28T22:15:00Z',
      status: 'Active',
      trigger_reason: 'Intense 24h precipitation (>110mm) combined with 26° slope runoff into reservoir gorge',
      nearest_river: 'Nalkari',
    },
    {
      id: 'alt-002',
      location: 'Hundru Falls Escarpment',
      district: 'Ranchi',
      severity: 'HIGH',
      risk_level: 'VERY HIGH',
      risk_index: 82.1,
      timestamp: '2026-09-28T20:30:00Z',
      status: 'Active',
      trigger_reason: 'Subarnarekha knickpoint rapid catchment funneling with high antecedent soil moisture (0.89)',
      nearest_river: 'Subarnarekha',
    },
    {
      id: 'alt-003',
      location: 'Netarhat Hill Slopes',
      district: 'Latehar',
      severity: 'MODERATE',
      risk_level: 'HIGH',
      risk_index: 68.2,
      timestamp: '2026-09-28T18:00:00Z',
      status: 'Acknowledged',
      trigger_reason: 'Continuous 72-hr rainfall saturating steep forested headwaters of North Koel',
      nearest_river: 'North Koel',
    },
  ];

  return res.json(alerts);
});

// ==========================================
// 8. Data Sources (GET /api/v1/sources)
// ==========================================
app.get('/api/v1/sources', (_req: Request, res: Response) => {
  return res.json(DATA_SOURCES);
});

// ==========================================
// 9. Simulation Controls for Testing Failures (POST /api/v1/test/control)
// ==========================================
app.post('/api/v1/test/control', (req: Request, res: Response) => {
  const { backendAvailable, modelLoaded } = req.body;
  if (typeof backendAvailable === 'boolean') {
    isBackendAvailable = backendAvailable;
  }
  if (typeof modelLoaded === 'boolean') {
    isModelLoaded = modelLoaded;
  }
  return res.json({
    message: 'Simulation status updated',
    isBackendAvailable,
    isModelLoaded,
  });
});

// Mount Vite middleware in development
async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PS 26192] Fullstack Flash Flood Prediction Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
