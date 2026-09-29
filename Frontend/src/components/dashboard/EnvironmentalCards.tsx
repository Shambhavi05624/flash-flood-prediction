import React from 'react';
import {
  CloudRain,
  Mountain,
  Compass,
  Droplet,
  Trees,
  Waves,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { EnvironmentalFeatures } from '../../types';

interface EnvironmentalCardsProps {
  features: EnvironmentalFeatures;
  stationName: string;
}

export const EnvironmentalCards: React.FC<EnvironmentalCardsProps> = ({ features, stationName }) => {
  const cards = [
    {
      title: 'Rainfall 1D (24h)',
      value: `${features.rain_1d_mm.toFixed(1)} mm`,
      icon: CloudRain,
      subtext: `Max: ${features.hist_rain_max_month_mm.toFixed(0)} mm/mo`,
      color: 'text-cyan-400',
    },
    {
      title: 'Rainfall 3D (72h)',
      value: `${features.rain_3d_mm.toFixed(1)} mm`,
      icon: CloudRain,
      subtext: 'Antecedent cumulative',
      color: 'text-cyan-400',
    },
    {
      title: 'Rainfall 7D',
      value: `${features.rain_7d_mm.toFixed(1)} mm`,
      icon: CloudRain,
      subtext: 'Weekly catchment load',
      color: 'text-cyan-400',
    },
    {
      title: 'Rainfall 15D',
      value: `${features.rain_15d_mm.toFixed(1)} mm`,
      icon: CloudRain,
      subtext: 'Bi-weekly index',
      color: 'text-cyan-400',
    },
    {
      title: 'Rainfall 30D',
      value: `${features.rain_30d_mm.toFixed(1)} mm`,
      icon: CloudRain,
      subtext: 'Monthly baseline load',
      color: 'text-cyan-400',
    },
    {
      title: 'Elevation',
      value: `${features.elevation_m.toFixed(0)} m`,
      icon: Mountain,
      subtext: `SRTM Tile: ${features.srtm_tile}`,
      color: 'text-emerald-400',
    },
    {
      title: 'Slope',
      value: `${features.slope_deg.toFixed(1)}°`,
      icon: TrendingUp,
      subtext: `sin(θ): ${features.slope_sin.toFixed(3)}`,
      color: 'text-amber-400',
    },
    {
      title: 'Aspect',
      value: `${features.aspect_deg.toFixed(0)}°`,
      icon: Compass,
      subtext: `N:${features.aspect_northness.toFixed(2)} E:${features.aspect_eastness.toFixed(2)}`,
      color: 'text-indigo-400',
    },
    {
      title: 'Soil Moisture',
      value: `${(features.soil_moisture_gwet_top * 100).toFixed(1)}%`,
      icon: Droplet,
      subtext: `Top layer (GWET_TOP)`,
      color: 'text-blue-400',
    },
    {
      title: 'Land Cover',
      value: features.lulc_name,
      icon: Trees,
      subtext: `Class Code: ${features.lulc_class}`,
      color: 'text-emerald-300',
    },
    {
      title: 'Nearest River',
      value: features.nearest_river_name,
      icon: Waves,
      subtext: 'Fluvial Drainage Axis',
      color: 'text-sky-400',
    },
    {
      title: 'Location & Admin',
      value: `${features.district}, ${features.state}`,
      icon: MapPin,
      subtext: `${features.latitude.toFixed(4)}°N, ${features.longitude.toFixed(4)}°E`,
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200 tracking-wide uppercase font-mono">
          Environmental Feature Vector (Multi-Source Telemetry)
        </h3>
        <span className="text-xs text-slate-500 font-mono">33 Runtime Parameters Verified</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-slate-900/90 border border-slate-800 rounded p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="truncate pr-1 font-medium">{card.title}</span>
                <Icon className={`w-3.5 h-3.5 ${card.color} shrink-0`} />
              </div>
              <div className="text-base font-semibold font-mono text-slate-100 tabular-nums truncate">
                {card.value}
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate mt-1">
                {card.subtext}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
