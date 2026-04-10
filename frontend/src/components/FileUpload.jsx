import React from 'react';
import { Upload, FileText, X } from 'lucide-react';

const FileUpload = ({ selectedFiles, onFileSelect, onRemove, multiple = false }) => {
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onFileSelect(multiple ? files : files[0]);
    }
  };

  const currentFiles = multiple ? selectedFiles : (selectedFiles ? [selectedFiles] : []);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-400 mb-2">
        {multiple ? 'Upload Resumes' : 'Upload Resume'} (PDF)
      </label>
      <div className="relative border-2 border-dashed border-gray-700 rounded-xl p-8 transition-colors hover:border-blue-500/50 group bg-gray-900/50">
        <input
          type="file"
          accept=".pdf"
          multiple={multiple}
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3 bg-blue-500/10 rounded-full group-hover:bg-blue-500/20 transition-colors">
            <Upload className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-center">
            <p className="text-gray-200 font-medium">Click to upload or drag and drop</p>
            <p className="text-gray-500 text-sm mt-1">PDF files only</p>
          </div>
        </div>
      </div>

      {currentFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {currentFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center space-x-3 truncate">
                <FileText className="w-5 h-5 text-blue-400 shrink-0" />
                <span className="text-gray-300 text-sm truncate">{file.name}</span>
              </div>
              <button
                onClick={() => onRemove(index)}
                className="p-1 hover:bg-gray-700 rounded-md transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
