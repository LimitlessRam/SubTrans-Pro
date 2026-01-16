
import React, { useRef } from 'react';

interface FileUploaderProps {
  onFileSelect: (content: string, fileName: string) => void;
  isLoading: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onFileSelect(content, file.name);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="w-full">
      <div 
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`group border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center transition-all cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-slate-800 rounded-full group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>
            </svg>
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-200">Click to upload or drag SRT</p>
            <p className="text-sm text-slate-400 mt-1">Maximum recommended size: 500kb for best results</p>
          </div>
        </div>
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".srt"
          className="hidden"
          disabled={isLoading}
        />
      </div>
    </div>
  );
};
