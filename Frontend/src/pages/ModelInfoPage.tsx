import React from 'react';
import {
  Cpu,
  AlertTriangle,
  Layers,
  ShieldAlert,
  Database,
  CheckCircle2,
  Lock,
  Code2,
  FileCheck,
} from 'lucide-react';
import { MODEL_METRICS } from '../constants/modelInfo';
import { FORBIDDEN_MODEL_INPUTS } from '../types';

export const ModelInfoPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <span>MACHINE LEARNING ENGINE & PIPELINE SPECIFICATION</span>
          <span>·</span>
          <span>PS 26192</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
          Model Architecture & Evaluation Benchmark
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Detailed technical documentation of the Random Forest Classifier, ColumnTransformer
          preprocessing pipeline, runtime feature contract, and proxy benchmark evaluation.
        </p>
      </div>

      {/* Mandatory Scientific Explanation Box (Requirement 18) */}
      <div className="bg-amber-950/40 border border-amber-800/80 rounded-lg p-5 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h2 className="text-xs font-bold text-amber-200 uppercase font-mono tracking-wider">
            Important Scientific & Operational Clarification
          </h2>
          <p className="text-xs text-amber-100/90 leading-relaxed">
            "{MODEL_METRICS.disclaimer}"
          </p>
          <p className="text-[11px] text-amber-300/80 pt-1 font-mono">
            Ground-truth caveat: The model predicts a multi-source proxy index (historical proximity to
            drainage knickpoint surge events) rather than field-instrumented water height sensors.
          </p>
        </div>
      </div>

      {/* Primary Specs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Architecture</span>
          </div>
          <div className="text-base font-bold text-white font-mono">{MODEL_METRICS.model_name}</div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">flash_flood_model.joblib</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Preprocessing</span>
          </div>
          <div className="text-base font-bold text-white font-mono">{MODEL_METRICS.pipeline}</div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">preprocessing_pipeline.joblib</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <FileCheck className="w-4 h-4 text-blue-400" />
            <span>Runtime Features</span>
          </div>
          <div className="text-base font-bold text-white font-mono">
            {MODEL_METRICS.features_count} Verified Features
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">feature_columns.json</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            <span>Target Proxy</span>
          </div>
          <div className="text-base font-bold text-white font-mono">Binary Proxy Label</div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">P(Flash Flood Proxy)</div>
        </div>
      </div>

      {/* Model Benchmark Metrics */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
              Supplied Evaluation Metrics (Historical Proxy Test Set)
            </h2>
            <p className="text-xs text-slate-400">
              Evaluated on the team's multi-source proxy test benchmark
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400">Strict Holdout Split</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-slate-950/80 p-3 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-500 font-mono block">ACCURACY</span>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
              {(MODEL_METRICS.metrics.accuracy * 100).toFixed(4)}%
            </div>
            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">0.999865</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-500 font-mono block">PRECISION</span>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
              {(MODEL_METRICS.metrics.precision * 100).toFixed(4)}%
            </div>
            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">0.999639</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-500 font-mono block">RECALL</span>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
              {(MODEL_METRICS.metrics.recall * 100).toFixed(4)}%
            </div>
            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">0.999819</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-500 font-mono block">F1-SCORE</span>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
              {(MODEL_METRICS.metrics.f1_score * 100).toFixed(4)}%
            </div>
            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">0.999729</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-500 font-mono block">ROC-AUC</span>
            <div className="text-lg font-bold font-mono text-cyan-400 mt-1">
              {MODEL_METRICS.metrics.roc_auc.toFixed(6)}
            </div>
            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">~1.000000</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-500 font-mono block">PR-AUC</span>
            <div className="text-lg font-bold font-mono text-cyan-400 mt-1">
              {MODEL_METRICS.metrics.pr_auc.toFixed(6)}
            </div>
            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">~0.999999</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-500 font-mono block">BRIER SCORE</span>
            <div className="text-lg font-bold font-mono text-purple-400 mt-1">
              {MODEL_METRICS.metrics.brier_score.toFixed(6)}
            </div>
            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">0.003819</span>
          </div>
        </div>
      </div>

      {/* Feature Breakdown by Domain */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
          Runtime Feature Domain Taxonomy (33 Total Parameters)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODEL_METRICS.feature_breakdown.map((grp, i) => (
            <div key={i} className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">{grp.group}</span>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded">
                  {grp.count} features
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {grp.items.map((feat) => (
                  <span
                    key={feat}
                    className="text-[10px] font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                  >
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FORBIDDEN MODEL INPUTS (Requirement 8) */}
      <div className="bg-rose-950/20 border border-rose-900/60 rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-rose-400" />
          <h2 className="text-xs font-bold text-rose-300 uppercase font-mono tracking-wider">
            Strict Security Enforcement: Forbidden Model Inputs (Target Leakage Fields)
          </h2>
        </div>
        <p className="text-xs text-rose-200 leading-relaxed">
          The following 12 fields are strictly excluded from prediction payloads. Both client-side
          guardrails and the FastAPI backend reject requests with HTTP 422 if any are present:
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {FORBIDDEN_MODEL_INPUTS.map((field) => (
            <span
              key={field}
              className="text-[11px] font-mono text-rose-300 bg-rose-950/80 px-2.5 py-1 rounded border border-rose-800/80"
            >
              ✕ {field}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
