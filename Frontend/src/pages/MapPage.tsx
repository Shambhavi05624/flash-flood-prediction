import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Layers,
  Compass,
  Zap,
  Info,
  Waves,
  Mountain,
  Droplet,
  CloudRain,
  ExternalLink,
} from 'lucide-react';
import { LOCATION_PRESETS } from '../constants/locations';
import { GisMap } from '../components/map/GisMap';
import { RiskBadge } from '../components/common/RiskBadge';
import { apiService } from '../services/api';
import { EnvironmentalFeatures, PredictionResponse } from '../types';

export const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedStation, setSelectedStation] = useState(LOCATION_PRESETS[0]);
  const [activeCoords, setActiveCoords] = useState<{ lat: number; lng: number }>({
    lat: LOCATION_PRESETS[0].features.latitude,
    lng: LOCATION_PRESETS[0].features.longitude,
  });
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleStationClick = (stationId: string) => {
    const found = LOCATION_PRESETS.find((p) => p.id === stationId);
    if (found) {
      setSelectedStation(found);
      setActiveCoords({
        lat: found.features.latitude,
        lng: found.features.longitude,
      });
      setPrediction(null);
    }
  };

  const handleCoordinatesSelected = async (lat: number, lng: number) => {
    setActiveCoords({ lat, lng });
    setIsEvaluating(true);
    try {
      // Obtain features from backend
      const res = await fetch('/api/v1/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      });
      if (res.ok) {
        const feat: EnvironmentalFeatures = await res.json();
        const pred = await apiService.predictRisk(feat);
        setPrediction(pred);
        setSelectedStation({
          id: `pt-${lat.toFixed(3)}-${lng.toFixed(3)}`,
          name: `Map Query Point (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`,
          district: feat.district,
          state: feat.state,
          description: `User-selected coordinate at elevation ${feat.elevation_m}m.`,
          terrainType: 'Catchment Interrogation Point',
          riskCategoryHistorical: pred.risk_level,
          features: feat,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>GIS SPATIAL INTELLIGENCE</span>
            <span>·</span>
            <span>CHOTA NAGPUR PLATEAU & DRAINAGE NETWORK</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Interactive Catchment & River GIS Map
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Examine topographical relief, river networks, and hydrological vulnerability. Click any point
            to interrogate 33-feature coordinates.
          </p>
        </div>

        <button
          onClick={() => navigate(`/predict?stationId=${selectedStation.id}`)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold transition-colors"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Assess This Catchment</span>
        </button>
      </div>

      {/* Main Map & Info Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left GIS Map Viewport (3 cols) */}
        <div className="lg:col-span-3">
          <GisMap
            selectedLocation={{
              name: selectedStation.name,
              latitude: activeCoords.lat,
              longitude: activeCoords.lng,
              risk_level: prediction?.risk_level || selectedStation.riskCategoryHistorical,
              risk_index: prediction?.risk_index,
              elevation_m: selectedStation.features.elevation_m,
              slope_deg: selectedStation.features.slope_deg,
              nearest_river_name: selectedStation.features.nearest_river_name,
            }}
            onSelectCoordinates={handleCoordinatesSelected}
            heightClass="h-[600px]"
          />
        </div>

        {/* Right Station Inspector Panel (1 col) */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-200 uppercase font-mono">
                Catchment Station Details
              </span>
              <RiskBadge
                level={prediction?.risk_level || selectedStation.riskCategoryHistorical}
                size="sm"
              />
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">{selectedStation.name}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {selectedStation.description}
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="space-y-2 text-xs font-mono border-t border-slate-800/80 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Mountain className="w-3 h-3 text-emerald-400" />
                  <span>Elevation:</span>
                </span>
                <span className="text-slate-100 font-bold">{selectedStation.features.elevation_m} m</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Compass className="w-3 h-3 text-amber-400" />
                  <span>Slope Angle:</span>
                </span>
                <span className="text-slate-100 font-bold">{selectedStation.features.slope_deg}°</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Waves className="w-3 h-3 text-sky-400" />
                  <span>Drainage River:</span>
                </span>
                <span className="text-cyan-400 font-bold">
                  {selectedStation.features.nearest_river_name}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <CloudRain className="w-3 h-3 text-cyan-400" />
                  <span>Rainfall 24h:</span>
                </span>
                <span className="text-slate-100 font-bold">{selectedStation.features.rain_1d_mm} mm</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Droplet className="w-3 h-3 text-blue-400" />
                  <span>Soil Moisture:</span>
                </span>
                <span className="text-slate-100 font-bold">
                  {(selectedStation.features.soil_moisture_gwet_top * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Quick Station Select List */}
            <div className="border-t border-slate-800/80 pt-3 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Quick Jump to Stations:
              </span>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {LOCATION_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleStationClick(p.id)}
                    className={`w-full text-left p-2 rounded text-xs transition-colors flex items-center justify-between ${
                      p.id === selectedStation.id
                        ? 'bg-cyan-950 text-cyan-200 border border-cyan-800'
                        : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="truncate pr-1">{p.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {p.features.elevation_m}m
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
