import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, Zap, Microscope, CheckCircle, Award, Info, Loader2, Download, XCircle, TrendingUp, Brain, Sliders, ChevronDown, ChevronUp, Upload } from 'lucide-react';
import { analyzeResume, downloadReport } from '../api';

function TierBadge({ tier }) {
  if (!tier) return null;
  const config = {
    'Top Tier':  { bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-300 dark:border-emerald-500/30', dot: 'bg-emerald-500' },
    'Mid Tier':  { bg: 'bg-amber-100 dark:bg-amber-500/15',   text: 'text-amber-700 dark:text-amber-400',   border: 'border-amber-300 dark:border-amber-500/30',   dot: 'bg-amber-500' },
    'Low Tier':  { bg: 'bg-red-100 dark:bg-red-500/15',     text: 'text-red-700 dark:text-red-400',     border: 'border-red-300 dark:border-red-500/30',     dot: 'bg-red-500' },
  };
  const c = config[tier] || config['Low Tier'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs ${c.bg} ${c.text} border ${c.border}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot}`}></span>
      {tier}
    </span>
  );
}

function DecisionBadge({ decision }) {
  if (!decision) return null;
  const config = {
    'ACCEPTED':  { bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-300 dark:border-emerald-500/30', label: '✅ ACCEPTED' },
    'REJECTED':  { bg: 'bg-red-100 dark:bg-red-500/15',     text: 'text-red-700 dark:text-red-400',     border: 'border-red-300 dark:border-red-500/30',     label: '❌ REJECTED' },
  };
  const c = config[decision] || config['REJECTED'];
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg font-bold text-xs ${c.bg} ${c.text} border ${c.border}`}>
      {c.label}
    </span>
  );
}

