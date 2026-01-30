import React, { useState } from 'react';
import { DocSettings, ThemeType } from '../types';
import { AI_PROMPT_GUIDE } from '../constants';

interface SidebarProps {
  settings: DocSettings;
  onUpdate: (newSettings: Partial<DocSettings>) => void;
  onExport: () => void;
  onPrint: () => void;
  onSave: () => void;
  hasUnsavedChanges: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ settings, onUpdate, onExport, onPrint, onSave, hasUnsavedChanges }) => {
  const [copyStatus, setCopyStatus] = useState<string>('');
  
  const handleChange = (key: keyof DocSettings, value: any) => {
    onUpdate({ [key]: value });
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(AI_PROMPT_GUIDE).then(() => {
      setCopyStatus('הועתק!');
      setTimeout(() => setCopyStatus(''), 2000);
    });
  };

  // Theme definition for UI
  const themes = [
    { id: ThemeType.ACADEMIC, label: 'אקדמי', desc: 'David Libre', color: 'bg-gray-100' },
    { id: ThemeType.CLASSIC, label: 'קלאסי', desc: 'Frank Ruhl', color: 'bg-stone-200' },
    { id: ThemeType.MODERN, label: 'מודרני', desc: 'Assistant', color: 'bg-blue-50' },
    { id: ThemeType.TECH, label: 'הייטק', desc: 'Rubik', color: 'bg-purple-50' },
    { id: ThemeType.CLEAN, label: 'נקי', desc: 'Plex Sans + Assistant', color: 'bg-slate-100' },
    { id: ThemeType.ELEGANT, label: 'יוקרתי', desc: 'Noto Serif + Assistant', color: 'bg-rose-50' },
    { id: ThemeType.BOLD, label: 'נועז', desc: 'Secular + Heebo', color: 'bg-amber-50' },
    { id: ThemeType.SOFT, label: 'רך', desc: 'Varela + Rubik', color: 'bg-violet-50' },
    { id: ThemeType.NEWSPAPER, label: 'עיתון', desc: 'Frank Ruhl + Heebo', color: 'bg-red-50' },
    { id: ThemeType.STARTUP, label: 'סטארטאפ', desc: 'Heebo', color: 'bg-pink-50' },
    { id: ThemeType.NATURE, label: 'טבע', desc: 'Alef', color: 'bg-green-50' },
  ];

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 h-full flex flex-col shadow-lg z-10 no-print">
      <div className="p-6 border-b border-gray-200 bg-white">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <i className="fa-solid fa-file-pen text-blue-600"></i>
          עורך אקדמי
        </h1>
        <p className="text-gray-500 text-sm mt-1">עריכה, תצוגה מקדימה וייצוא</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8" dir="rtl">
        
        {/* Document Title Input */}
        <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <i className="fa-solid fa-heading"></i>
                כותרת המסמך
            </label>
            <input 
                type="text"
                value={settings.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="הכנס כותרת ראשית..."
                className="w-full p-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
            />
            <div className="flex justify-between items-start">
                <p className="text-[10px] text-gray-400">כותרת זו תופיע בראש הדוח</p>
                <div className="flex items-center gap-1.5">
                    <input 
                        type="checkbox" 
                        id="showDate"
                        checked={settings.showDate}
                        onChange={(e) => handleChange('showDate', e.target.checked)}
                        className="w-3.5 h-3.5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="showDate" className="text-xs text-gray-600 cursor-pointer select-none">תאריך</label>
                </div>
            </div>
        </div>

        {/* Smart Compression Toggle */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-full ${settings.isCompressed ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'} transition-colors`}>
                        <i className="fa-solid fa-minimize"></i>
                    </div>
                    <div>
                        <span className="block text-sm font-bold text-gray-800">דחיסה חכמה</span>
                        <span className="text-[10px] text-gray-500 block leading-tight">מקסימום תוכן במינימום מקום (2 טורים)</span>
                    </div>
                </div>
                
                <button 
                    onClick={() => handleChange('isCompressed', !settings.isCompressed)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${settings.isCompressed ? 'bg-indigo-600' : 'bg-gray-300'}`}
                >
                    <span
                        className={`${settings.isCompressed ? '-translate-x-6' : '-translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                </button>
            </div>
        </div>

        {/* Actions Group */}
        <div className="grid grid-cols-2 gap-3">
            {/* Save Button */}
             <button
                type="button"
                onClick={onSave}
                className={`w-full font-bold py-3 px-2 rounded-lg shadow transition-all flex items-center justify-center gap-2 active:scale-95 transform relative
                   ${hasUnsavedChanges 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                      : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                   }`}
            >
                {hasUnsavedChanges && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border border-white"></span>
                )}
                <i className={`fa-solid fa-floppy-disk ${hasUnsavedChanges ? 'text-white' : 'text-emerald-600'}`}></i>
                {hasUnsavedChanges ? 'שמור' : 'נשמר'}
            </button>

            {/* Print Button */}
            <button
                type="button"
                onClick={onPrint}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-2 rounded-lg shadow transition-colors flex items-center justify-center gap-2 active:scale-95 transform"
            >
                <i className="fa-solid fa-print"></i>
                הדפס
            </button>
        </div>
        
        {/* AI Prompt Button */}
        <button
            type="button"
            onClick={handleCopyPrompt}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow transition-colors flex items-center justify-center gap-2 text-sm mt-0"
        >
            <i className="fa-solid fa-robot"></i>
            {copyStatus || 'העתק הנחיה ל-AI'}
        </button>

        {/* Theme Selection */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <i className="fa-solid fa-paintbrush"></i>
            ערכת עיצוב
          </label>
          <div className="grid grid-cols-2 gap-2">
            {themes.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleChange('theme', theme.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-md border transition-all ${
                  settings.theme === theme.id
                    ? 'ring-2 ring-blue-500 border-transparent shadow-md transform scale-105'
                    : 'border-gray-200 hover:bg-gray-100 hover:shadow-sm'
                } ${settings.theme === theme.id ? 'bg-white' : theme.color}`}
              >
                <span className="text-sm font-bold text-gray-800">
                  {theme.label}
                </span>
                <span className="text-[10px] text-gray-500 mt-1 text-center leading-tight">{theme.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Layout Settings (Disabled if Compressed) */}
        <div className={`space-y-6 border-t border-gray-200 pt-6 transition-opacity ${settings.isCompressed ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <h3 className="text-sm font-semibold text-gray-900 flex justify-between">
            הגדרות פריסה
            {settings.isCompressed && <span className="text-xs text-indigo-600 font-normal">(מבוטל במצב דחיסה)</span>}
          </h3>

          {/* Direction */}
          <div className="space-y-2">
             <label className="text-xs text-gray-500">כיוון טקסט</label>
             <div className="flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  onClick={() => handleChange('direction', 'rtl')}
                  className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-r-lg flex-1 ${
                    settings.direction === 'rtl' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  RTL (מימין)
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('direction', 'ltr')}
                  className={`px-4 py-2 text-sm font-medium border border-gray-200 border-l-0 rounded-l-lg flex-1 ${
                    settings.direction === 'ltr' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  LTR (משמאל)
                </button>
             </div>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-xs text-gray-500">גודל פונט</label>
              <span className="text-xs font-mono bg-gray-100 px-1 rounded">{settings.fontSize}px</span>
            </div>
            <input
              type="range"
              min="12"
              max="24"
              step="1"
              value={settings.fontSize}
              onChange={(e) => handleChange('fontSize', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Margins */}
          <div className="space-y-2">
             <div className="flex justify-between">
              <label className="text-xs text-gray-500">שוליים (Padding)</label>
              <span className="text-xs font-mono bg-gray-100 px-1 rounded">{settings.margins}</span>
            </div>
            <input
              type="range"
              min="0"
              max="16"
              step="1"
              value={settings.margins}
              onChange={(e) => handleChange('margins', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

           {/* Line Spacing */}
           <div className="space-y-2">
             <div className="flex justify-between">
              <label className="text-xs text-gray-500">מרווח שורות</label>
              <span className="text-xs font-mono bg-gray-100 px-1 rounded">{settings.lineHeight}</span>
            </div>
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.1"
              value={settings.lineHeight}
              onChange={(e) => handleChange('lineHeight', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        {/* Legend for Special Classes */}
        <div className="border-t border-gray-200 pt-6 space-y-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">מקרא מחלקות (CSS Classes)</h3>
          <div className="text-xs text-gray-600 space-y-1">
             <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-100 border border-blue-400"></span>
                <code className="bg-gray-100 px-1 rounded text-blue-700">.theory</code>
                <span>הגדרה/תיאוריה</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-100 border border-green-400"></span>
                <code className="bg-gray-100 px-1 rounded text-green-700">.solution</code>
                <span>פתרון תרגיל</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-400"></span>
                <code className="bg-gray-100 px-1 rounded text-yellow-700">.important</code>
                <span>הדגשה חשובה</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="w-3 h-3 border border-dashed border-gray-400"></span>
                <code className="bg-gray-100 px-1 rounded text-gray-700">.page-break</code>
                <span>מעבר עמוד</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Sidebar;