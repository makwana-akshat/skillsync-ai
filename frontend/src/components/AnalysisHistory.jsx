import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Search, FileText, RefreshCw, ArrowUpDown, Filter } from 'lucide-react';
import { getHistory } from '../api';

function TierBadge({ tier }) {
  if (!tier || tier === '-') return <span className="text-xs text-gray-400">—</span>;
  const config = {
    'Top Tier':  { classes: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' },
    'Mid Tier':  { classes: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' },
    'Low Tier':  { classes: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20' },
  };
  const c = config[tier] || config['Low Tier'];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${c.classes}`}>
      {tier}
    </span>
  );
}

function StatusBadge({ status }) {
  const configs = {
    'ACCEPTED': { classes: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' },
    'REJECTED': { classes: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20' },
  };
  const c = configs[status] || { classes: 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${c.classes}`}>
      {status}
    </span>
  );
}

export default function AnalysisHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterTier, setFilterTier] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await getHistory({
        limit: 200,
        sort: sortBy,
        order: sortOrder,
        tier: filterTier !== 'all' ? filterTier : null,
        status: filterStatus !== 'all' ? filterStatus : null,
      });
      setRecords(data.records || []);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [sortBy, sortOrder, filterTier, filterStatus]);

  const filtered = records.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleOrder = () => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="glass-card rounded-2xl p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <HistoryIcon className="w-5 h-5 text-indigo-500 dark:text-emerald-400" /> Analysis History
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:placeholder-gray-500 input-focus text-sm bg-white/50 w-56"
                />
              </div>
              <button 
                onClick={loadRecords}
                className="p-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors" 
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 text-gray-500 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Sort & Filter Controls */}
          <div className="flex flex-wrap items-center gap-3 p-3 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort by:
            </div>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-medium bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="date">Date</option>
              <option value="score">Score</option>
              <option value="tier">Tier</option>
              <option value="status">Status</option>
              <option value="name">Candidate Name</option>
            </select>
            <button 
              onClick={toggleOrder}
              className="text-[10px] font-bold uppercase bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-white/10 transition-colors tracking-wide"
              title="Toggle sort direction"
            >
              {sortOrder === 'desc' ? '↓ DESC' : '↑ ASC'}
            </button>

            <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-1"></div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </div>
            <select 
              value={filterTier} 
              onChange={(e) => setFilterTier(e.target.value)}
              className="text-xs font-medium bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="all">All Tiers</option>
              <option value="Top Tier">Top Tier</option>
              <option value="Mid Tier">Mid Tier</option>
              <option value="Low Tier">Low Tier</option>
            </select>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs font-medium bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">Loading history...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {search ? 'No matching records found.' : 'No analysis history yet. Start by analyzing a resume!'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-100 dark:border-white/5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  <th className="pb-3 px-3">#</th>
                  <th className="pb-3 px-3">Candidate</th>
                  <th className="pb-3 px-3">Score</th>
                  <th className="pb-3 px-3">Tier</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filtered.map((record, idx) => {
                  const scoreColor = record.score >= 80 ? 'text-emerald-600 dark:text-emerald-400' : record.score >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400';
                  return (
                    <tr key={record.id || idx} className="border-b border-gray-50 dark:border-white/[0.03] hover:bg-white/60 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 text-gray-400 dark:text-gray-500 font-medium text-xs">{idx + 1}</td>
                      <td className="py-3 px-3 font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[220px]" title={record.name}>
                        {record.name}
                      </td>
                      <td className={`py-3 px-3 font-extrabold ${scoreColor}`}>
                        {Math.round(record.score)}%
                      </td>
                      <td className="py-3 px-3">
                        <TierBadge tier={record.tier} />
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="py-3 px-3 text-right text-gray-400 dark:text-gray-500 text-[11px]">
                        {record.created_at ? new Date(record.created_at).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        {!loading && filtered.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>{filtered.length} record(s)</span>
            <div className="flex items-center gap-4">
              <span>Avg: <strong className="text-gray-700 dark:text-gray-300">{Math.round(filtered.reduce((sum, r) => sum + r.score, 0) / filtered.length)}%</strong></span>
              <span>Top: <strong className="text-emerald-600 dark:text-emerald-400">{filtered.filter(r => r.tier === 'Top Tier').length}</strong></span>
              <span>Mid: <strong className="text-amber-600 dark:text-amber-400">{filtered.filter(r => r.tier === 'Mid Tier').length}</strong></span>
              <span>Low: <strong className="text-red-600 dark:text-red-400">{filtered.filter(r => r.tier === 'Low Tier').length}</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
