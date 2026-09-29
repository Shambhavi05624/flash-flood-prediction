import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Zap,
  MapPin,
  Sliders,
  AlertTriangle,
  RefreshCw,
  Info,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { LOCATION_PRESETS } from '../constants/locations';
import { EnvironmentalFeatures } from '../types';
import { apiService, ApiError } from '../services/api';
import { useBackendHealth } from '../hooks/useBackendHealth';

export const PredictionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stationIdParam = searchParams.get('stationId');

  const { isConnected, isModelLoaded } = useBackendHealth();

  // Find preset or default
  const initialPreset =
    LOCATION_PRESETS.find((p) => p.id === stationIdParam) || LOCATION_PRESETS[0];

  const [selectedPresetId, setSelectedPresetId] = useState(initialPreset.id);
  const [formData, setFormData] = useState<EnvironmentalFeatures>({ ...initialPreset.features });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedInputs, setShowAdvancedInputs] = useState(false);

  // Sync when preset dropdown changes
  const handlePresetSelect = (id: string) => {
    setSelectedPresetId(id);
    const found = LOCATION_PRESETS.find((p) => p.id === id);
    if (found) {
      setFormData({ ...found.features });
    }
  };

  const handleInputChange = (field: keyof EnvironmentalFeatures, value: string | number) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-compute derived trigonometric values if slope or aspect changes
      if (field === 'slope_deg') {
        const rad = (Number(value) * Math.PI) / 180;
        updated.slope_sin = Math.sin(rad);
        updated.slope_cos = Math.cos(rad);
      }
      if (field === 'aspect_deg') {
        const rad = (Number(value) * Math.PI) / 180;
        updated.aspect_northness = Math.cos(rad);
        updated.aspect_eastness = Math.sin(rad);
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiService.predictRisk(formData);
      // Navigate to result page passing assessment response
      navigate('/result', { state: { prediction: response } });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Prediction failed. Unable to connect to ML prediction service.');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <span>PIPELINE WORKFLOW</span>
          <span>·</span>
          <span>LOCATION → TELEMETRY → PYDANTIC → RANDOM FOREST</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
          Flash Flood Risk Assessment
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Select a verified hilly catchment location or adjust environmental drivers to execute real-time
          inference through the 33-feature scikit-learn pipeline.
        </p>
      </div>

      {/* Backend Unavailability Warning */}
      {(!isConnected || !isModelLoaded) && (
        <div className="bg-rose-950/70 border border-rose-800 rounded-lg p-4 text-xs text-rose-200 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Backend Unreachable: </span>
            The prediction service is currently unavailable. As required by system constraints, no fake
            predictions will be returned. You can configure the FastAPI backend URL in Settings.
          </div>
        </div>
      )}

      {error && (
        <div className="bg-rose-950/80 border border-rose-800 rounded-lg p-4 text-xs text-rose-200 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Assessment Error: </span>
            <span>{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Location & Preset Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-slate-200">
                1. Select Location or Catchment Station
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Step 1 of 3</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-medium">
              Verified Catchment Presets (Auto-populates all 33 Features):
            </label>
            <select
              value={selectedPresetId}
              onChange={(e) => handlePresetSelect(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500"
            >
              {LOCATION_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.district}, {p.state}) — River: {p.features.nearest_river_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/60 p-3 rounded border border-slate-800/80 font-mono">
            <div>
              <span className="text-slate-500 text-[10px] block">LATITUDE</span>
              <span className="text-slate-200 tabular-nums">{formData.latitude.toFixed(4)}°N</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">LONGITUDE</span>
              <span className="text-slate-200 tabular-nums">{formData.longitude.toFixed(4)}°E</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">DISTRICT</span>
              <span className="text-slate-200">{formData.district}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">RIVER AXIS</span>
              <span className="text-cyan-400">{formData.nearest_river_name}</span>
            </div>
          </div>
        </div>

        {/* Step 2: Environmental Drivers Summary & Tuning */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-slate-200">
                2. Environmental Features Summary
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowAdvancedInputs(!showAdvancedInputs)}
              className="text-xs text-cyan-400 hover:underline font-mono"
            >
              {showAdvancedInputs ? 'Collapse All 33 Inputs' : 'Inspect & Edit All 33 Inputs'}
            </button>
          </div>

          {/* Core Feature Summary Grid (Requirement 11) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-950/70 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 block">ELEVATION</span>
              <span className="text-sm font-bold text-slate-100">{formData.elevation_m} m</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">SRTM 30m</span>
            </div>

            <div className="p-3 bg-slate-950/70 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 block">SLOPE ANGLE</span>
              <span className="text-sm font-bold text-slate-100">{formData.slope_deg}°</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">sin(θ): {formData.slope_sin.toFixed(3)}</span>
            </div>

            <div className="p-3 bg-slate-950/70 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 block">24H RAINFALL (1D)</span>
              <span className="text-sm font-bold text-cyan-400">{formData.rain_1d_mm} mm</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">7D: {formData.rain_7d_mm} mm</span>
            </div>

            <div className="p-3 bg-slate-950/70 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 block">SOIL MOISTURE (GWET_TOP)</span>
              <span className="text-sm font-bold text-blue-400">
                {(formData.soil_moisture_gwet_top * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Top-Layer Saturation</span>
            </div>

            <div className="p-3 bg-slate-950/70 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 block">LAND COVER (LULC)</span>
              <span className="text-xs font-semibold text-slate-100 truncate block">
                {formData.lulc_name}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Class {formData.lulc_class}</span>
            </div>

            <div className="p-3 bg-slate-950/70 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 block">DRAINAGE AXIS</span>
              <span className="text-xs font-semibold text-cyan-300 truncate block">
                {formData.nearest_river_name}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Catchment Main Stem</span>
            </div>
          </div>

          {/* Quick Scenario Adjustments */}
          <div className="pt-2 space-y-3">
            <span className="text-xs text-slate-400 font-medium">Quick Stress-Testing Scenarios:</span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    rain_1d_mm: 135.0,
                    rain_3d_mm: 220.0,
                    rain_7d_mm: 310.0,
                    soil_moisture_gwet_top: 0.92,
                  }))
                }
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
              >
                Simulate Cloudburst (135mm Rain + 92% Saturation)
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    rain_1d_mm: 12.0,
                    rain_3d_mm: 24.0,
                    rain_7d_mm: 45.0,
                    soil_moisture_gwet_top: 0.35,
                  }))
                }
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
              >
                Simulate Dry Spell (12mm Rain + 35% Saturation)
              </button>
              <button
                type="button"
                onClick={() => {
                  const preset = LOCATION_PRESETS.find((p) => p.id === selectedPresetId);
                  if (preset) setFormData({ ...preset.features });
                }}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded border border-slate-700"
              >
                Reset to Station Baseline
              </button>
            </div>
          </div>

          {/* Expanded 33 Fields Editor (if toggled) */}
          {showAdvancedInputs && (
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="text-xs font-semibold text-slate-300 font-mono">
                Full 33 Runtime Feature Editor:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 text-[10px] block">rain_1d_mm</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.rain_1d_mm}
                    onChange={(e) => handleInputChange('rain_1d_mm', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] block">rain_3d_mm</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.rain_3d_mm}
                    onChange={(e) => handleInputChange('rain_3d_mm', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] block">rain_7d_mm</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.rain_7d_mm}
                    onChange={(e) => handleInputChange('rain_7d_mm', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] block">soil_moisture_gwet_top</label>
                  <input
                    type="number"
                    step="0.01"
                    max="1.0"
                    min="0.0"
                    value={formData.soil_moisture_gwet_top}
                    onChange={(e) =>
                      handleInputChange('soil_moisture_gwet_top', parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] block">elevation_m</label>
                  <input
                    type="number"
                    value={formData.elevation_m}
                    onChange={(e) => handleInputChange('elevation_m', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] block">slope_deg</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.slope_deg}
                    onChange={(e) => handleInputChange('slope_deg', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] block">curvature_dem</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.curvature_dem}
                    onChange={(e) => handleInputChange('curvature_dem', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] block">nearest_river_name</label>
                  <input
                    type="text"
                    value={formData.nearest_river_name}
                    onChange={(e) => handleInputChange('nearest_river_name', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Run Assessment CTA */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-200">Ready for Model Execution</div>
            <div className="text-[11px] text-slate-400">
              Validates 33 features against target proxy restrictions before sending to FastAPI /predict
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Inference...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>[ RUN RISK ASSESSMENT ]</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
