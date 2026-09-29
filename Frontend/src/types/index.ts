export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH';

export interface EnvironmentalFeatures {
  latitude: number;
  longitude: number;
  elevation_m: number;
  slope_deg: number;
  aspect_deg: number;
  curvature_dem: number;
  aspect_northness: number;
  aspect_eastness: number;
  slope_sin: number;
  slope_cos: number;
  lulc_class: number;
  rain_1d_mm: number;
  rain_3d_mm: number;
  rain_7d_mm: number;
  rain_15d_mm: number;
  rain_30d_mm: number;
  hist_rain_mean_mm: number;
  hist_rain_max_month_mm: number;
  hist_rain_std_mm: number;
  soil_moisture_gwet_top: number;
  hist_soil_mean: number;
  hist_soil_max: number;
  hist_soil_min: number;
  hist_temp_mean: number;
  hist_temp_max: number;
  hist_temp_min: number;
  hist_rh_mean: number;
  hist_wind_mean: number;
  state: string;
  district: string;
  lulc_name: string;
  srtm_tile: string;
  nearest_river_name: string;
}

export const FORBIDDEN_MODEL_INPUTS = [
  'flash_flood_proxy_label',
  'flash_flood_risk_score',
  'nearest_flood_distance_km',
  'nearest_flood_event_id',
  'flood_proximity_score',
  'flood_event_count_5km',
  'flood_event_count_10km',
  'flood_event_count_25km',
  'flood_event_count_50km',
  'flood_event_count_100km',
  'target_label',
  'target_class',
] as const;

export type ForbiddenInputKey = typeof FORBIDDEN_MODEL_INPUTS[number];

export interface PredictionResponse {
  prediction_id: string;
  timestamp: string;
  location: {
    state: string;
    district: string;
    name?: string;
    latitude: number;
    longitude: number;
    nearest_river_name: string;
  };
  risk_level: RiskLevel;
  risk_index: number; // probability * 100
  model_probability: number; // raw model probability e.g. 0.674
  environmental_summary: {
    rainfall_1d_mm: number;
    rainfall_3d_mm: number;
    rainfall_7d_mm: number;
    rainfall_15d_mm: number;
    rainfall_30d_mm: number;
    elevation_m: number;
    slope_deg: number;
    aspect_deg: number;
    soil_moisture: number;
    land_cover: string;
    nearest_river: string;
  };
  meta: {
    model_type: string;
    features_count: number;
    pipeline: string;
    risk_algorithm: string;
  };
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  model: 'loaded' | 'unloaded' | 'error';
  service?: string;
  timestamp?: string;
  features_supported?: number;
}

export interface LocationPreset {
  id: string;
  name: string;
  district: string;
  state: string;
  description: string;
  terrainType: string;
  riskCategoryHistorical: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH';
  features: EnvironmentalFeatures;
}

export interface HistoricalRecord {
  id: string;
  timestamp: string;
  location: string;
  district: string;
  rainfall_24h_mm: number;
  soil_moisture: number;
  risk_level: RiskLevel;
  risk_index: number;
  verified_proxy_event: boolean;
}

export interface AlertItem {
  id: string;
  location: string;
  district: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  risk_level: RiskLevel;
  risk_index: number;
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  trigger_reason: string;
  nearest_river: string;
}

export type DataSourceStatus = 'LIVE' | 'CONNECTED' | 'HISTORICAL' | 'PROCESSED' | 'UNAVAILABLE' | 'PLANNED';

export interface DataSourceInfo {
  id: string;
  name: string;
  organization: string;
  type: string;
  status: DataSourceStatus;
  lastUpdated: string;
  coverage: string;
  frequency: string;
  description: string;
  endpointOrMethod: string;
}
