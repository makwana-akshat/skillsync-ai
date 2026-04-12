import React, { useState, useRef } from 'react';
import { FolderSearch, Users, Cpu, Network, Loader2, FileText, Sliders, ChevronDown, ChevronUp, Upload, X } from 'lucide-react';
import { rankResumes, advancedBatchMatch } from '../api';

function JobGroupCard({ jobName, tiers }) {
  const [expanded, setExpanded] = useState(false);
  const candidateCount = Object.values(tiers).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-4 transition-all duration-200">
      {/* Click to expand/collapse */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 dark:bg-emerald-500/10 p-2 rounded-lg">
            <FolderSearch className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{jobName}</h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Candidates: {candidateCount}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4 animate-fade-in relative">
          
          {candidateCount === 0 && (
            <p className="absolute top-4 right-4 text-xs italic text-gray-400">No candidates matched this job</p>
          )}

          {['Top Tier', 'Mid Tier', 'Low Tier'].map(tierName => {
            const items = tiers[tierName] || [];
            
            // Tier color logic explicitly requested
            const tierColor = tierName === 'Top Tier' ? 'text-green-500' : (tierName === 'Mid Tier' ? 'text-yellow-500' : 'text-red-500');

            // Optional UX Improvement: Sort candidates by score descending
            const sortedItems = [...items].sort((a, b) => b.score - a.score);

            return (
              <div key={tierName} className="mt-3">
                <h4 className={`text-sm font-bold uppercase tracking-wider mb-2 ${tierColor}`}>
                  {tierName} ({items.length})
                </h4>
                <div>
                  {sortedItems.length === 0 ? (
                    <p className="text-xs italic text-gray-400 p-2">No candidates in this tier</p>
                  ) : (
                    sortedItems.map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700 mb-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                            {item.candidate}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 shrink-0">
                          {item.score}%
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function BatchMatch() {
  const [loading, setLoading] = useState(false);
  const [jdFiles, setJdFiles] = useState([]);
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [showThresholds, setShowThresholds] = useState(false);
  const [topThreshold, setTopThreshold] = useState(80);
  const [midThreshold, setMidThreshold] = useState(60);

  const fileInputRef = useRef(null);
  const jdFileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleJdFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setJdFiles(Array.from(e.target.files));
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

  const handleMatch = async () => {
    if (jdFiles.length === 0 || files.length === 0) {
      setError("Please provide at least 1 job description file and 1 resume file.");
      return;
    }
    setError('');
    setLoading(true);
    setResults(null);
    try {
      const thresholds = { top: topThreshold, mid: midThreshold };
      const data = await advancedBatchMatch(files, jdFiles, thresholds);
      if (data.error) {
        setError(data.error);
      } else {
        setResults(data.grouped_results || null);
      }
    } catch (err) {
      setError("Failed to process batch match. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hasFiles = files.length > 0;
  const hasJdFiles = jdFiles.length > 0;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto block">
      <div className="glass-card rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-5 flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <Network className="w-5 h-5 text-emerald-500" /> Advanced Batch Matching
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* ── Input Row: JD + Upload (matched heights) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Job Description Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Job Descriptions</label>
            {/* Hidden file input */}
            <input 
              ref={jdFileInputRef}
              type="file" 
              multiple
              className="hidden"
              onChange={handleJdFileChange}
              accept=".pdf,.docx,.txt"
            />
            {/* Custom clickable upload zone */}
            <div
              onClick={() => jdFileInputRef.current?.click()}
              className={`
                h-[164px] rounded-xl border-2 border-dashed
                flex flex-col items-center justify-center gap-2
                cursor-pointer select-none
                transition-all duration-200
                ${hasJdFiles 
                  ? 'border-emerald-400 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/5' 
                  : 'border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 hover:border-emerald-400 dark:hover:border-emerald-500/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5'
                }
              `}
            >
              {hasJdFiles ? (
                <>
                  <Upload className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{jdFiles.length} JD file(s) selected</p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setJdFiles([]); if(jdFileInputRef.current) jdFileInputRef.current.value = ''; }}
                    className="mt-1 flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" /> Clear files
                  </button>
                </>
              ) : (
                <>
                  <FileText className="w-7 h-7 text-gray-400 dark:text-gray-500" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Click to add job descriptions</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">PDF, DOCX, TXT formats</p>
                </>
              )}
            </div>

            {/* File list chips */}
            {hasJdFiles && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {jdFiles.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-xs text-gray-600 dark:text-gray-400 font-medium">
                    <FileText className="w-3 h-3 text-gray-400" />
                    <span className="truncate max-w-[120px]">{f.name}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Upload Candidates — clean custom trigger, no raw file input visible */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Candidate Resumes</label>
            {/* Hidden file input */}
            <input 
              ref={fileInputRef}
              type="file" 
              multiple
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.docx,.txt"
            />
            {/* Custom clickable upload zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`
                h-[164px] rounded-xl border-2 border-dashed
                flex flex-col items-center justify-center gap-2
                cursor-pointer select-none
                transition-all duration-200
                ${hasFiles 
                  ? 'border-emerald-400 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/5' 
                  : 'border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 hover:border-emerald-400 dark:hover:border-emerald-500/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5'
                }
              `}
            >
              {hasFiles ? (
                <>
                  <Upload className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{files.length} file(s) selected</p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFiles([]); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="mt-1 flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" /> Clear files
                  </button>
                </>
              ) : (
                <>
                  <Users className="w-7 h-7 text-gray-400 dark:text-gray-500" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Click to add candidates</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">PDF, DOCX, TXT formats</p>
                </>
              )}
            </div>

            {/* File list chips */}
            {hasFiles && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {files.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-xs text-gray-600 dark:text-gray-400 font-medium">
                    <FileText className="w-3 h-3 text-gray-400" />
                    <span className="truncate max-w-[120px]">{f.name}</span>
                    <span className="text-gray-300 dark:text-gray-600">·</span>
                    <span className="text-gray-400">{(f.size / 1024).toFixed(0)}KB</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Threshold + Submit Row ── */}
        <div className="flex flex-col md:flex-row gap-4 mt-5 items-stretch">
          
          {/* Thresholds collapsible */}
          <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white/40 dark:bg-white/5 flex-1">
            <button
              type="button"
              onClick={() => setShowThresholds(!showThresholds)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> Tier Thresholds
              </span>
              {showThresholds ? <ChevronUp className="w-4 h-4 text-gray-400"/> : <ChevronDown className="w-4 h-4 text-gray-400"/>}
            </button>
            {showThresholds && (
              <div className="px-4 pb-3 pt-2 space-y-3 border-t border-gray-100 dark:border-white/5 animate-fade-in">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 w-20">Top Tier</label>
                  <input 
                    type="number" min="1" max="100" value={topThreshold} 
                    onChange={(e) => handleTopChange(e.target.value)}
                    className="w-20 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-500/30 text-sm font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-500/20 text-center"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 w-20">Mid Tier</label>
                  <input 
                    type="number" min="0" max={topThreshold - 1} value={midThreshold} 
                    onChange={(e) => handleMidChange(e.target.value)}
                    className="w-20 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-500/30 text-sm font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-500/20 text-center"
                  />
                </div>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">Top ≥ {topThreshold} · Mid ≥ {midThreshold} · Low &lt; {midThreshold}</p>
              </div>
            )}
          </div>

          {/* Submit button */}
          <button 
            onClick={handleMatch} 
            disabled={loading} 
            className="btn-primary px-8 py-3 rounded-xl flex items-center justify-center gap-2 whitespace-nowrap shrink-0 self-start md:self-auto"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Cpu className="w-5 h-5" />}
            {loading ? "Processing..." : "Run Batch Match"}
          </button>
        </div>
      </div>

      {/* ── Results ── */}
      {results && Object.keys(results).length > 0 ? (
        <div className="animate-fade-in mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FolderSearch className="w-6 h-6 text-emerald-500" /> Match Results
          </h2>
          {jdFiles.map((file, i) => {
            const jobName = `Job ${i + 1}`;
            // If the backend didn't return this job because it had 0 candidates, 
            // we supply an explicitly empty mapping array to safely force it to render
            const tiers = results[jobName] || { 'Top Tier': [], 'Mid Tier': [], 'Low Tier': [] };
            return <JobGroupCard key={jobName} jobName={jobName} tiers={tiers} />;
          })}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center">
          <div className="bg-emerald-50 dark:bg-emerald-500/10 p-6 rounded-full mb-5">
            <Network className="w-10 h-10 text-emerald-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Advanced Matching Overview</h3>
          <p className="text-base text-gray-500 dark:text-gray-400 max-w-md mt-3">Upload a pool of candidates and a job description to auto-rank the best fits simultaneously. This process runs a comprehensive AI analysis.</p>
        </div>
      )}
    </div>
  );
}
