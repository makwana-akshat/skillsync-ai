import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

const AnalyzeButton = ({ onClick, loading, disabled, text = "Analyze Resume" }) => {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`
        w-full py-4 px-6 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300
        ${loading || disabled 
          ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' 
          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg lg:hover:scale-[1.02] active:scale-[0.98]'
        }
      `}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <Sparkles className="w-5 h-5" />
          <span>{text}</span>
        </>
      )}
    </button>
  );
};

export default AnalyzeButton;
