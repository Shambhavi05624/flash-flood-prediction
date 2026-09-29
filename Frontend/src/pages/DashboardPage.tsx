import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  RefreshCw,
  Zap,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import { LOCATION_PRESETS } from '../constants/locations';
import { EnvironmentalFeatures, PredictionResponse } from '../types';
import { apiService, ApiError } from '../services/api';
import { RiskSummaryCards } from '../components/dashboard/RiskSummaryCards';
import { EnvironmentalCards } from '../components/dashboard/EnvironmentalCards';
import { TrendsCharts } from '../components/dashboard/TrendsCharts';
import { GisMap } from '../components/map/GisMap';
import { useBackendHealth } from '../hooks/useBackendHealth';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected, isModelLoaded } = useBackendHealth();

  const [selectedStation, setSelectedStation] = useState(LOCATION_PRESETS[0]);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Evaluate risk using backend API
  const evaluateStation = useCallback(async (stationFeatures: EnvironmentalFeatures) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.predictRisk(stationFeatures);
      setPrediction(response);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to evaluate station risk. Prediction service unavailable.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    evaluateStation(selectedStation.features);
  }, [selectedStation, evaluateStation]);

  const handleStationChange = (stationId: string) => {
    const found = LOCATION_PRESETS.find((p) => p.id === stationId);
    if (found) {
      setSelectedStation(found);
    }
  };

  const handleMapCoordSelect = async (lat: number, lng: number) => {
    setIsLoading(true);
    setError(null);
    try {
      // Interpolate/obtain features for these coordinates from backend
      const res = await fetch('/api/v1/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      });
      if (res.ok) {
        const feat: EnvironmentalFeatures = await res.json();
        const customStation = {
          ...selectedStation,
          id: `coord-${lat.toFixed(3)}-${lng.toFixed(3)}`,
          name: `Custom Map Coordinate (${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E)`,
          features: feat,
        };
        setSelectedStation(customStation);
        evaluateStation(feat);
      } else {
        evaluateStation({
          ...selectedStation.features,
          latitude: lat,
          longitude: lng,
        });
      }
    } catch (err) {
      evaluateStation({
        ...selectedStation.features,
        latitude: lat,
        longitude: lng,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Station Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-cyan-950 flex items-center justify-center text-cyan-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Target Hilly Watershed Station:</div>
            <select
              value={selectedStation.id}
              onChange={(e) => handleStationChange(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-sm font-semibold text-white focus:outline-none focus:border-cyan-500 mt-0.5"
            >
              {LOCATION_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.district}) — {p.features.nearest_river_name} River
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => evaluateStation(selectedStation.features)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Re-evaluate</span>
          </button>

          <button
            onClick={() => navigate(`/predict?stationId=${selectedStation.id}`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Customize Features</span>
          </button>
        </div>
      </div>

      {/* Error / Offline Alert */}
      {error && (
        <div className="bg-rose-950/70 border border-rose-800 rounded-lg p-4 text-xs text-rose-200 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-rose-100">Prediction Service Unavailable</div>
              <p className="mt-0.5 text-rose-300">{error}</p>
              <p className="mt-1 text-[11px] text-rose-400">
                In accordance with system policy, no fabricated predictions are generated when the backend is offline.
              </p>
            </div>
          </div>
          <button
            onClick={() => evaluateStation(selectedStation.features)}
            className="px-2.5 py-1 rounded bg-rose-900 text-rose-200 hover:bg-rose-800 text-xs shrink-0 font-mono"
          >
            Retry
          </button>
        </div>
      )}

      {/* RISK SUMMARY (Separate cards: Risk Level, Risk Index, Model Probability) */}
      {prediction ? (
        <RiskSummaryCards
          riskLevel={prediction.risk_level}
          riskIndex={prediction.risk_index}
          modelProbability={prediction.model_probability}
          assessmentTime={new Date(prediction.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
          stationName={selectedStation.name}
        />
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg p-5 animate-pulse h-32" />
          ))}
        </div>
      ) : null}

      {/* GIS MAP SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 tracking-wide uppercase font-mono">
            Interactive GIS Catchment & Drainage Map
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Click map to interrogate coordinates
          </span>
        </div>
        <GisMap
          selectedLocation={{
            name: selectedStation.name,
            latitude: selectedStation.features.latitude,
            longitude: selectedStation.features.longitude,
            risk_level: prediction?.risk_level,
            risk_index: prediction?.risk_index,
            elevation_m: selectedStation.features.elevation_m,
            slope_deg: selectedStation.features.slope_deg,
            nearest_river_name: selectedStation.features.nearest_river_name,
          }}
          onSelectCoordinates={handleMapCoordSelect}
          heightClass="h-[480px]"
        />
      </div>

      {/* ENVIRONMENTAL CARDS (12 cards) */}
      <EnvironmentalCards
        features={selectedStation.features}
        stationName={selectedStation.name}
      />

      {/* CHARTS (Rainfall trend, soil moisture, risk indicators) */}
      <TrendsCharts features={selectedStation.features} />
    </div>
  );
};
