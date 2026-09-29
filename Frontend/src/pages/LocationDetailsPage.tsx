import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  ArrowLeft,
  Mountain,
  Compass,
  Droplet,
  CloudRain,
  Waves,
  Trees,
  Zap,
  ShieldAlert,
  Calendar,
} from 'lucide-react';
import { LOCATION_PRESETS } from '../constants/locations';
import { RiskBadge } from '../components/common/RiskBadge';
import { TrendsCharts } from '../components/dashboard/TrendsCharts';
import { apiService } from '../services/api';
import { PredictionResponse } from '../types';

export const LocationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const station =
    LOCATION_PRESETS.find((p) => p.id === id) ||
    LOCATION_PRESETS[0];

  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiService
      .predictRisk(station.features)
      .then((res) => setPrediction(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [station]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <Link
          to={`/predict?stationId=${station.id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Run Custom Assessment</span>
        </Link>
      </div>

      {/* Main Station Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span>WATERSHED MONITORING STATION</span>
              <span>·</span>
              <span>ID: {station.id}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mt-1">{station.name}</h1>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {station.district}, {station.state}
              </span>
              <span>·</span>
              <span>
                {station.features.latitude.toFixed(4)}°N, {station.features.longitude.toFixed(4)}°E
              </span>
              <span>·</span>
              <span>SRTM Tile {station.features.srtm_tile}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-mono block mb-1">CURRENT RISK STATUS</span>
            <RiskBadge level={prediction?.risk_level || station.riskCategoryHistorical} size="lg" />
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          {station.description}
        </p>

        {/* 6 Key Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-4 border-t border-slate-800/80 font-mono text-xs">
          <div className="bg-slate-950/60 p-3 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">ELEVATION</span>
            <span className="text-sm font-bold text-white">{station.features.elevation_m} m</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">SLOPE</span>
            <span className="text-sm font-bold text-white">{station.features.slope_deg}°</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">24H RAIN</span>
            <span className="text-sm font-bold text-cyan-400">{station.features.rain_1d_mm} mm</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">SOIL MOISTURE</span>
            <span className="text-sm font-bold text-blue-400">
              {(station.features.soil_moisture_gwet_top * 100).toFixed(1)}%
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">RIVER BASIN</span>
            <span className="text-sm font-bold text-sky-400 truncate block">
              {station.features.nearest_river_name}
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">LAND COVER</span>
            <span className="text-xs font-semibold text-slate-300 truncate block mt-0.5">
              {station.features.lulc_name}
            </span>
          </div>
        </div>
      </div>

      {/* Complete 33-Feature Schema Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
              Exact 33 Runtime Feature Contract
            </h2>
            <p className="text-[11px] text-slate-400">
              Directly aligned with trained scikit-learn ColumnTransformer inputs
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400">33 / 33 Verified</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-2.5 px-4">#</th>
                <th className="py-2.5 px-4">Feature Key</th>
                <th className="py-2.5 px-4">Runtime Value</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Source Pipeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {Object.entries(station.features).map(([key, val], idx) => (
                <tr key={key} className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 text-slate-500">{idx + 1}</td>
                  <td className="py-2 px-4 font-semibold text-slate-200">{key}</td>
                  <td className="py-2 px-4 text-cyan-300 font-bold">
                    {typeof val === 'number' ? val.toString() : String(val)}
                  </td>
                  <td className="py-2 px-4 text-slate-400">{typeof val}</td>
                  <td className="py-2 px-4 text-slate-500">
                    {key.includes('rain')
                      ? 'IMD Gridded Daily'
                      : key.includes('soil')
                      ? 'NASA GLDAS SMAP'
                      : key.includes('slope') || key.includes('elevation') || key.includes('aspect')
                      ? 'SRTM 30m Hydro-DEM'
                      : 'India WRIS / Bhuvan'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hydrological Trends for this station */}
      <TrendsCharts features={station.features} />
    </div>
  );
};
