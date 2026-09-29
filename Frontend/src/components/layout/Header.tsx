import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Settings, ShieldAlert, MapPin, Zap } from 'lucide-react';
import { StatusIndicator } from '../common/StatusIndicator';
import { LOCATION_PRESETS } from '../../constants/locations';

interface HeaderProps {
  selectedLocationName?: string;
  onLocationSelect?: (locationId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedLocationName = 'Ranchi Plateau (Subarnarekha Basin)',
  onLocationSelect,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filteredLocations = LOCATION_PRESETS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.features.nearest_river_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (id: string) => {
    if (onLocationSelect) {
      onLocationSelect(id);
    }
    setIsSearchOpen(false);
    setSearchQuery('');
    navigate(`/location/${id}`);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded bg-cyan-600 flex items-center justify-center text-white shadow-inner font-bold text-sm">
            <ShieldAlert className="w-5 h-5 text-cyan-200" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
              PS 26192 · Flash Flood AI
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              CodeOrbit · Amity University Jharkhand
            </span>
          </div>
        </Link>
      </div>

      {/* Zone 2: Location & Search */}
      <div className="flex items-center gap-3 max-w-md w-full mx-4">
        {/* Active Location Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/80 px-2.5 py-1.5 rounded border border-slate-700/80 truncate">
          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-slate-400 shrink-0">Station:</span>
          <span className="font-medium text-slate-200 truncate">{selectedLocationName}</span>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search hilly basin, river, district..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950/70 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-sans"
            />
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded shadow-xl py-1 z-50 max-h-60 overflow-y-auto">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => handleSelect(loc.id)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-100">{loc.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {loc.district} · River {loc.features.nearest_river_name} · Elev {loc.features.elevation_m}m
                      </div>
                    </div>
                    <span className="text-[10px] text-cyan-400 font-mono">Select →</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-slate-500">No matching stations found</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Zone 3: System Status & Primary Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <StatusIndicator />

        <Link
          to="/predict"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded transition-colors"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Run Assessment</span>
        </Link>

        <Link
          to="/settings"
          title="Backend & System Settings"
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
        >
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
};
