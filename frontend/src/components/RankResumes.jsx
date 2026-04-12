import React, { useState } from 'react';
import { Briefcase, Files, BarChart, ListOrdered, Trophy, Loader2, ChevronDown, ChevronUp, Sliders, TrendingUp, Brain, FileSearch, Upload } from 'lucide-react';
import { rankResumes } from '../api';

function CandidateCard({ item, index, topThreshold, midThreshold, onAnalyze }) {
  const [expanded, setExpanded] = useState(false);
  const match = item.score;
  const barColor = match >= topThreshold ? 'bg-emerald-500' : (match >= midThreshold ? 'bg-indigo-500' : 'bg-red-400');
  const rankBadgeClass = index === 0 ? "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400" : (index === 1 ? "bg-gray-200 dark:bg-gray-500/15 text-gray-700 dark:text-gray-400" : (index === 2 ? "bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-400" : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400"));

  return (
    <div className="border border-gray-100 dark:border-white/5 rounded-xl bg-white dark:bg-white/[0.03] shadow-sm overflow-hidden transition-all">
      {/* Main row */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${rankBadgeClass}`}>
            #{index + 1}
          </div>
          <span className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate" title={item.name}>
            {item.name.length > 35 ? item.name.substring(0,32)+'...' : item.name}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-bold text-gray-800 dark:text-gray-200 text-lg">{match}%</span>
          <button 
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            title={expanded ? "Hide details" : "View details"}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
          <div className={`h-1.5 rounded-full ${barColor} progress-fill`} style={{ width: `${match}%` }}></div>
        </div>
      </div>

      {/* Expandable details */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-white/5 px-4 py-4 bg-gray-50/50 dark:bg-white/[0.02] animate-fade-in space-y-4">
          {/* Score breakdown */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <BarChart className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Match</span>
              </div>
              <p className="text-lg font-extrabold text-gray-900 dark:text-gray-100">{item.score}%</p>
            </div>
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-blue-500" />
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Keyword</span>
              </div>
              <p className="text-lg font-extrabold text-gray-900 dark:text-gray-100">{item.keyword_score ?? 0}%</p>
            </div>
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Brain className="w-3 h-3 text-purple-500" />
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Semantic</span>
              </div>
              <p className="text-lg font-extrabold text-gray-900 dark:text-gray-100">{item.semantic_score ?? 0}%</p>
            </div>
          </div>

          {/* Decision + Tier */}
          <div className="flex items-center gap-4 p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg">
            <div className="flex-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Decision</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${item.decision === 'ACCEPTED' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20'}`}>
                {item.decision === 'ACCEPTED' ? '✅' : '❌'} {item.decision}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Tier</p>
              {(() => {
                const tc = { 'Top Tier': 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20', 'Mid Tier': 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20', 'Low Tier': 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20' };
                return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${tc[item.tier] || tc['Low Tier']}`}>{item.tier}</span>;
              })()}
            </div>
          </div>

          {/* Missing required */}
          {item.missing_required && item.missing_required.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Missing Required Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {item.missing_required.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded text-[11px] font-medium border border-red-200 dark:border-red-500/20">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Analyze This Resume */}
          {onAnalyze && (
            <button
              onClick={() => onAnalyze(item)}
              className="w-full btn-secondary flex items-center justify-center gap-2 py-2 px-4 text-xs font-bold"
            >
              <FileSearch className="w-3.5 h-3.5" />
              Analyze This Resume
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function RankResumes({ onAnalyzeResume }) {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [jobDescription, setJobDescription] = useState("");
  const [jdFile, setJdFile] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [showThresholds, setShowThresholds] = useState(false);
  const [topThreshold, setTopThreshold] = useState(80);
  const [midThreshold, setMidThreshold] = useState(60);
  const [acceptThreshold, setAcceptThreshold] = useState(60);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };
  const handleJdFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setJdFile(e.target.files[0]);
    }
  };

  const handleTopChange = (val) => {
    const n = Math.max(1, Math.min(100, Number(val) || 0));
    setTopThreshold(n);
    if (midThreshold >= n) setMidThreshold(n - 1);
  };
  const handleMidChange = (val) => {
    const n = Math.max(0, Math.min(topThreshold - 1, Number(val) || 0));
    setMidThreshold(n);
  };
  const handleAcceptChange = (val) => {
    setAcceptThreshold(Math.max(0, Math.min(100, Number(val) || 0)));
  };

  const handleRank = async (e) => {
    e.preventDefault();
    if (files.length === 0 || (!jobDescription && !jdFile)) {
      setError("Please provide a job description and at least one resume.");
      return;
    }
    setError("");
    setLoading(true);
    setResults(null);
    try {
      const thresholds = { top: topThreshold, mid: midThreshold, accept: acceptThreshold };
      const data = await rankResumes(files, jobDescription, thresholds, jdFile);
      if (data.error) {
        setError(data.error);
      } else {
        setResults(data.ranked_candidates);
      }
    } catch (err) {
      setError("Failed to reach server to rank resumes.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle "Analyze This Resume" — pass data to parent
  const handleAnalyzeItem = (item) => {
    if (onAnalyzeResume) {
      onAnalyzeResume({
        score: item.score,
        decision: item.decision,
        tier: item.tier,
        keyword_score: item.keyword_score,
        semantic_score: item.semantic_score,
        matched_skills: item.matched_skills || [],
        matched_required: item.matched_required || item.matched_skills || [],
        matched_optional: item.matched_optional || [],
        missing_required: item.missing_required || [],
        missing_optional: item.missing_optional || [],
        explanation: `📊 Pre-analyzed from Rank Results.\n\nScore: ${item.score}%\nKeyword: ${item.keyword_score ?? 0}%\nSemantic: ${item.semantic_score ?? 0}%\nDecision: ${item.decision}\nTier: ${item.tier}`,
      });
    }
  };

  // Tier grouping
  const grouped = results ? {
    top: results.filter(c => c.tier === 'Top Tier'),
    mid: results.filter(c => c.tier === 'Mid Tier'),
    low: results.filter(c => c.tier === 'Low Tier'),
  } : null;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto block">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-5">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Briefcase className="w-5 h-5 text-indigo-500 dark:text-emerald-400" /> Job & Resumes
          </h2>
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleRank} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Description</label>
              <textarea 
                rows="4" 
                placeholder="Paste full job description..." 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:placeholder-gray-500 input-focus transition-colors text-sm resize-none bg-white/50"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <div className="mt-2 flex items-center gap-3">
                <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 dark:border-white/10 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  {jdFile ? jdFile.name : 'Upload JD file'}
                  <input type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={handleJdFileChange} />
                </label>
                {jdFile && <button type="button" onClick={() => setJdFile(null)} className="text-xs text-red-500 hover:text-red-400">Remove</button>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resumes to Rank</label>
              <div className={`border-2 border-dashed ${files.length > 0 ? 'border-indigo-400 dark:border-emerald-500/40 bg-indigo-50 dark:bg-emerald-500/5' : 'border-gray-300 dark:border-white/10'} rounded-xl p-6 text-center hover:border-indigo-400 dark:hover:border-emerald-500/40 hover:bg-indigo-50 dark:hover:bg-emerald-500/5 transition-colors cursor-pointer relative`}>
                <input 
                  type="file" multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.txt"
                />
                <Files className={`w-8 h-8 ${files.length > 0 ? 'text-indigo-500 dark:text-emerald-400' : 'text-gray-400'} mx-auto mb-2`} />
                <p className={`text-sm font-medium ${files.length > 0 ? 'text-indigo-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-400'}`}>
                  {files.length > 0 ? `${files.length} file(s) selected` : 'Upload multiple resumes'}
                </p>
                {files.length === 0 && <p className="text-xs text-gray-500 mt-1">PDF, DOCX, TXT formats</p>}
              </div>
              {files.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm">
                      <span className="text-gray-700 dark:text-gray-300 truncate">{f.name}</span>
                      <span className="text-xs text-gray-400">{(f.size / 1024).toFixed(0)} KB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Threshold Controls */}
            <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white/40 dark:bg-white/5">
              <button
                type="button"
                onClick={() => setShowThresholds(!showThresholds)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-500 dark:text-emerald-400" />
                  Thresholds & Controls
                </span>
                {showThresholds ? <ChevronUp className="w-4 h-4 text-gray-400"/> : <ChevronDown className="w-4 h-4 text-gray-400"/>}
              </button>
              {showThresholds && (
                <div className="px-4 pb-4 pt-2 space-y-3 border-t border-gray-100 dark:border-white/5 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 w-24">Top Tier</label>
                    <input 
                      type="number" min="1" max="100" value={topThreshold} 
                      onChange={(e) => handleTopChange(e.target.value)}
                      className="w-20 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-500/30 text-sm font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-500/20 text-center"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 w-24">Mid Tier</label>
                    <input 
                      type="number" min="0" max={topThreshold - 1} value={midThreshold} 
                      onChange={(e) => handleMidChange(e.target.value)}
                      className="w-20 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-500/30 text-sm font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-500/20 text-center"
                    />
                  </div>
                  <div className="pt-2 border-t border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 w-24">Accept ≥</label>
                      <input 
                        type="number" min="0" max="100" value={acceptThreshold} 
                        onChange={(e) => handleAcceptChange(e.target.value)}
                        className="w-20 px-3 py-1.5 rounded-lg border border-indigo-300 dark:border-indigo-500/30 text-sm font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/20 text-center"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium mt-2">Score ≥ {acceptThreshold} → ACCEPTED · else REJECTED</p>
                  </div>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3 rounded-xl flex justify-center items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart className="w-4 h-4" />}
              {loading ? "Ranking Candidates..." : "Rank Resumes"}
            </button>
          </form>
        </div>

        {/* Output */}
        {results ? (
          <div className="glass-card rounded-2xl p-6 lg:col-span-7 flex flex-col animate-fade-in">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Trophy className="w-5 h-5 text-indigo-500 dark:text-emerald-400" /> Ranking Results
              <span className="text-xs font-medium text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full ml-auto">{results.length} candidates</span>
            </h2>
            <div className="flex-1 overflow-y-auto pr-1 pb-2 space-y-5">
              {/* Top Tier Group */}
              {grouped.top.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Top Tier</h3>
                  </div>
                  <div className="space-y-2">
                    {grouped.top.map((item, idx) => (
                      <CandidateCard key={idx} item={item} index={results.indexOf(item)} topThreshold={topThreshold} midThreshold={midThreshold} onAnalyze={handleAnalyzeItem} />
                    ))}
                  </div>
                </div>
              )}

              {/* Mid Tier Group */}
              {grouped.mid.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <h3 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Mid Tier</h3>
                  </div>
                  <div className="space-y-2">
                    {grouped.mid.map((item, idx) => (
                      <CandidateCard key={idx} item={item} index={results.indexOf(item)} topThreshold={topThreshold} midThreshold={midThreshold} onAnalyze={handleAnalyzeItem} />
                    ))}
                  </div>
                </div>
              )}

              {/* Low Tier Group */}
              {grouped.low.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <h3 className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">Low Tier</h3>
                  </div>
                  <div className="space-y-2">
                    {grouped.low.map((item, idx) => (
                      <CandidateCard key={idx} item={item} index={results.indexOf(item)} topThreshold={topThreshold} midThreshold={midThreshold} onAnalyze={handleAnalyzeItem} />
                    ))}
                  </div>
                </div>
              )}

              {results.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">No candidates could be ranked.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-6 lg:col-span-7 flex flex-col items-center justify-center text-center min-h-[400px]">
            <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-full mb-4">
              <ListOrdered className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Ranking Board</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mt-2">Enter a job description and upload a batch of resumes to see who matches best via our AI matching pipeline.</p>
          </div>
        )}
      </div>
    </div>
  );
}
