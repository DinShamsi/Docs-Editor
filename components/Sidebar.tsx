import React, { useState, useRef } from 'react';
import { DocSettings, ThemeType, SidebarProps, CompressionLevel } from '../types';
import { AI_PROMPT_GUIDE } from '../constants';

const Sidebar: React.FC<SidebarProps> = ({ 
    settings, onUpdate, onPrint, onSave, onDownload, onExportHTML, onImport, onReset, 
    hasUnsavedChanges, viewMode, onViewModeChange, onToggleSidebar 
}) => {
  const [copyStatus, setCopyStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleChange = (key: keyof DocSettings, value: any) => {
    onUpdate({ [key]: value });
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(AI_PROMPT_GUIDE).then(() => {
      setCopyStatus('הועתק!');
      setTimeout(() => setCopyStatus(''), 2000);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                onImport(event.target.result as string);
            }
        };
        reader.readAsText(file);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Compression Levels Config
  const compressionOptions: { id: CompressionLevel, label: string, icon: string, desc: string }[] = [
      { id: 'none', label: 'רגיל', icon: 'fa-align-justify', desc: 'ללא דחיסה' },
      { id: 'low', label: 'קלה', icon: 'fa-compress', desc: 'נוח וחסכוני' },
      { id: 'medium', label: 'בינונית', icon: 'fa-compress-arrows-alt', desc: 'מומלץ' },
      { id: 'high', label: 'מקסי', icon: 'fa-minimize', desc: 'דחוס מאוד' },
  ];

  // Theme definition for UI
  const themes = [
    // --- NEW HEBREW SPECIALS ---
    { id: ThemeType.HEBREW_ACADEMIC, label: 'אקדמיה עברית', desc: 'דוד + פרנק ריהל', color: 'bg-blue-100 border-blue-300' },
    { id: ThemeType.HEBREW_TECH, label: 'הייטק ת"א', desc: 'היבו + אסיסטנט', color: 'bg-cyan-100 border-cyan-300' },
    { id: ThemeType.HEBREW_LITERATURE, label: 'ספרות ושירה', desc: 'נוטו + אלף', color: 'bg-orange-100 border-orange-300' },

    // --- NEW VARIETY (Readable & Hebrew) ---
    { id: ThemeType.MINIMALIST, label: 'מינימליסטי', desc: 'Arimo + Heebo', color: 'bg-gray-200 border-gray-400' },
    { id: ThemeType.NATURE, label: 'טבע ירוק', desc: 'Secular + Assistant', color: 'bg-green-100 border-green-300' },
    { id: ThemeType.OFFICIAL, label: 'ממלכתי', desc: 'Alef + Alef', color: 'bg-indigo-100 border-yellow-400' },

    // Existing Preserved
    { id: ThemeType.ACADEMIC, label: 'אקדמי רגיל', desc: 'David Libre', color: 'bg-gray-100' },
    { id: ThemeType.MODERN, label: 'מודרני', desc: 'Assistant', color: 'bg-blue-50' },
    { id: ThemeType.TECH, label: 'טכנולוגי', desc: 'Rubik', color: 'bg-purple-50' },
    { id: ThemeType.CLEAN, label: 'נקי', desc: 'Plex + Assistant', color: 'bg-slate-100' },
    { id: ThemeType.ELEGANT, label: 'יוקרתי', desc: 'Noto Serif', color: 'bg-rose-50' },
    { id: ThemeType.BOLD, label: 'נועז', desc: 'Secular + Heebo', color: 'bg-amber-50' },
    { id: ThemeType.SOFT, label: 'רך', desc: 'Varela + Rubik', color: 'bg-violet-50' },
    { id: ThemeType.NEWSPAPER, label: 'עיתון', desc: 'Frank Ruhl', color: 'bg-red-50' },
    
    // Remaining Extra
    { id: ThemeType.FOREST, label: 'יער', desc: 'Heebo + Assistant', color: 'bg-green-100' },
    { id: ThemeType.CRIMSON, label: 'ארגמן', desc: 'Spartan + Basker', color: 'bg-red-100' },
    { id: ThemeType.STANDARD, label: 'סטנדרטי', desc: 'Roboto + Open Sans', color: 'bg-blue-100' },
    { id: ThemeType.COFFEE, label: 'קפה', desc: 'Raleway + Nunito', color: 'bg-orange-100' },
    { id: ThemeType.IMPACT, label: 'אימפקט', desc: 'Archivo + Hind', color: 'bg-purple-200' },
    { id: ThemeType.SYSTEM, label: 'מערכת', desc: 'Ubuntu + Arimo', color: 'bg-indigo-50' },
  ];

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 h-full flex flex-col shadow-lg z-10 no-print">
      
      {/* Header & View Toggles */}
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <i className="fa-solid fa-file-pen text-blue-600"></i>
              עורך אקדמי
            </h1>
            <button 
                onClick={onToggleSidebar} 
                title="סגור סרגל (Ctrl+B)"
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
            >
                <i className="fa-solid fa-chevron-left"></i>
            </button>
        </div>
        
        {/* View Mode Toggle */}
        <div className="bg-gray-100 p-1 rounded-lg flex shadow-inner">
            <button 
                onClick={() => onViewModeChange('editor')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1 ${viewMode === 'editor' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                title="עורך בלבד"
            >
                <i className="fa-solid fa-pen"></i>
                <span className="hidden sm:inline">עריכה</span>
            </button>
            <button 
                onClick={() => onViewModeChange('split')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1 ${viewMode === 'split' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                title="מסך מפוצל"
            >
                <i className="fa-solid fa-columns"></i>
                <span className="hidden sm:inline">מפוצל</span>
            </button>
            <button 
                onClick={() => onViewModeChange('preview')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1 ${viewMode === 'preview' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                title="תצוגה בלבד"
            >
                <i className="fa-solid fa-eye"></i>
                <span className="hidden sm:inline">תצוגה</span>
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar" dir="rtl">
        
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
            
            <div className="flex flex-col gap-2 mt-2">
                {/* Date Checkbox */}
                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        id="showDate"
                        checked={settings.showDate}
                        onChange={(e) => handleChange('showDate', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="showDate" className="text-xs text-gray-600 cursor-pointer select-none">הצג תאריך</label>
                </div>

                {/* TOC Checkbox */}
                 <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        id="showTOC"
                        checked={settings.showTOC}
                        onChange={(e) => handleChange('showTOC', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="showTOC" className="text-xs text-gray-600 cursor-pointer select-none font-medium">הצג תוכן עניינים (H1, H2)</label>
                </div>
            </div>
        </div>

        {/* Smart Compression Selector */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100 shadow-sm">
            <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <i className="fa-solid fa-minimize text-indigo-600"></i>
                דחיסה חכמה (Layout)
            </label>
            
            <div className="grid grid-cols-4 gap-1 bg-white p-1 rounded-lg border border-indigo-100">
                {compressionOptions.map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => handleChange('compressionLevel', opt.id)}
                        className={`
                            flex flex-col items-center justify-center py-2 rounded-md transition-all
                            ${settings.compressionLevel === opt.id 
                                ? 'bg-indigo-600 text-white shadow-md' 
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                            }
                        `}
                        title={opt.desc}
                    >
                        <i className={`fa-solid ${opt.icon} text-sm mb-1`}></i>
                        <span className="text-[10px] font-bold">{opt.label}</span>
                    </button>
                ))}
            </div>
             <p className="text-[10px] text-gray-500 mt-2 text-center">
                {compressionOptions.find(o => o.id === settings.compressionLevel)?.desc}
            </p>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-2 gap-3">
             {/* Save */}
             <button
                type="button"
                onClick={onSave}
                title="Ctrl+S"
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
                <span className="text-sm">{hasUnsavedChanges ? 'שמור' : 'נשמר'}</span>
            </button>

            {/* Print */}
            <button
                type="button"
                onClick={onPrint}
                title="Ctrl+P"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-2 rounded-lg shadow transition-colors flex items-center justify-center gap-2 active:scale-95 transform"
            >
                <i className="fa-solid fa-print"></i>
                <span className="text-sm">הדפס</span>
            </button>

             {/* Export HTML */}
             <button
                type="button"
                onClick={onExportHTML}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium py-2 px-2 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
            >
                <i className="fa-brands fa-html5 text-orange-600"></i>
                <span className="text-sm">HTML</span>
            </button>

             {/* Download Source */}
             <button
                type="button"
                onClick={onDownload}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium py-2 px-2 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
            >
                <i className="fa-solid fa-file-arrow-down text-sky-500"></i>
                <span className="text-sm">מקור</span>
            </button>

            {/* Import */}
             <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".md,.txt,.markdown" 
                onChange={handleFileChange}
            />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="col-span-2 w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium py-2 px-2 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
            >
                <i className="fa-solid fa-file-import text-orange-500"></i>
                <span className="text-sm">טען קובץ</span>
            </button>
        </div>

        {/* New Document Button */}
        <button
            type="button"
            onClick={onReset}
            className="w-full bg-white hover:bg-red-50 text-red-600 border border-red-200 font-medium py-2 px-2 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
        >
            <i className="fa-solid fa-trash-can"></i>
            מסמך חדש
        </button>
        
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
        <div className={`space-y-6 border-t border-gray-200 pt-6 transition-opacity ${settings.compressionLevel !== 'none' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <h3 className="text-sm font-semibold text-gray-900 flex justify-between">
            הגדרות פריסה
            {settings.compressionLevel !== 'none' && <span className="text-xs text-indigo-600 font-normal">(אוטומטי בדחיסה)</span>}
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
                  RTL
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('direction', 'ltr')}
                  className={`px-4 py-2 text-sm font-medium border border-gray-200 border-l-0 rounded-l-lg flex-1 ${
                    settings.direction === 'ltr' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  LTR
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

      </div>
    </div>
  );
};

export default Sidebar;