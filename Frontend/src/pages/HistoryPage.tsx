import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ListTree,
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import { PredictionResponse, RiskLevel } from '../types';
import { apiService } from '../services/api';
import { RiskBadge } from '../components/common/RiskBadge';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState<PredictionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'timestamp' | 'risk_index'>('timestamp');
  const [sortAsc, setSortAsc] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const data = await apiService.getPredictionHistory();
      setPredictions(data);
    } catch (err) {
      console.error('Failed to load predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const filtered = predictions
    .filter((p) => {
      const locStr = `${p.location.name || ''} ${p.location.district} ${p.location.state} ${
        p.location.nearest_river_name
      }`.toLowerCase();
      const matchesSearch = locStr.includes(searchQuery.toLowerCase());
      const matchesRisk = riskFilter === 'ALL' || p.risk_level === riskFilter;
      return matchesSearch && matchesRisk;
    })
    .sort((a, b) => {
      if (sortField === 'timestamp') {
        const tA = new Date(a.timestamp).getTime();
        const tB = new Date(b.timestamp).getTime();
        return sortAsc ? tA - tB : tB - tA;
      } else {
        return sortAsc ? a.risk_index - b.risk_index : b.risk_index - a.risk_index;
      }
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>SESSION & PERSISTED INFERENCE AUDIT</span>
            <span>·</span>
            <span>PREDICTION AUDIT LOG</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Prediction History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Log of runtime inferences executed via FastAPI `/api/v1/predict` endpoint.
          </p>
        </div>

        <button
          onClick={fetchPredictions}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Reload History</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search location, district, river..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Filter Risk:</span>
            <select
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs"
            >
              <option value="ALL">All Levels</option>
              <option value="VERY HIGH">VERY HIGH</option>
              <option value="HIGH">HIGH</option>
              <option value="MODERATE">MODERATE</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Sort:</span>
            <button
              onClick={() => {
                if (sortField === 'timestamp') {
                  setSortAsc(!sortAsc);
                } else {
                  setSortField('timestamp');
                  setSortAsc(false);
                }
              }}
              className={`px-2 py-1 rounded border text-xs flex items-center gap-1 ${
                sortField === 'timestamp'
                  ? 'bg-slate-800 border-slate-700 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <span>Date</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                if (sortField === 'risk_index') {
                  setSortAsc(!sortAsc);
                } else {
                  setSortField('risk_index');
                  setSortAsc(false);
                }
              }}
              className={`px-2 py-1 rounded border text-xs flex items-center gap-1 ${
                sortField === 'risk_index'
                  ? 'bg-slate-800 border-slate-700 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <span>Risk</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 font-mono">
            Loading inference records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No prediction logs found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Date / Time</th>
                  <th className="py-2.5 px-4">Location</th>
                  <th className="py-2.5 px-4">District & State</th>
                  <th className="py-2.5 px-4">Risk Level</th>
                  <th className="py-2.5 px-4">Risk Index</th>
                  <th className="py-2.5 px-4">Model Probability</th>
                  <th className="py-2.5 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginated.map((item) => (
                  <tr key={item.prediction_id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 text-slate-300">
                      <div>
                        {new Date(item.timestamp).toLocaleDateString([], {
                          month: 'short',
                          day: '2-digit',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    <td className="py-2.5 px-4 font-semibold text-white">
                      {item.location.name || `${item.location.latitude.toFixed(3)}°N, ${item.location.longitude.toFixed(3)}°E`}
                      <div className="text-[10px] text-cyan-400">
                        River: {item.location.nearest_river_name}
                      </div>
                    </td>

                    <td className="py-2.5 px-4 text-slate-400">
                      {item.location.district}, {item.location.state}
                    </td>

                    <td className="py-2.5 px-4">
                      <RiskBadge level={item.risk_level} size="sm" />
                    </td>

                    <td className="py-2.5 px-4 font-bold text-white tabular-nums">
                      {item.risk_index.toFixed(1)}
                    </td>

                    <td className="py-2.5 px-4 text-cyan-300 font-bold tabular-nums">
                      {item.model_probability.toFixed(3)}
                    </td>

                    <td className="py-2.5 px-4">
                      <button
                        onClick={() => navigate('/result', { state: { prediction: item } })}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">
              Page {currentPage} of {totalPages} ({filtered.length} total)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
