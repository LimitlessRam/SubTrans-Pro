
import React from 'react';
import { SUPPORTED_LANGUAGES } from '../types';

interface LanguageSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const LanguageSelect: React.FC<LanguageSelectProps> = ({ label, value, onChange }) => {
  return (
    <div className="flex flex-col gap-2 flex-1">
      <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer hover:bg-slate-700"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.name}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};
