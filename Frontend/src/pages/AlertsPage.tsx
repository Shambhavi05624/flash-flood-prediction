import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Radio,
  Send,
  RefreshCw,
  Waves,
  MapPin,
} from 'lucide-react';
import { AlertItem } from '../types';
import { apiService } from '../services/api';
import { RiskBadge } from '../components/common/RiskBadge';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getAlerts();
      setAlerts(data);
    } catch (err) {
      setError('Unable to load warning alerts from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleStatusChange = (alertId: string, nextStatus: 'Active' | 'Acknowledged' | 'Resolved') => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: nextStatus } : a))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>DISASTER MANAGEMENT & CIVIL PROTECTION</span>
            <span>·</span>
            <span>EARLY WARNING DIRECTORY</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Catchment Alert & Warning Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Live flash flood advisories generated from multi-source hydrological models and telemetry thresholds.
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Advisories</span>
        </button>
      </div>

      {/* Notification Infrastructure Status Banner (Requirement 17) */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400" />
          <span>Automated Emergency SMS & CAP Dissemination Gateway:</span>
          <span className="font-mono text-amber-400 font-semibold">
            Notification integration: Planned
          </span>
        </div>
        <span className="text-[11px] text-slate-500">
          Scheduled for Phase II deployment with State Disaster Management Authority (SDMA)
        </span>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-rose-950/70 border border-rose-800 rounded-lg p-4 text-xs text-rose-200">
          {error}
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg p-5 h-28 animate-pulse" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center text-xs text-slate-500">
            No active flash flood advisories at this time. Catchment baselines are nominal.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-slate-900 border rounded-lg p-5 transition-colors ${
                alert.status === 'Active'
                  ? 'border-rose-900/80 bg-rose-950/10'
                  : alert.status === 'Acknowledged'
                  ? 'border-amber-900/60 bg-amber-950/10'
                  : 'border-slate-800 opacity-60'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">{alert.id}</span>
                    <span className="text-slate-600">·</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : alert.severity === 'HIGH'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-yellow-950 text-yellow-300 border border-yellow-800'
                      }`}
                    >
                      SEVERITY: {alert.severity}
                    </span>
                    <RiskBadge level={alert.risk_level} size="sm" />
                  </div>

                  <h3 className="text-base font-bold text-white pt-1">{alert.location}</h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono pt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {alert.district}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Waves className="w-3 h-3 text-sky-400" />
                      River: {alert.nearest_river}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {new Date(alert.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-slate-500 text-[11px]">STATUS:</span>
                  <div className="bg-slate-950 p-0.5 rounded border border-slate-800 flex items-center">
                    {(['Active', 'Acknowledged', 'Resolved'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(alert.id, st)}
                        className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                          alert.status === st
                            ? st === 'Active'
                              ? 'bg-rose-950 text-rose-200 font-bold border border-rose-800'
                              : st === 'Acknowledged'
                              ? 'bg-amber-950 text-amber-200 font-bold border border-amber-800'
                              : 'bg-emerald-950 text-emerald-200 font-bold border border-emerald-800'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trigger Reason */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200">Hydrological Trigger: </strong>
                  {alert.trigger_reason}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
