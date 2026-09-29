import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sliders,
  Terminal,
  Zap,
} from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl, apiService } from '../services/api';
import { useBackendHealth } from '../hooks/useBackendHealth';

export const SettingsPage: React.FC = () => {
  const { isConnected, isModelLoaded, refreshHealth, lastChecked } = useBackendHealth();

  const [inputUrl, setInputUrl] = useState(getApiBaseUrl() || '');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    latency?: number;
    status?: string;
    model?: string;
    error?: string;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Simulation state for testing Requirement 20 & 21
  const [isSimulatingOutage, setIsSimulatingOutage] = useState(false);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setApiBaseUrl(inputUrl);
    setSaveMessage('Backend URL updated successfully.');
    setTimeout(() => setSaveMessage(null), 3000);
    refreshHealth();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const start = performance.now();
    try {
      const res = await apiService.checkHealth();
      const end = performance.now();
      setTestResult({
        latency: Math.round(end - start),
        status: res.status,
        model: res.model,
      });
    } catch (err: any) {
      setTestResult({
        error: err.message || 'Connection failed',
      });
    } finally {
      setIsTesting(false);
      refreshHealth();
    }
  };

  const handleToggleOutage = async (available: boolean) => {
    setIsSimulatingOutage(!available);
    try {
      await fetch('/api/v1/test/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backendAvailable: available, modelLoaded: available }),
      });
      refreshHealth();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <span>FASTAPI INTEGRATION & RUNTIME CONFIGURATION</span>
          <span>·</span>
          <span>ENVIRONMENT ADAPTATION</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
          System & Backend Integration Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure external FastAPI backend endpoints, verify `/health` contracts, and test error-handling
          under model unavailability.
        </p>
      </div>

      {/* Backend URL Configuration */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">FastAPI Base URL (`VITE_API_BASE_URL`)</h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500">HTTP / HTTPS</span>
        </div>

        <form onSubmit={handleSaveUrl} className="space-y-3">
          <div>
            <label className="text-xs text-slate-300 block mb-1">
              Backend Endpoint URL (leave blank for local integrated engine):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="e.g. http://localhost:8000"
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold border border-slate-700 transition-colors"
              >
                Save URL
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Default is empty string (routes through local fullstack dev server at port 3000). For local
              FastAPI teammate instances, set to <code className="text-cyan-400">http://localhost:8000</code>.
            </p>
          </div>

          {saveMessage && (
            <div className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{saveMessage}</span>
            </div>
          )}
        </form>

        {/* Quick Connection Diagnostics */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400">Backend Status:</span>
            {isConnected && isModelLoaded ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CONNECTED (Model Loaded)</span>
              </span>
            ) : (
              <span className="text-rose-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>UNAVAILABLE</span>
              </span>
            )}
          </div>

          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800 rounded transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>Test GET /health</span>
          </button>
        </div>

        {/* Test Result Box */}
        {testResult && (
          <div className="p-3 bg-slate-950 rounded border border-slate-800 font-mono text-xs space-y-1">
            {testResult.error ? (
              <div className="text-rose-400">Error: {testResult.error}</div>
            ) : (
              <>
                <div className="text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    Endpoint responsive (Latency: {testResult.latency} ms)
                  </span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  Response: status = "{testResult.status}", model = "{testResult.model}"
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Backend & Model Failure Simulation Controls (Requirements 20 & 21) */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-white">
              Fault Injection & Unavailability Testing
            </h2>
          </div>
          <span className="text-[11px] font-mono text-amber-400 font-semibold">Test Mode</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Verify system resilience: Requirement 21 requires that when the backend or model fails, the
          frontend displays <strong>SYSTEM STATUS: Unavailable</strong> and explains{' '}
          <em>"The prediction service is currently unavailable. Please try again later."</em> without ever
          generating a fake prediction.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => handleToggleOutage(false)}
            className="px-3 py-1.5 bg-rose-950/70 hover:bg-rose-900 text-rose-200 border border-rose-800 rounded text-xs font-mono font-semibold transition-colors"
          >
            Simulate Backend Failure (Trigger 503 Outage)
          </button>

          <button
            onClick={() => handleToggleOutage(true)}
            className="px-3 py-1.5 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-200 border border-emerald-800 rounded text-xs font-mono font-semibold transition-colors"
          >
            Restore Backend & Model (Status 200 OK)
          </button>
        </div>
      </div>

      {/* Project & Team Metadata */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3 text-xs">
        <h2 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
          Smart India Hackathon Project Identification
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-400 font-mono">
          <div>
            <span className="text-slate-500 block">PROBLEM STATEMENT</span>
            <span className="text-slate-200">PS 26192 (Flash Flood Prediction for Hilly Regions)</span>
          </div>
          <div>
            <span className="text-slate-500 block">TEAM</span>
            <span className="text-slate-200">CodeOrbit (Team ID: 134501)</span>
          </div>
          <div>
            <span className="text-slate-500 block">INSTITUTION</span>
            <span className="text-slate-200">Amity University Jharkhand</span>
          </div>
          <div>
            <span className="text-slate-500 block">TARGET REGION</span>
            <span className="text-slate-200">Chota Nagpur Plateau & Hilly Drainage Basins</span>
          </div>
        </div>
      </div>
    </div>
  );
};
