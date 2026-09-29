import React, { useState, useEffect } from 'react';
import {
  History,
  Calendar,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { HistoricalRecord, RiskLevel } from '../types';
import { apiService, ApiError } from '../services/api';
import { RiskBadge } from '../components/common/RiskBadge';

export const HistoricalPage: React.FC = () => {
  const [records, setRecords] = useState<HistoricalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getHistoricalData();
      setRecords(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('No historical data available.');
      }
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = selectedRisk === 'ALL' || r.risk_level === selectedRisk;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>HISTORICAL ARCHIVE & VALIDATION</span>
            <span>·</span>
            <span>GROUND-TRUTH PROXY RECORDS</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Historical Flood & Rainfall Analysis
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Examine antecedent moisture, cloudburst occurrences, and verified flood-proximity proxy events.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Filter by location, river, district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-400">Risk Severity:</span>
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs font-mono"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="VERY HIGH">VERY HIGH</option>
            <option value="HIGH">HIGH</option>
            <option value="MODERATE">MODERATE</option>
            <option value="LOW">LOW</option>
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
          <div className="text-sm font-semibold text-white">No historical data available.</div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">{error}</p>
        </div>
      )}

      {/* Main Content when loaded */}
      {!error && (
        <>
          {/* Comparison Bar Chart */}
          {filteredRecords.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
                Rainfall vs Risk Index Distribution
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredRecords}
                    margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="location"
                      stroke="#64748b"
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        fontSize: '11px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar
                      dataKey="rainfall_24h_mm"
                      name="24H Rainfall (mm)"
                      fill="#06b6d4"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="risk_index"
                      name="Risk Index"
                      fill="#f43f5e"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Historical Data Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase font-mono">
                Verified Historical Event Ledger
              </span>
              <span className="text-xs font-mono text-slate-500">
                {filteredRecords.length} Records Found
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400 font-mono">
                Loading records from backend...
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No historical records match the selected filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4">Event Date</th>
                      <th className="py-2.5 px-4">Location</th>
                      <th className="py-2.5 px-4">District</th>
                      <th className="py-2.5 px-4">24h Rainfall</th>
                      <th className="py-2.5 px-4">Soil Saturation</th>
                      <th className="py-2.5 px-4">Risk Level</th>
                      <th className="py-2.5 px-4">Risk Index</th>
                      <th className="py-2.5 px-4">Proxy Validated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredRecords.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-4 text-slate-300">
                          {new Date(item.timestamp).toLocaleDateString([], {
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit',
                          })}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-white">{item.location}</td>
                        <td className="py-2.5 px-4 text-slate-400">{item.district}</td>
                        <td className="py-2.5 px-4 text-cyan-300 font-bold">
                          {item.rainfall_24h_mm} mm
                        </td>
                        <td className="py-2.5 px-4 text-slate-300">
                          {(item.soil_moisture * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-4">
                          <RiskBadge level={item.risk_level} size="sm" />
                        </td>
                        <td className="py-2.5 px-4 font-bold text-white">
                          {item.risk_index.toFixed(1)}
                        </td>
                        <td className="py-2.5 px-4">
                          {item.verified_proxy_event ? (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Yes</span>
                            </span>
                          ) : (
                            <span className="text-slate-500">Benchmark</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
