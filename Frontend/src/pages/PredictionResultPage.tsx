import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Waves,
  Mountain,
  Droplet,
  CloudRain,
  ExternalLink,
  Printer,
  Share2,
} from 'lucide-react';
import { PredictionResponse } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { apiService } from '../services/api';

export const PredictionResultPage: React.FC = () => {
  const routerLocation = useLocation();
  const navigate = useNavigate();

  const [prediction, setPrediction] = useState<PredictionResponse | null>(
    (routerLocation.state as { prediction?: PredictionResponse })?.prediction || null
  );
  const [loading, setLoading] = useState(!prediction);

  useEffect(() => {
    if (!prediction) {
      // Attempt to load latest from prediction history
      apiService
        .getPredictionHistory()
        .then((history) => {
          if (history && history.length > 0) {
            setPrediction(history[0]);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [prediction]);

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono">Retrieving risk assessment payload...</p>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center max-w-lg mx-auto space-y-4">
        <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto" />
        <h2 className="text-base font-bold text-white">No Prediction Result Available</h2>
        <p className="text-xs text-slate-400">
          Run a risk assessment from the prediction form or select a catchment station from the dashboard.
        </p>
        <Link
          to="/predict"
          className="inline-block px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold"
        >
          Go to Risk Prediction Form
        </Link>
      </div>
    );
  }

  const { location, risk_level, risk_index, model_probability, environmental_summary, meta, timestamp } =
    prediction;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-900 border border-slate-800 rounded hover:bg-slate-800 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Main Result Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        {/* Banner */}
        <div className="p-6 md:p-8 bg-slate-950/90 border-b border-slate-800/90 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span>PS 26192 ASSESSMENT</span>
              <span>·</span>
              <span>ID: {prediction.prediction_id}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
              Flash Flood Risk Assessment Report
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {location.name || `${location.district}, ${location.state}`}
              </span>
              <span>·</span>
              <span>
                {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-mono block">ASSESSMENT TIME</span>
            <div className="text-xs font-mono text-slate-300 flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {new Date(timestamp).toLocaleDateString([], {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}{' '}
                {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Triple Primary Metrics: Risk Level, Risk Index, Model Probability */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 p-6 bg-slate-900/60">
          {/* 1. Risk Level */}
          <div className="p-4 flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-400">Risk Level</span>
            <div className="my-3">
              <RiskBadge level={risk_level} size="lg" />
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {risk_level === 'VERY HIGH'
                ? 'Severe knickpoint overflow danger'
                : risk_level === 'HIGH'
                ? 'High runoff concentration expected'
                : risk_level === 'MODERATE'
                ? 'Stream flow surge watch advised'
                : 'Runoff absorption capacity nominal'}
            </span>
          </div>

          {/* 2. Risk Index */}
          <div className="p-4 flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-400">Risk Index</span>
            <div className="my-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold font-mono text-white tabular-nums">
                {risk_index.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-slate-500">/ 100.0</span>
            </div>
            <span className="text-[11px] text-cyan-400 font-mono">
              Derived from: Probability × 100
            </span>
          </div>

          {/* 3. Model Probability */}
          <div className="p-4 flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-400">Model Probability</span>
            <div className="my-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold font-mono text-cyan-300 tabular-nums">
                {model_probability.toFixed(3)}
              </span>
              <span className="text-xs font-mono text-slate-500">P(Proxy = 1)</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Unmodified Random Forest probability
            </span>
          </div>
        </div>

        {/* Environmental Context & Drivers */}
        <div className="p-6 md:p-8 space-y-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
              Environmental Context & Watershed Physics
            </h3>
            <span className="text-xs font-mono text-slate-500">Multi-Source Verification</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-950/70 rounded border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                <span>Rainfall 24H (1D)</span>
              </div>
              <div className="text-base font-bold text-white">
                {environmental_summary.rainfall_1d_mm} mm
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                3D: {environmental_summary.rainfall_3d_mm} mm · 7D: {environmental_summary.rainfall_7d_mm} mm
              </div>
            </div>

            <div className="p-3 bg-slate-950/70 rounded border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                <Droplet className="w-3.5 h-3.5 text-blue-400" />
                <span>Soil Moisture</span>
              </div>
              <div className="text-base font-bold text-white">
                {(environmental_summary.soil_moisture * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Top-Layer GLDAS Index</div>
            </div>

            <div className="p-3 bg-slate-950/70 rounded border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                <Mountain className="w-3.5 h-3.5 text-emerald-400" />
                <span>Elevation & Slope</span>
              </div>
              <div className="text-base font-bold text-white">
                {environmental_summary.elevation_m}m · {environmental_summary.slope_deg}°
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">SRTM 30m Hydro-DEM</div>
            </div>

            <div className="p-3 bg-slate-950/70 rounded border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                <Waves className="w-3.5 h-3.5 text-sky-400" />
                <span>Nearest River</span>
              </div>
              <div className="text-base font-bold text-cyan-300 truncate">
                {environmental_summary.nearest_river}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Main Drainage Vector</div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/50 rounded border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-medium">Land Cover Category:</span>
              <span className="text-slate-200">{environmental_summary.land_cover}</span>
            </div>
            <div className="font-mono text-slate-500 text-[11px]">
              Pipeline: {meta.pipeline}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Source of Truth: FastAPI Machine Learning Service (`POST /api/v1/predict`)
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/predict"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold transition-colors"
            >
              Test Another Catchment
            </Link>
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold transition-colors"
            >
              Return to Live Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
