import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import JobInput from '../components/JobInput';
import AnalyzeButton from '../components/AnalyzeButton';
import ResultCard from '../components/ResultCard';
import RankingTable from '../components/RankingTable';
import { analyzeResume, rankResumes, downloadReport } from '../api';
import { Search, BrainCircuit, AlertCircle, Users, Download } from 'lucide-react';

const Home = () => {
  // Single Analysis State
  const [singleFile, setSingleFile] = useState(null);
  const [singleJobDesc, setSingleJobDesc] = useState('');
  const [singleResult, setSingleResult] = useState(null);
  const [singleDownloading, setSingleDownloading] = useState(false);
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleError, setSingleError] = useState('');

  // Ranking State
  const [batchFiles, setBatchFiles] = useState([]);
  const [batchJobDesc, setBatchJobDesc] = useState('');
  const [batchRankings, setBatchRankings] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState('');

  const handleSingleAnalyze = async () => {
    if (!singleFile || !singleJobDesc) return;
    setSingleLoading(true);
    setSingleError('');
    try {
      const data = await analyzeResume(singleFile, singleJobDesc);
      if (data.error) {
        setSingleError(data.error);
        setSingleResult(null);
      } else {
        setSingleResult(data);
      }
    } catch (err) {
      setSingleError(err.response?.data?.detail || 'Failed to analyze resume. Please try again.');
    } finally {
      setSingleLoading(false);
    }
  };

  const handleBatchRank = async () => {
    if (batchFiles.length === 0 || !batchJobDesc) return;
    setBatchLoading(true);
    setBatchError('');
    try {
      const data = await rankResumes(batchFiles, batchJobDesc);
      setBatchRankings(data.ranked_candidates || []);
    } catch (err) {
      setBatchError(err.response?.data?.detail || 'Failed to rank candidates. Please try again.');
    } finally {
      setBatchLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!singleFile || !singleJobDesc) return;
    setSingleDownloading(true);
    try {
      await downloadReport(singleFile, singleJobDesc);
    } catch (err) {
      setSingleError('Failed to download report. Please try again.');
    } finally {
      setSingleDownloading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="py-12 px-6 text-center">
        <div className="inline-flex items-center justify-center p-3 mb-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
          <BrainCircuit className="w-8 h-8 text-blue-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
          SkillSync <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">AI</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          "AI-Powered Resume Matching System"
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-6 space-y-24">
        
        {/* Section 1: Single Resume Analysis */}
        <section id="single-analysis" className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Search className="w-6 h-6 mr-2 text-blue-500" />
                Resume Analysis
              </h2>
              <p className="text-gray-400">Deep dive into a single candidate's fit</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card">
                <FileUpload 
                  selectedFiles={singleFile} 
                  onFileSelect={setSingleFile}
                  onRemove={() => setSingleFile(null)}
                />
              </div>
              <div className="glass-card">
                <JobInput value={singleJobDesc} onChange={setSingleJobDesc} />
              </div>
              <AnalyzeButton 
                onClick={handleSingleAnalyze}
                loading={singleLoading}
                disabled={!singleFile || !singleJobDesc}
              />
              {singleError && (
                <div className="flex items-center p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                  {singleError}
                </div>
              )}
            </div>

            <div className="lg:col-span-3">
              {singleResult ? (
                <div className="space-y-6">
                  <ResultCard result={singleResult} />
                  <button
                    onClick={handleDownloadReport}
                    disabled={singleDownloading}
                    className="w-full flex items-center justify-center px-6 py-4 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl border border-gray-700 transition-all duration-300 group"
                  >
                    {singleDownloading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2 text-blue-400 group-hover:scale-110 transition-transform" />
                        Download Detailed PDF Report
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-2xl p-8 text-center bg-gray-900/20">
                  <Sparkles className="w-12 h-12 text-gray-700 mb-4" />
                  <p className="text-gray-500 font-medium">Results will appear here after analysis</p>
                  <p className="text-gray-600 text-sm mt-1">Upload a resume and job description to get started</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />

        {/* Section 2: Candidate Ranking */}
        <section id="candidate-ranking" className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Users className="w-6 h-6 mr-2 text-indigo-500" />
                Candidate Ranking
              </h2>
              <p className="text-gray-400">Compare multiple resumes against requirements</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card">
                <FileUpload 
                  multiple 
                  selectedFiles={batchFiles} 
                  onFileSelect={(files) => setBatchFiles([...batchFiles, ...files])}
                  onRemove={(idx) => setBatchFiles(batchFiles.filter((_, i) => i !== idx))}
                />
              </div>
              <div className="glass-card">
                <JobInput value={batchJobDesc} onChange={setBatchJobDesc} />
              </div>
              <AnalyzeButton 
                text="Rank Candidates"
                onClick={handleBatchRank}
                loading={batchLoading}
                disabled={batchFiles.length === 0 || !batchJobDesc}
              />
              {batchError && (
                <div className="flex items-center p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                  {batchError}
                </div>
              )}
            </div>

            <div className="lg:col-span-3">
              {batchRankings.length > 0 ? (
                <RankingTable rankings={batchRankings} />
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-2xl p-8 text-center bg-gray-900/20">
                  <Users className="w-12 h-12 text-gray-700 mb-4" />
                  <p className="text-gray-500 font-medium">Rankings will appear here after processing</p>
                  <p className="text-gray-600 text-sm mt-1">Select multiple resumes and a job description to rank them</p>
                </div>
              )}
            </div>
          </div>
        </section>

      </main>

      <footer className="mt-20 py-8 border-t border-gray-800 text-center text-gray-600 text-sm">
        <p>&copy; 2026 SkillSync AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

// Internal icon for empty states
const Sparkles = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" height="24" viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M19 3v4"/><path d="M21 5h-4"/>
  </svg>
);

export default Home;
