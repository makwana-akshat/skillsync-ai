import React from 'react';

const JobInput = ({ value, onChange }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-400 mb-2">
        Job Description
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste job description here..."
        className="w-full h-48 bg-gray-900 border border-gray-700 rounded-xl p-4 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all resize-none"
        required
      />
      {!value && (
        <p className="mt-1 text-xs text-red-400/80">Job description is required</p>
      )}
    </div>
  );
};

export default JobInput;
