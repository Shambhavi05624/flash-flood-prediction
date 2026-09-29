import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowRight,
  Layers,
  Activity,
  Cpu,
  Database,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Compass,
} from 'lucide-react';
import { LOCATION_PRESETS } from '../constants/locations';
import { MODEL_METRICS } from '../constants/modelInfo';
import { RiskBadge } from '../components/common/RiskBadge';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800 p-6 md:p-10 lg:p-12">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>SMART INDIA HACKATHON 2024–2026</span>
            <span>·</span>
            <span>PROBLEM STATEMENT 26192</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white text-balance leading-tight">
            Flash Flood Prediction System for Hilly Regions using Multi-Source Data
          </h1>

          <p className="text-base text-slate-300 leading-relaxed max-w-2xl">
            An operational early warning and risk intelligence engine designed for the complex, steep-sloped
            catchments of the Chota Nagpur Plateau and hilly watersheds. Powered by 33 synchronized runtime
            features across satellite remote sensing, hydro-meteorological grids, and machine learning.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors shadow-sm"
            >
              <span>Open Intelligence Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/predict"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <span>Run Risk Assessment</span>
            </Link>

            <Link
              to="/map"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <span>Live GIS Map</span>
            </Link>
          </div>
        </div>

        {/* Floating institutional badge */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">Team CodeOrbit</span>
            <span>·</span>
            <span>Team ID: 134501</span>
            <span>·</span>
            <span>Amity University Jharkhand</span>
          </div>
          <div className="font-mono text-cyan-400">
            Random Forest Engine · 33 Runtime Feature Contract
          </div>
        </div>
      </section>

      {/* 3 Core Architecture Pillars */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">
            01. End-to-End Prediction Architecture
          </h2>
          <span className="text-xs text-slate-500 font-mono">React → FastAPI → ML Pipeline</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-lg space-y-3">
            <div className="w-9 h-9 rounded bg-cyan-950 flex items-center justify-center text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Multi-Source Telemetry</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fuses NASA SRTM 30m topographic derivatives (elevation, slope sine/cosine, curvature), IMD 1d-30d
              antecedent precipitation, NASA GLDAS soil moisture, and Indian-WRIS river networks.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-lg space-y-3">
            <div className="w-9 h-9 rounded bg-emerald-950 flex items-center justify-center text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Random Forest Pipeline</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Preprocesses inputs through an scikit-learn ColumnTransformer with robust feature scaling and
              produces probability-calibrated risk classifications without target leakage.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-lg space-y-3">
            <div className="w-9 h-9 rounded bg-purple-950 flex items-center justify-center text-purple-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Actionable Early Warning</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Provides distinct Risk Level, Risk Index (0–100), and Raw Probability outputs for emergency
              personnel, district magistrates, and local disaster response teams.
            </p>
          </div>
        </div>
      </section>

      {/* Benchmark Catchment Presets */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">
            02. Benchmark Hilly Catchment Stations
          </h2>
          <Link to="/map" className="text-xs text-cyan-400 hover:underline">
            View All Stations on GIS Map →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {LOCATION_PRESETS.slice(0, 4).map((station) => (
            <div
              key={station.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-lg flex flex-col justify-between transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <RiskBadge level={station.riskCategoryHistorical} size="sm" />
                  <span className="text-[11px] font-mono text-slate-500">{station.features.srtm_tile}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-100 mb-1">{station.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">{station.description}</p>
              </div>

              <div className="border-t border-slate-800/80 pt-2.5 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>River:</span>
                  <span className="text-slate-200 font-medium">{station.features.nearest_river_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Elev / Slope:</span>
                  <span className="text-slate-200 font-mono">
                    {station.features.elevation_m}m / {station.features.slope_deg}°
                  </span>
                </div>
                <div className="pt-2">
                  <Link
                    to={`/location/${station.id}`}
                    className="block text-center w-full py-1 text-xs text-cyan-400 bg-slate-800/60 hover:bg-slate-800 rounded font-medium transition-colors"
                  >
                    Examine Telemetry & Predict →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Model Performance Verification */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide font-mono">
              Model Evaluation Benchmark (Historical Flood-Proximity Proxy)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified test set results for the trained Random Forest Classifier
            </p>
          </div>
          <Link to="/model-info" className="text-xs text-cyan-400 hover:underline">
            Detailed Model Specification →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-slate-950/70 p-3 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-500 font-mono">ACCURACY</span>
            <div className="text-sm font-bold font-mono text-emerald-400 mt-1">
              {(MODEL_METRICS.metrics.accuracy * 100).toFixed(4)}%
            </div>
          </div>
          <div className="bg-slate-950/70 p-3 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-500 font-mono">PRECISION</span>
            <div className="text-sm font-bold font-mono text-emerald-400 mt-1">
              {(MODEL_METRICS.metrics.precision * 100).toFixed(4)}%
            </div>
          </div>
          <div className="bg-slate-950/70 p-3 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-500 font-mono">RECALL</span>
            <div className="text-sm font-bold font-mono text-emerald-400 mt-1">
              {(MODEL_METRICS.metrics.recall * 100).toFixed(4)}%
            </div>
          </div>
          <div className="bg-slate-950/70 p-3 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-500 font-mono">F1-SCORE</span>
            <div className="text-sm font-bold font-mono text-emerald-400 mt-1">
              {(MODEL_METRICS.metrics.f1_score * 100).toFixed(4)}%
            </div>
          </div>
          <div className="bg-slate-950/70 p-3 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-500 font-mono">ROC-AUC</span>
            <div className="text-sm font-bold font-mono text-cyan-400 mt-1">
              {MODEL_METRICS.metrics.roc_auc.toFixed(6)}
            </div>
          </div>
          <div className="bg-slate-950/70 p-3 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-500 font-mono">PR-AUC</span>
            <div className="text-sm font-bold font-mono text-cyan-400 mt-1">
              {MODEL_METRICS.metrics.pr_auc.toFixed(6)}
            </div>
          </div>
          <div className="bg-slate-950/70 p-3 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-500 font-mono">BRIER SCORE</span>
            <div className="text-sm font-bold font-mono text-purple-400 mt-1">
              {MODEL_METRICS.metrics.brier_score.toFixed(6)}
            </div>
          </div>
        </div>

        {/* Required Scientific Explanation Box */}
        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded text-xs text-slate-400 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-300">Scientific & Operational Disclaimer: </strong>
            {MODEL_METRICS.disclaimer}
          </p>
        </div>
      </section>
    </div>
  );
};
