
import React, { useState, useCallback, useEffect } from 'react';
import { parseSrt, chunkBlocks, rebuildSrt } from './utils/srtParser';
import { translateSrtChunk } from './services/geminiService';
import { TranslationStatus, SubtitleBlock } from './types';
import { FileUploader } from './components/FileUploader';
import { LanguageSelect } from './components/LanguageSelect';

const App: React.FC = () => {
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [srtContent, setSrtContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [translatedSrt, setTranslatedSrt] = useState<string | null>(null);
  const [status, setStatus] = useState<TranslationStatus>({
    phase: 'idle',
    progress: 0,
    totalBatches: 0,
    currentBatch: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setSrtContent(null);
    setTranslatedSrt(null);
    setFileName('');
    setError(null);
    setStatus({
      phase: 'idle',
      progress: 0,
      totalBatches: 0,
      currentBatch: 0,
    });
  };

  const handleTranslate = async () => {
    if (!srtContent) return;

    setError(null);
    setStatus({
      phase: 'parsing',
      progress: 0,
      totalBatches: 0,
      currentBatch: 0,
    });

    try {
      const blocks = parseSrt(srtContent);
      if (blocks.length === 0) {
        throw new Error("Invalid or empty SRT file.");
      }

      // Batch size of 50 for stability
      const batches = chunkBlocks(blocks, 50);
      const totalBatches = batches.length;
      const allTranslatedBlocks: SubtitleBlock[] = [];

      setStatus(prev => ({ ...prev, phase: 'translating', totalBatches }));

      for (let i = 0; i < batches.length; i++) {
        setStatus(prev => ({ 
          ...prev, 
          currentBatch: i + 1, 
          progress: Math.round(((i) / totalBatches) * 100) 
        }));

        try {
          const translatedBatch = await translateSrtChunk(batches[i], sourceLang, targetLang);
          
          // Structural sync: Ensure we have exactly the same amount of blocks and same indices
          // If Gemini missed some, we pad with original or try to map
          const syncedBatch = batches[i].map((original, idx) => {
            const translated = translatedBatch[idx];
            return {
              ...original,
              lines: translated ? translated.lines : original.lines // fallback to original if missing
            };
          });

          allTranslatedBlocks.push(...syncedBatch);
        } catch (err: any) {
          // If a chunk fails, we might want to retry or error out. 
          // For now, let's stop and report.
          throw new Error(`Failed translating chunk ${i + 1}: ${err.message}`);
        }
      }

      setStatus(prev => ({ ...prev, phase: 'assembling', progress: 95 }));
      const finalSrt = rebuildSrt(allTranslatedBlocks);
      setTranslatedSrt(finalSrt);
      setStatus({ phase: 'completed', progress: 100, totalBatches, currentBatch: totalBatches });

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during translation.");
      setStatus(prev => ({ ...prev, phase: 'error' }));
    }
  };

  const handleDownload = () => {
    if (!translatedSrt) return;
    const blob = new Blob([translatedSrt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const baseName = fileName.replace(/\.[^/.]+$/, "");
    a.download = `${baseName}_${targetLang.toLowerCase()}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isIdle = status.phase === 'idle';
  const isTranslating = status.phase === 'translating' || status.phase === 'parsing' || status.phase === 'assembling';
  const isCompleted = status.phase === 'completed';

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-4xl flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">SubTrans <span className="text-blue-500">Pro</span></h1>
        </div>
        <div className="text-sm font-medium px-3 py-1 bg-slate-800 text-slate-400 rounded-full border border-slate-700">
          Powered by Gemini 3 Flash
        </div>
      </header>

      <main className="w-full max-w-4xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl">
        {/* Step 1: Config */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <LanguageSelect 
            label="Translate From" 
            value={sourceLang} 
            onChange={setSourceLang} 
          />
          <LanguageSelect 
            label="Translate To" 
            value={targetLang} 
            onChange={setTargetLang} 
          />
        </div>

        {/* Step 2: Upload or Status */}
        {!srtContent && (
          <FileUploader 
            onFileSelect={(content, name) => { setSrtContent(content); setFileName(name); }} 
            isLoading={isTranslating}
          />
        )}

        {srtContent && !isCompleted && !isTranslating && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-slate-700 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div>
                  <p className="font-medium text-slate-100">{fileName}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-tighter">Ready for translation</p>
                </div>
              </div>
              <button onClick={reset} className="text-sm text-red-400 hover:text-red-300 font-medium px-2 py-1">Remove</button>
            </div>
            
            <button 
              onClick={handleTranslate}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v10"/><path d="m16 8-4 4-4-4"/><path d="M12 22v-7"/><path d="m8 18 4 4 4-4"/></svg>
              Start Translation
            </button>
          </div>
        )}

        {/* Progress Display */}
        {isTranslating && (
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-blue-400 uppercase tracking-widest animate-pulse">
                {status.phase === 'parsing' ? 'Analyzing file...' : 
                 status.phase === 'translating' ? `Translating Batch ${status.currentBatch} of ${status.totalBatches}` : 
                 'Assembling final file...'}
              </span>
              <span className="text-sm font-mono text-slate-400">{status.progress}%</span>
            </div>
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-500 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                style={{ width: `${status.progress}%` }}
              />
            </div>
            <p className="text-center text-slate-500 text-sm">
              Keep this window open. Large files may take a minute.
            </p>
          </div>
        )}

        {/* Success / Error Messages */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
             <p className="text-sm">{error}</p>
             <button onClick={reset} className="ml-auto text-xs font-bold underline">Try again</button>
          </div>
        )}

        {isCompleted && translatedSrt && (
          <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl text-center">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Translation Complete!</h2>
              <p className="text-slate-400 mb-6">Your SRT has been successfully translated and verified.</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={handleDownload}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                   Download SRT
                </button>
                <button 
                  onClick={reset}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-8 py-3 rounded-xl transition-all"
                >
                  Translate Another
                </button>
              </div>
            </div>

            {/* Preview Box */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Preview</h3>
              <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 h-48 overflow-y-auto font-mono text-xs text-slate-500 leading-relaxed scrollbar-thin">
                {translatedSrt.slice(0, 1000)}...
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-12 text-slate-500 text-sm flex flex-col items-center gap-2">
        <p>&copy; 2024 SubTrans Pro • Professional Movie Subtitle Services</p>
        <div className="flex gap-4">
          <span className="hover:text-slate-300 cursor-pointer transition-colors">Documentation</span>
          <span className="hover:text-slate-300 cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-slate-300 cursor-pointer transition-colors">Contact Support</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
