import React from 'react';
import { AlertCircle, Gauge, Activity, Clock } from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';
import { RiskLevel } from '../../types';

interface RiskSummaryCardsProps {
  riskLevel: RiskLevel;
  riskIndex: number;
  modelProbability: number;
  assessmentTime?: string;
  stationName: string;
}

export const RiskSummaryCards: React.FC<RiskSummaryCardsProps> = ({
  riskLevel,
  riskIndex,
  modelProbability,
  assessmentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  stationName,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Risk Level Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Flash Flood Risk Level</span>
          <AlertCircle className="w-4 h-4 text-slate-500" />
        </div>
        <div className="my-3 flex items-baseline gap-3">
          <RiskBadge level={riskLevel} size="lg" />
        </div>
        <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2.5">
          <span>Target Catchment</span>
          <span className="text-slate-300 font-medium truncate max-w-[140px]">{stationName}</span>
        </div>
      </div>

      {/* 2. Risk Index Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Risk Index (Normalized)</span>
          <Gauge className="w-4 h-4 text-cyan-500" />
        </div>
        <div className="my-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold font-mono tracking-tight text-white tabular-nums">
            {riskIndex.toFixed(1)}
          </span>
          <span className="text-xs font-mono text-slate-500">/ 100.0</span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2.5">
          <span>Backend Calculation</span>
          <span className="font-mono text-cyan-400">Probability × 100</span>
        </div>
      </div>

      {/* 3. Model Probability Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Model Probability (RF)</span>
          <Activity className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="my-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold font-mono tracking-tight text-white tabular-nums">
            {modelProbability.toFixed(3)}
          </span>
          <span className="text-xs font-mono text-slate-500">P(Proxy = 1)</span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2.5">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Assessed At</span>
          </span>
          <span className="font-mono text-slate-300">{assessmentTime}</span>
        </div>
      </div>
    </div>
  );
};
