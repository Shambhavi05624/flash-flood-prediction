import React from 'react';
import { RefreshCw, Server, AlertCircle } from 'lucide-react';
import { useBackendHealth } from '../../hooks/useBackendHealth';

export const StatusIndicator: React.FC = () => {
  const { isConnected, isModelLoaded, isChecking, refreshHealth, error } = useBackendHealth();

  return (
    <div className="flex items-center gap-3">
      {isChecking ? (
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
          <span>CHECKING</span>
        </div>
      ) : isConnected && isModelLoaded ? (
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">CONNECTED</span>
          </div>
          <span className="text-slate-600 font-sans">/</span>
          <div className="flex items-center gap-1.5 text-cyan-300">
            <Server className="w-3 h-3 text-cyan-400" />
            <span>MODEL LOADED</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/60">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-semibold">BACKEND UNAVAILABLE</span>
          </div>
          <button
            onClick={() => refreshHealth()}
            title="Retry backend health check"
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
