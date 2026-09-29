import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import { Layers, MapPin, Compass, Waves, AlertTriangle, ExternalLink, Info } from 'lucide-react';
import { LOCATION_PRESETS } from '../../constants/locations';
import { EnvironmentalFeatures, RiskLevel } from '../../types';
import { RiskBadge } from '../common/RiskBadge';

// Fix Leaflet's default icon path issues in Vite
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom pulsing risk marker icon
const createRiskIcon = (risk: RiskLevel) => {
  let color = '#10b981'; // LOW
  if (risk === 'VERY HIGH') color = '#f43f5e';
  else if (risk === 'HIGH') color = '#f59e0b';
  else if (risk === 'MODERATE') color = '#eab308';

  return L.divIcon({
    className: 'custom-risk-marker',
    html: `
      <div style="position: relative; width: 24px; height: 24px;">
        <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: ${color}; opacity: 0.3; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; border-radius: 50%; background: ${color}; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Static representation of major river drainage networks in Chota Nagpur Plateau
const RIVER_NETWORKS = [
  {
    name: 'Subarnarekha River System (Ranchi - Jamshedpur)',
    coordinates: [
      [23.38, 85.18],
      [23.35, 85.33],
      [23.4475, 85.6564],
      [23.36, 85.85],
      [22.95, 86.15],
      [22.80, 86.20],
      [22.50, 86.60],
    ] as [number, number][],
    color: '#38bdf8',
  },
  {
    name: 'Nalkari River & Gorge (Patratu)',
    coordinates: [
      [23.68, 85.22],
      [23.6338, 85.2922],
      [23.62, 85.34],
      [23.65, 85.42],
    ] as [number, number][],
    color: '#0284c7',
  },
  {
    name: 'North Koel River Headwaters (Netarhat)',
    coordinates: [
      [23.42, 84.18],
      [23.4795, 84.2678],
      [23.58, 84.22],
      [23.75, 84.15],
      [23.95, 84.05],
    ] as [number, number][],
    color: '#0ea5e9',
  },
  {
    name: 'Kanchi River Cascade (Dasham Falls)',
    coordinates: [
      [23.18, 85.25],
      [23.1418, 85.3886],
      [23.12, 85.55],
      [23.16, 85.70],
    ] as [number, number][],
    color: '#06b6d4',
  },
  {
    name: 'Barakar River (Parasnath Ridge)',
    coordinates: [
      [24.15, 85.80],
      [24.05, 86.05],
      [23.9634, 86.1311],
      [23.85, 86.45],
    ] as [number, number][],
    color: '#60a5fa',
  },
];

interface GisMapProps {
  selectedLocation: {
    name: string;
    latitude: number;
    longitude: number;
    risk_level?: RiskLevel;
    risk_index?: number;
    elevation_m?: number;
    slope_deg?: number;
    nearest_river_name?: string;
  };
  onSelectCoordinates?: (lat: number, lng: number) => void;
  heightClass?: string;
}

// Map center updater helper component
function MapCenterController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 11, { duration: 1.2 });
  }, [center, map]);
  return null;
}

// Click listener inside map
function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export const GisMap: React.FC<GisMapProps> = ({
  selectedLocation,
  onSelectCoordinates,
  heightClass = 'h-[500px]',
}) => {
  const [activeBaseLayer, setActiveBaseLayer] = useState<'osm' | 'topo'>('topo');
  const [showRivers, setShowRivers] = useState(true);
  const [showStations, setShowStations] = useState(true);
  const [showCatchmentBuffer, setShowCatchmentBuffer] = useState(true);
  const [radarStatus] = useState<'Planned'>('Planned');
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);

  const center: [number, number] = [selectedLocation.latitude, selectedLocation.longitude];

  const handleMapClick = (lat: number, lng: number) => {
    if (onSelectCoordinates) {
      onSelectCoordinates(lat, lng);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
      {/* Top Map Toolbar */}
      <div className="flex flex-wrap items-center justify-between p-3 bg-slate-950/80 border-b border-slate-800 text-xs gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">GIS Layer Controls:</span>

          {/* Base Layer Switcher */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded border border-slate-800 font-mono">
            <button
              onClick={() => setActiveBaseLayer('topo')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                activeBaseLayer === 'topo'
                  ? 'bg-cyan-950 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Topography (SRTM)
            </button>
            <button
              onClick={() => setActiveBaseLayer('osm')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                activeBaseLayer === 'osm'
                  ? 'bg-cyan-950 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              OpenStreetMap
            </button>
          </div>
        </div>

        {/* Feature Overlays */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={showRivers}
              onChange={(e) => setShowRivers(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span className="text-[11px]">Rivers & Gorges</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={showStations}
              onChange={(e) => setShowStations(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span className="text-[11px]">Preset Stations</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={showCatchmentBuffer}
              onChange={(e) => setShowCatchmentBuffer(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span className="text-[11px]">Vulnerability Buffer</span>
          </label>

          {/* Planned Doppler Radar Layer Label */}
          <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
            <span>Doppler Radar:</span>
            <span className="font-mono text-amber-400 font-semibold">Planned</span>
          </div>
        </div>
      </div>

      {/* Leaflet Container */}
      <div className={`relative w-full ${heightClass}`}>
        <MapContainer
          center={center}
          zoom={10}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <MapCenterController center={center} />
          <MapClickHandler onClick={handleMapClick} />

          {/* Base Tiles */}
          {activeBaseLayer === 'topo' ? (
            <TileLayer
              attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a>, SRTM'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              maxZoom={17}
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          )}

          {/* Fluvial River Drainage Vector Overlays */}
          {showRivers &&
            RIVER_NETWORKS.map((river, idx) => (
              <Polyline
                key={idx}
                positions={river.coordinates}
                pathOptions={{
                  color: river.color,
                  weight: 3.5,
                  opacity: 0.85,
                  dashArray: idx % 2 === 0 ? undefined : '5, 5',
                }}
              >
                <Popup>
                  <div className="p-1 text-slate-900 font-sans">
                    <div className="font-bold text-xs">{river.name}</div>
                    <div className="text-[11px] text-slate-600">
                      India WRIS Fluvial Vector Layer
                    </div>
                  </div>
                </Popup>
              </Polyline>
            ))}

          {/* Catchment Vulnerability Buffer */}
          {showCatchmentBuffer && (
            <Circle
              center={center}
              radius={4500}
              pathOptions={{
                color: selectedLocation.risk_level === 'VERY HIGH' ? '#f43f5e' : '#06b6d4',
                fillColor: selectedLocation.risk_level === 'VERY HIGH' ? '#f43f5e' : '#06b6d4',
                fillOpacity: 0.12,
                weight: 1.5,
                dashArray: '4, 4',
              }}
            />
          )}

          {/* All Preset Catchment Stations */}
          {showStations &&
            LOCATION_PRESETS.map((loc) => {
              const isSelected =
                loc.features.latitude === selectedLocation.latitude &&
                loc.features.longitude === selectedLocation.longitude;

              return (
                <Marker
                  key={loc.id}
                  position={[loc.features.latitude, loc.features.longitude]}
                  icon={createRiskIcon(loc.riskCategoryHistorical)}
                  eventHandlers={{
                    click: () => {
                      if (onSelectCoordinates) {
                        onSelectCoordinates(loc.features.latitude, loc.features.longitude);
                      }
                    },
                  }}
                >
                  <Popup>
                    <div className="p-2 text-slate-900 font-sans max-w-xs">
                      <div className="font-bold text-xs text-slate-900 mb-1">{loc.name}</div>
                      <div className="text-[11px] text-slate-600 mb-2">
                        {loc.district}, {loc.state} · Elev {loc.features.elevation_m}m · Slope {loc.features.slope_deg}°
                      </div>
                      <div className="flex items-center justify-between text-[11px] border-t pt-1.5 border-slate-200">
                        <span>River: {loc.features.nearest_river_name}</span>
                        <RiskBadge level={loc.riskCategoryHistorical} size="sm" />
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {/* Selected Location Marker with Pulse */}
          <Marker
            position={center}
            icon={createRiskIcon(selectedLocation.risk_level || 'HIGH')}
          >
            <Popup>
              <div className="p-2 text-slate-900 font-sans max-w-xs">
                <div className="font-bold text-xs text-cyan-800 uppercase tracking-wider mb-1">
                  Active Station Target
                </div>
                <div className="font-semibold text-sm mb-1">{selectedLocation.name}</div>
                <div className="text-[11px] text-slate-600 font-mono mb-2">
                  {selectedLocation.latitude.toFixed(4)}°N, {selectedLocation.longitude.toFixed(4)}°E
                </div>
                {selectedLocation.risk_level && (
                  <div className="flex items-center justify-between border-t pt-1.5 border-slate-200 text-xs">
                    <span>Assessed Risk:</span>
                    <RiskBadge level={selectedLocation.risk_level} size="sm" />
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Floating Map Legend */}
        <div className="absolute bottom-4 right-4 z-[400] bg-slate-900/95 border border-slate-800 p-2.5 rounded shadow-lg backdrop-blur text-xs font-mono max-w-xs">
          <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1.5 flex items-center justify-between">
            <span>Risk Legend</span>
            <span className="text-[9px] text-slate-500">RF Proxy</span>
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-200">Very High (75-100)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-200">High (50-74)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <span className="text-slate-200">Moderate (25-49)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-slate-200">Low (0-24)</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
              <span className="w-4 h-0.5 bg-sky-400 inline-block" />
              <span className="text-slate-300">River Vector (WRIS)</span>
            </div>
          </div>
        </div>

        {/* Floating Click Affordance Hint */}
        <div className="absolute top-4 left-4 z-[400] bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded shadow backdrop-blur text-[11px] text-slate-300 flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span>Click anywhere on the map to query coordinates & derive features</span>
        </div>
      </div>

      {/* Selected Location Bottom Information Bar */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs gap-3 font-mono">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-sans">Target:</span>
          <span className="font-semibold text-slate-200 font-sans">{selectedLocation.name}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">
            {selectedLocation.latitude.toFixed(4)}°N, {selectedLocation.longitude.toFixed(4)}°E
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          {selectedLocation.elevation_m !== undefined && (
            <div>
              <span className="text-slate-500">Elev: </span>
              <span className="text-slate-200">{selectedLocation.elevation_m}m</span>
            </div>
          )}
          {selectedLocation.slope_deg !== undefined && (
            <div>
              <span className="text-slate-500">Slope: </span>
              <span className="text-slate-200">{selectedLocation.slope_deg}°</span>
            </div>
          )}
          {selectedLocation.nearest_river_name && (
            <div>
              <span className="text-slate-500">River: </span>
              <span className="text-cyan-400">{selectedLocation.nearest_river_name}</span>
            </div>
          )}
          {selectedLocation.risk_level && (
            <RiskBadge level={selectedLocation.risk_level} size="sm" />
          )}
        </div>
      </div>
    </div>
  );
};
