import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { EnvironmentalFeatures } from '../../types';

interface TrendsChartsProps {
  features: EnvironmentalFeatures;
}

export const TrendsCharts: React.FC<TrendsChartsProps> = ({ features }) => {
  // Antecedent precipitation window series
  const rainfallSeries = [
    { window: '30-15D', rainfall: Math.max(0, features.rain_30d_mm - features.rain_15d_mm), cumulative: features.rain_30d_mm },
    { window: '15-7D', rainfall: Math.max(0, features.rain_15d_mm - features.rain_7d_mm), cumulative: features.rain_15d_mm },
    { window: '7-3D', rainfall: Math.max(0, features.rain_7d_mm - features.rain_3d_mm), cumulative: features.rain_7d_mm },
    { window: '3-1D', rainfall: Math.max(0, features.rain_3d_mm - features.rain_1d_mm), cumulative: features.rain_3d_mm },
    { window: '24h (1D)', rainfall: features.rain_1d_mm, cumulative: features.rain_1d_mm },
  ];

  // Soil moisture distribution benchmark
  const soilData = [
    { stage: 'Hist Min', value: +(features.hist_soil_min * 100).toFixed(1) },
    { stage: 'Hist Mean', value: +(features.hist_soil_mean * 100).toFixed(1) },
    { stage: 'Current Top GWET', value: +(features.soil_moisture_gwet_top * 100).toFixed(1) },
    { stage: 'Hist Max', value: +(features.hist_soil_max * 100).toFixed(1) },
  ];

  // Catchment environmental vulnerability indicators (normalized 0 - 100)
  const vulnerabilityData = [
    {
      factor: 'Slope Steepness',
      score: Math.min(100, Math.round((features.slope_deg / 40) * 100)),
      baseline: 50,
    },
    {
      factor: 'Soil Saturation',
      score: Math.min(100, Math.round(features.soil_moisture_gwet_top * 100)),
      baseline: 50,
    },
    {
      factor: 'Rainfall Intensity',
      score: Math.min(100, Math.round((features.rain_1d_mm / 120) * 100)),
      baseline: 50,
    },
    {
      factor: 'Catchment Load (7D)',
      score: Math.min(100, Math.round((features.rain_7d_mm / 250) * 100)),
      baseline: 50,
    },
    {
      factor: 'Curvature Convergence',
      score: Math.min(100, Math.round(Math.max(0, features.curvature_dem + 0.05) * 1000)),
      baseline: 50,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Rainfall Trend Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase font-mono">
              Rainfall Trend & Antecedent Build-Up
            </h4>
            <span className="text-[11px] text-slate-400">IMD Gridded Rainfall Windows (mm)</span>
          </div>
          <span className="text-xs font-mono text-cyan-400 font-semibold tabular-nums">
            {features.rain_30d_mm.toFixed(1)} mm total
          </span>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rainfallSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="window" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }}
                itemStyle={{ color: '#38bdf8' }}
              />
              <Area
                type="monotone"
                dataKey="rainfall"
                name="Incremental Rainfall (mm)"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#rainGradient)"
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                name="Cumulative (mm)"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Soil Moisture Benchmark Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase font-mono">
              Soil Moisture Saturation (NASA GLDAS)
            </h4>
            <span className="text-[11px] text-slate-400">Top-Layer Volumetric Wetness vs Baseline</span>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-semibold tabular-nums">
            {(features.soil_moisture_gwet_top * 100).toFixed(1)}% Current
          </span>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={soilData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="stage" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Bar dataKey="value" name="Wetness (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Catchment Vulnerability Radar/Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 lg:col-span-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase font-mono">
              Catchment Environmental Indicators
            </h4>
            <span className="text-[11px] text-slate-400">
              Normalized flash-flood vulnerability drivers across terrain & meteorology
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">Basin: {features.nearest_river_name}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          {vulnerabilityData.map((item, idx) => (
            <div key={idx} className="bg-slate-950/60 p-3 rounded border border-slate-800/80">
              <div className="text-[11px] text-slate-400 mb-1">{item.factor}</div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-lg font-bold font-mono text-slate-100 tabular-nums">
                  {item.score}
                </span>
                <span className="text-[10px] font-mono text-slate-500">/ 100</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.score > 75
                      ? 'bg-rose-500'
                      : item.score > 50
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, item.score)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
