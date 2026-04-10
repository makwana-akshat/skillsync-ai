import React from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

const ResultCard = ({ result }) => {
  if (!result) return null;

    const { score, matched_required, matched_optional, missing_required, missing_optional, explanation } = result;

  return (
    <div className="glass-card animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Analysis Result</h2>
          <p className="text-gray-400">Match evaluation based on job requirements</p>
        </div>
        <div className="flex flex-col items-center justify-center p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20">
          <span className="text-5xl font-extrabold text-blue-400 leading-none">{score}%</span>
          <span className="text-xs font-medium text-blue-300/60 uppercase tracking-wider mt-2">Match Score</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Matched Skills */}
        <div className="space-y-6">
          <div>
            <h3 className="flex items-center text-sm font-semibold text-green-400 uppercase tracking-wider mb-3">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Matched Required
            </h3>
            <div className="flex flex-wrap gap-2">
              {matched_required?.map((skill, index) => (
                <div key={index} className="flex flex-col px-3 py-2 bg-green-500/10 text-green-300 rounded-xl border border-green-500/20">
                  <span className="text-sm font-semibold">{skill.name}</span>
                  {skill.resume_level && <span className="text-[10px] opacity-70 uppercase tracking-tighter">{skill.resume_level}</span>}
                </div>
              ))}
              {(!matched_required || matched_required.length === 0) && (
                <p className="text-gray-500 text-sm italic">No required matches found</p>
              )}
            </div>
          </div>
          <div>
            <h3 className="flex items-center text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Matched Optional
            </h3>
            <div className="flex flex-wrap gap-2">
              {matched_optional?.map((skill, index) => (
                <div key={index} className="flex flex-col px-3 py-2 bg-blue-500/10 text-blue-300 rounded-xl border border-blue-500/20">
                  <span className="text-sm font-semibold">{skill.name}</span>
                  {skill.resume_level && <span className="text-[10px] opacity-70 uppercase tracking-tighter">{skill.resume_level}</span>}
                </div>
              ))}
              {(!matched_optional || matched_optional.length === 0) && (
                <p className="text-gray-500 text-sm italic">No optional matches found</p>
              )}
            </div>
          </div>
        </div>

        {/* Missing Skills */}
        <div className="space-y-6">
          <div>
            <h3 className="flex items-center text-sm font-bold text-red-500 uppercase tracking-wider mb-3 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">
              <XCircle className="w-4 h-4 mr-2" />
              Missing Required (Critical)
            </h3>
            <div className="flex flex-wrap gap-2">
              {missing_required?.map((skill, index) => (
                <span key={index} className="px-3 py-1.5 bg-red-500/20 text-red-300 text-xs font-bold rounded-full border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                  {skill}
                </span>
              ))}
              {(!missing_required || missing_required.length === 0) && (
                <p className="text-green-500/80 text-sm italic font-medium">All required skills met!</p>
              )}
            </div>
          </div>
          <div>
            <h3 className="flex items-center text-sm font-semibold text-orange-400 uppercase tracking-wider mb-3">
              <XCircle className="w-4 h-4 mr-2" />
              Missing Optional
            </h3>
            <div className="flex flex-wrap gap-2">
              {missing_optional?.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-orange-500/10 text-orange-300 text-xs font-medium rounded-full border border-orange-500/20">
                  {skill}
                </span>
              ))}
              {(!missing_optional || missing_optional.length === 0) && (
                <p className="text-gray-500 text-sm italic">All optional requirements covered</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="p-5 bg-gray-800/50 rounded-xl border border-gray-700/50">
        <h3 className="flex items-center text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
          <Info className="w-4 h-4 mr-2" />
          AI Explanation
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
          {explanation}
        </p>
      </div>
    </div>
  );
};

export default ResultCard;
