import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  Layers,
  Radio,
  Clock,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { DataSourceInfo, DataSourceStatus } from '../types';
import { apiService } from '../services/api';

const getStatusBadge = (status: DataSourceStatus) => {
  switch (status) {
    case 'LIVE':
      return 'bg-emerald-950/80 text-emerald-300 border-emerald-700 animate-pulse';
    case 'CONNECTED':
      return 'bg-cyan-950/80 text-cyan-300 border-cyan-700';
    case 'PROCESSED':
      return 'bg-indigo-950/80 text-indigo-300 border-indigo-700';
    case 'HISTORICAL':
      return 'bg-slate-800 text-slate-300 border-slate-700';
    case 'PLANNED':
      return 'bg-amber-950/80 text-amber-300 border-amber-700';
    case 'UNAVAILABLE':
    default:
      return 'bg-rose-950/80 text-rose-300 border-rose-700';
  }
};

export const DataSourcesPage: React.FC = () => {
  const [sources, setSources] = useState<DataSourceInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSources = async () => {
    setLoading(true);
    try {
      const data = await apiService.getDataSources();
      setSources(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>DATA PROVENANCE & HARMONIZATION</span>
            <span>·</span>
            <span>INTELLIGENCE INGESTION AUDIT</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Multi-Source Data Pipelines & Ingestion Status
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Status of satellite telemetry, hydrological gauging stations, and topographic rasters feeding
            the PS 26192 prediction engine.
          </p>
        </div>

        <button
          onClick={fetchSources}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Feeds</span>
        </button>
      </div>

      {/* Status Legend Box (Requirement 19) */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-xs font-mono">
        <span className="text-slate-400 font-sans font-medium block mb-2">
          Telemetry Status Integrity Standard:
        </span>
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded border bg-emerald-950/80 text-emerald-300 border-emerald-700 font-bold">
              LIVE
            </span>
            <span className="text-slate-400">Confirmed real-time streaming link</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded border bg-cyan-950/80 text-cyan-300 border-cyan-700 font-bold">
              CONNECTED
            </span>
            <span className="text-slate-400">API active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded border bg-indigo-950/80 text-indigo-300 border-indigo-700 font-bold">
              PROCESSED
            </span>
            <span className="text-slate-400">Standardized raster grid</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded border bg-slate-800 text-slate-300 border-slate-700 font-bold">
              HISTORICAL
            </span>
            <span className="text-slate-400">Calibrated benchmark archive</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded border bg-amber-950/80 text-amber-300 border-amber-700 font-bold">
              PLANNED
            </span>
            <span className="text-slate-400">Phase II development roadmap</span>
          </div>
        </div>
      </div>

      {/* Grid of Data Source Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((src) => (
          <div
            key={src.id}
            className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between hover:border-slate-700 transition-colors space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{src.name}</h3>
                  <div className="text-xs text-slate-400">{src.organization}</div>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border ${getStatusBadge(
                    src.status
                  )}`}
                >
                  {src.status}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {src.description}
              </p>
            </div>

            <div className="border-t border-slate-800/80 pt-3 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Data Type:</span>
                <span className="text-slate-200">{src.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Spatial Coverage:</span>
                <span className="text-slate-200 truncate max-w-[240px]">{src.coverage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Update Cadence:</span>
                <span className="text-slate-200">{src.frequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Synced:</span>
                <span className="text-cyan-300 font-semibold">{src.lastUpdated}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800/50 pt-1 text-[11px]">
                <span className="text-slate-500">Protocol:</span>
                <span className="text-slate-400 truncate max-w-[240px]">
                  {src.endpointOrMethod}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
