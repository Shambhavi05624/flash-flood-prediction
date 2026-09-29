export const MODEL_METRICS = {
  model_name: 'Random Forest Classifier',
  pipeline: 'ColumnTransformer (StandardScaler + OneHotEncoder/Ordinal)',
  features_count: 33,
  target_definition: 'Historical Flood-Proximity Proxy (Synthetic/Historical Multi-Source Index)',
  metrics: {
    accuracy: 0.999865,
    precision: 0.999639,
    recall: 0.999819,
    f1_score: 0.999729,
    roc_auc: 1.000000,
    pr_auc: 0.999999,
    brier_score: 0.003819,
  },
  disclaimer:
    "These evaluation metrics describe performance on the project's historical flood-proximity proxy test set. They should not be interpreted as field accuracy for operational flash-flood forecasting.",
  risk_thresholds: [
    { level: 'LOW', range: '0.00 - 0.24', index_range: '0 - 24', description: 'Base flow regime; minimal hill-slope saturation, runoff absorption capacity nominal.' },
    { level: 'MODERATE', range: '0.25 - 0.49', index_range: '25 - 49', description: 'Moderate saturation; stream flow elevated; rapid drainage watch advised.' },
    { level: 'HIGH', range: '0.50 - 0.74', index_range: '50 - 74', description: 'High saturation; steep slopes exhibit critical runoff velocity; localized flash flood danger.' },
    { level: 'VERY HIGH', range: '0.75 - 1.00', index_range: '75 - 100', description: 'Severe catchment funneling; knickpoint gorges near overflow; immediate warning state.' },
  ],
  feature_breakdown: [
    { group: 'Terrain & Geomorphology (SRTM DEM)', count: 10, items: ['elevation_m', 'slope_deg', 'aspect_deg', 'curvature_dem', 'aspect_northness', 'aspect_eastness', 'slope_sin', 'slope_cos', 'lulc_class', 'srtm_tile'] },
    { group: 'Precipitation Windows (IMD / Satellite)', count: 8, items: ['rain_1d_mm', 'rain_3d_mm', 'rain_7d_mm', 'rain_15d_mm', 'rain_30d_mm', 'hist_rain_mean_mm', 'hist_rain_max_month_mm', 'hist_rain_std_mm'] },
    { group: 'Soil Moisture & Hydrology (NASA GLDAS/SMAP)', count: 4, items: ['soil_moisture_gwet_top', 'hist_soil_mean', 'hist_soil_max', 'hist_soil_min'] },
    { group: 'Atmospheric & Climate Telemetry', count: 5, items: ['hist_temp_mean', 'hist_temp_max', 'hist_temp_min', 'hist_rh_mean', 'hist_wind_mean'] },
    { group: 'Administrative & Hydrographic Context', count: 6, items: ['latitude', 'longitude', 'state', 'district', 'lulc_name', 'nearest_river_name'] },
  ],
};