// Skill Tag component for categorization
function SkillTag({ name, type }) {
  const styles = {
    'matched-req':  'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    'missing-req':  'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20',
    'matched-opt':  'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    'missing-opt':  'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20',
  };
  return <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${styles[type] || styles['missing-req']}`}>{name}</span>;
}

export default function AnalyzeResume({ prefillData, onClearPrefill }) {
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [jdFile, setJdFile] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [showThresholds, setShowThresholds] = useState(false);
  const [topThreshold, setTopThreshold] = useState(80);
  const [midThreshold, setMidThreshold] = useState(60);

  // Handle prefill from Rank page "Analyze This Resume"
  useEffect(() => {
    if (prefillData) {
      setResults(prefillData);
      if (onClearPrefill) onClearPrefill();
    }
  }, [prefillData]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleJdFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setJdFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file || (!jobDescription && !jdFile)) {
      setError("Please provide a resume file and a job description (text or file).");
      return;
    }
    setError("");
    setLoading(true);
    setResults(null);
    try {
      const thresholds = { top: topThreshold, mid: midThreshold };
      const data = await analyzeResume(file, jobDescription, thresholds, jdFile);
      if (data.error) {
         setError(data.error);
      } else {
         setResults(data);
      }
    } catch (err) {
      setError("Failed to reach server or process request.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!file || (!jobDescription && !jdFile)) return;
    setDownloading(true);
    try {
      await downloadReport(file, jobDescription);
    } catch (err) {
      console.error(err);
      alert("Failed to download report");
    } finally {
      setDownloading(false);
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

  const scoreColor = (s) => s >= topThreshold ? 'text-emerald-600 dark:text-emerald-400' : s >= midThreshold ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400';
  const scoreBg = (s) => s >= topThreshold ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' : s >= midThreshold ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20';
  const barColor = (s) => s >= topThreshold ? 'bg-emerald-500' : s >= midThreshold ? 'bg-amber-500' : 'bg-red-500';

  // Extract skill names from matched data for categorized view
  const getMatchedReqNames = () => (results?.matched_required || []).map(s => typeof s === 'string' ? s : s.name || s.canonical || '');
  const getMissingReqNames = () => results?.missing_required || [];
  const getMatchedOptNames = () => (results?.matched_optional || []).map(s => typeof s === 'string' ? s : s.name || s.canonical || '');
  const getMissingOptNames = () => results?.missing_optional || [];

  return (
    <div className="animate-fade-in max-w-5xl mx-auto block">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Input */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <UploadCloud className="w-5 h-5 text-indigo-500 dark:text-emerald-400" /> Analyze Resume
          </h2>
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleAnalyze} className="space-y-5">
            {/* Job Description — dual input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Description</label>
              <textarea 
                rows="8" 
                placeholder="Paste the job description here..." 
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
                {jdFile && (
                  <button type="button" onClick={() => setJdFile(null)} className="text-xs text-red-500 hover:text-red-400">Remove</button>
                )}
                <span className="text-[10px] text-gray-400 dark:text-gray-500">PDF, DOCX, TXT</span>
              </div>
            </div>

            {/* Resume Upload */}
            <div 
              className={`border-2 border-dashed ${file ? 'border-indigo-400 dark:border-emerald-500/40 bg-indigo-50 dark:bg-emerald-500/5' : 'border-gray-300 dark:border-white/10'} rounded-xl p-6 text-center hover:border-indigo-400 dark:hover:border-emerald-500/40 hover:bg-indigo-50 dark:hover:bg-emerald-500/5 transition-colors cursor-pointer relative`}
            >
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt"
              />
              <FileText className={`w-8 h-8 ${file ? 'text-indigo-500 dark:text-emerald-400' : 'text-gray-400'} mx-auto mb-2`} />
              <p className={`text-sm font-medium ${file ? 'text-indigo-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-400'}`}>
                {file ? file.name : 'Click to upload or drag & drop'}
              </p>
              {!file && <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">PDF, DOCX, TXT formats</p>}
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
                  Tier Thresholds
                </span>
                {showThresholds ? <ChevronUp className="w-4 h-4 text-gray-400"/> : <ChevronDown className="w-4 h-4 text-gray-400"/>}
              </button>
              {showThresholds && (
                <div className="px-4 pb-4 pt-2 space-y-3 border-t border-gray-100 dark:border-white/5 animate-fade-in">
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
            
            <button type="submit" disabled={loading} className="w-full btn-primary py-3 rounded-xl flex justify-center items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {loading ? "Processing Analysis..." : "Analyze Match"}
            </button>
          </form>
        </div>

        {/* Output */}
        {results ? (
          <div className="glass-card rounded-2xl p-6 flex flex-col animate-fade-in relative">
            <div className="flex justify-between items-start mb-5">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <CheckCircle className="w-5 h-5 text-green-500" /> Analysis Complete
              </h2>
              <button 
                onClick={handleDownload} 
                disabled={downloading}
                className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg disabled:opacity-50"
              >
                {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                {downloading ? "Downloading..." : "PDF Report"}
              </button>
            </div>

            {/* Score + Decision + Tier */}
            <div className={`flex items-center justify-between p-5 rounded-xl border mb-5 ${scoreBg(results.score)}`}>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Overall Match Score</p>
                <div className="flex items-baseline gap-2">
                  <p className={`text-3xl font-bold ${scoreColor(results.score)}`}>{results.score}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 font-medium">/ 100</p>
                </div>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <DecisionBadge decision={results.decision} />
                  <TierBadge tier={results.tier} />
                </div>
              </div>
              <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${results.score >= topThreshold ? 'border-emerald-400' : results.score >= midThreshold ? 'border-amber-400' : 'border-red-400'}`}>
                <Award className={`w-7 h-7 ${results.score >= topThreshold ? 'text-emerald-500' : results.score >= midThreshold ? 'text-amber-500' : 'text-red-500'}`} />
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Keyword Score</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{results.keyword_score ?? 0}%</p>
                <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div className={`h-1.5 rounded-full progress-fill ${barColor(results.keyword_score ?? 0)}`} style={{ width: `${results.keyword_score ?? 0}%` }}></div>
                </div>
              </div>
              <div className="bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Brain className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Semantic Score</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{results.semantic_score ?? 0}%</p>
                <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div className="h-1.5 rounded-full progress-fill bg-purple-500" style={{ width: `${results.semantic_score ?? 0}%` }}></div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 pr-2">
              {/* CATEGORIZED SKILLS — Required vs Optional, Matched vs Missing */}
              <div className="space-y-4">
                {/* Required Skills */}
                <div className="bg-white/40 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 uppercase tracking-wide">Required Skills</h3>
                  
                  <div className="mb-3">
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1.5">✔ Matched ({getMatchedReqNames().length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {getMatchedReqNames().length > 0 ? getMatchedReqNames().map((s, i) => (
                        <SkillTag key={i} name={s} type="matched-req" />
                      )) : <span className="text-xs text-gray-400 italic">None matched</span>}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1.5">✘ Missing ({getMissingReqNames().length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {getMissingReqNames().length > 0 ? getMissingReqNames().map((s, i) => (
                        <SkillTag key={i} name={s} type="missing-req" />
                      )) : <span className="text-xs text-emerald-500 font-medium">All required present! ✅</span>}
                    </div>
                  </div>
                </div>

                {/* Optional Skills */}
                <div className="bg-white/40 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 uppercase tracking-wide">Optional Skills</h3>
                  
                  <div className="mb-3">
                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1.5">✔ Matched ({getMatchedOptNames().length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {getMatchedOptNames().length > 0 ? getMatchedOptNames().map((s, i) => (
                        <SkillTag key={i} name={s} type="matched-opt" />
                      )) : <span className="text-xs text-gray-400 italic">No optional skills matched</span>}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1.5">✘ Missing ({getMissingOptNames().length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {getMissingOptNames().length > 0 ? getMissingOptNames().map((s, i) => (
                        <SkillTag key={i} name={s} type="missing-opt" />
                      )) : <span className="text-xs text-gray-400 italic">None</span>}
                    </div>
                  </div>
                </div>

                {/* Semantic matches */}
                {results.top_semantic_matches && results.top_semantic_matches.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Semantic Context Matches</p>
                    <div className="flex flex-wrap gap-1.5">
                      {results.top_semantic_matches.map((sem, i) => {
                        const label = typeof sem === 'string' ? sem : sem.job_req || sem;
                        return <span key={i} className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-md text-xs font-medium border border-indigo-200 dark:border-indigo-500/20 border-dashed">{label}</span>;
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Explanation */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> AI Explanation & Advice
                </h3>
                <div className="bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 rounded-xl text-sm text-gray-800 dark:text-gray-300 leading-relaxed whitespace-pre-wrap shadow-sm">
                  {results.explanation || "No advanced AI explanation provided."}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[400px]">
            <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-full mb-4">
              <Microscope className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">No Data Yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mt-2">Provide a job description and upload a resume on the left to see the match score, missing skills, and detailed AI feedback.</p>
          </div>
        )}
      </div>
    </div>
  );
}
