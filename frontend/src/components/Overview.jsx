import React, { useState, useEffect } from 'react';
import { 
  FileText, TrendingUp, BarChart2, Briefcase, Clock, Activity, Users, Pencil, Check, X, Loader2 
} from 'lucide-react';
import { getOverviewStats, updateOpenPositions } from '../api';

function getStatusStyles(status) {
  switch (status) {
    case 'ACCEPTED':
      return {
        avatar: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
        badge: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
      };
    case 'REJECTED':
      return {
        avatar: 'bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400',
        badge: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20',
      };
    default:
      return {
        avatar: 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400',
        badge: 'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-white/10',
      };
  }
}

function getTierStyles(tier) {
  switch (tier) {
    case 'Top Tier': return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
    case 'Mid Tier': return 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
    case 'Low Tier': return 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20';
    default: return 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10';
  }
}

export default function Overview({ setTab }) {
  const [stats, setStats] = useState({
    total_analyzed: 0,
    avg_match_rate: 0,
    open_positions: 0,
    processed_today: 0,
    recent_activity: []
  });
  const [loading, setLoading] = useState(true);
  
  const [isEditingPositions, setIsEditingPositions] = useState(false);
  const [positionsInput, setPositionsInput] = useState('');
  const [positionsSaving, setPositionsSaving] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getOverviewStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load overview stats", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const handleEditPositions = () => {
    setIsEditingPositions(true);
    setPositionsInput(stats.open_positions);
  };

  const savePositions = async () => {
    const val = parseInt(positionsInput, 10);
    if (isNaN(val) || val < 0 || val > 10000) {
      alert("Please enter a valid number between 0 and 10000.");
      return;
    }
    setPositionsSaving(true);
    try {
      await updateOpenPositions(val);
      setStats(prev => ({ ...prev, open_positions: val }));
      setIsEditingPositions(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update open positions");
    } finally {
      setPositionsSaving(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card rounded-3xl p-6 hover-lift relative overflow-hidden group">
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Analyzed</p>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mt-2">{loading ? "..." : stats.total_analyzed}</h3>
            </div>
            <div className="p-3 bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1.5 mt-4 bg-indigo-50 dark:bg-indigo-500/10 w-fit px-2.5 py-1 rounded-full">
            <TrendingUp className="w-3.5 h-3.5" /> All time records
          </p>
        </div>

        <div className="glass-card rounded-3xl p-6 hover-lift relative overflow-hidden group">
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-400 to-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Match Rate</p>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mt-2">{loading ? "..." : stats.avg_match_rate}%</h3>
            </div>
            <div className="p-3 bg-emerald-50/80 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <BarChart2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 mt-4 bg-emerald-50 dark:bg-emerald-500/10 w-fit px-2.5 py-1 rounded-full">
            <Activity className="w-3.5 h-3.5" /> Analytics updated
          </p>
        </div>

        <div className="glass-card rounded-3xl p-6 hover-lift relative overflow-hidden group">
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-amber-400 to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex justify-between items-center w-full">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Open Positions</p>
                {!isEditingPositions && (
                  <button onClick={handleEditPositions} className="text-gray-400 hover:text-amber-500 transition-colors p-1" title="Edit">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {isEditingPositions ? (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number" autoFocus
                    min="0" max="10000"
                    value={positionsInput}
                    onChange={e => setPositionsInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && savePositions()}
                    className="w-20 text-xl font-bold text-gray-900 dark:text-white bg-white dark:bg-white/10 border border-amber-300 dark:border-amber-500/30 rounded px-2 py-0.5 outline-none focus:ring-2 ring-amber-500/50"
                  />
                  {positionsSaving ? (
                    <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                  ) : (
                    <>
                      <button onClick={savePositions} className="text-emerald-500 hover:text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 p-1.5 rounded"><Check className="w-3.5 h-3.5"/></button>
                      <button onClick={() => setIsEditingPositions(false)} className="text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-500/10 p-1.5 rounded"><X className="w-3.5 h-3.5"/></button>
                    </>
                  )}
                </div>
              ) : (
                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mt-2">{stats.open_positions}</h3>
              )}
            </div>
            <div className="p-3 ml-4 bg-amber-50/80 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl shadow-sm border border-amber-100 dark:border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-4 bg-amber-50 dark:bg-amber-500/10 w-fit px-2.5 py-1 rounded-full">
            Active roles
          </p>
        </div>

        <div className="glass-card rounded-3xl p-6 hover-lift relative overflow-hidden group">
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-400 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Processed Today</p>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mt-2">{loading ? "..." : stats.processed_today}</h3>
            </div>
            <div className="p-3 bg-blue-50/80 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl shadow-sm border border-blue-100 dark:border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-4 bg-blue-50 dark:bg-blue-500/10 w-fit px-2.5 py-1 rounded-full">
            Since midnight
          </p>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="glass-card rounded-3xl lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Recent Activity</h3>
            <button onClick={() => setTab('history')} className="btn-secondary text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">View All</button>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">Loading activity...</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-100 dark:border-white/5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    <th className="pb-3 px-3">Candidate</th>
                    <th className="pb-3 px-3">Score</th>
                    <th className="pb-3 px-3">Tier</th>
                    <th className="pb-3 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {stats.recent_activity.map((item, idx) => {
                    const styles = getStatusStyles(item.status);
                    const tierClass = getTierStyles(item.tier);
                    
                    return (
                      <tr key={idx} className="border-b border-gray-50 dark:border-white/[0.03] hover:bg-white/60 dark:hover:bg-white/[0.02] transition-colors group">
                        <td className="py-4 px-3 font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${styles.avatar}`}>
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="truncate max-w-[160px]" title={item.name}>{item.name}</span>
                        </td>
                        <td className="py-4 px-3 font-extrabold text-gray-900 dark:text-gray-100">{Math.round(item.score)}%</td>
                        <td className="py-4 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${tierClass}`}>
                            {item.tier || '—'}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-right">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${styles.badge}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-3xl p-6 h-fit">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">Quick Actions</h3>
          <div className="space-y-4">
            <button 
              onClick={() => setTab('analyze')} 
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-white dark:border-white/5 hover:border-emerald-200 dark:hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-100/50 dark:hover:shadow-none transition-all text-left group hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 text-black flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">Analyze Resume</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Deep dive into a candidate</p>
              </div>
            </button>
            <button 
              onClick={() => setTab('rank')} 
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-white dark:border-white/5 hover:border-emerald-200 dark:hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-100/50 dark:hover:shadow-none transition-all text-left group hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-black flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                <BarChart2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">Rank Resumes</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Compare many against a job</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
