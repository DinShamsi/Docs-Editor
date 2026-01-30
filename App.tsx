import React, { useState, useCallback, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Preview from './components/Preview';
import { DocSettings, ThemeType } from './types';
import { DEFAULT_CONTENT, LOCAL_STORAGE_KEY } from './constants';

const App: React.FC = () => {
  const [content, setContent] = useState<string>(DEFAULT_CONTENT);
  
  const [settings, setSettings] = useState<DocSettings>({
    title: 'דוח מעבדה: ניתוח מערכות לינאריות',
    showDate: true,
    showTOC: false, // Default: No TOC
    theme: ThemeType.ACADEMIC,
    fontSize: 16,
    margins: 10,
    lineHeight: 1.5,
    direction: 'rtl',
    isCompressed: false, // Default: Off
  });

  // Keep track of the last saved state to determine if dirty
  const [lastSaved, setLastSaved] = useState<{content: string, settings: DocSettings} | null>(null);

  // 1. Load from LocalStorage on Mount
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.content && parsed.settings) {
          setContent(parsed.content);
          setSettings(parsed.settings);
          setLastSaved(parsed); // Sync initial state
        }
      } catch (e) {
        console.error("Failed to parse saved data", e);
        // If error, we just stick to defaults, but set lastSaved to defaults so isDirty logic works
        setLastSaved({ content: DEFAULT_CONTENT, settings: settings });
      }
    } else {
        // No saved data, set last saved to current defaults
        setLastSaved({ content: DEFAULT_CONTENT, settings: settings });
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<DocSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // 2. Save Functionality
  const handleSave = useCallback(() => {
    const dataToSave = { content, settings };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    setLastSaved(dataToSave);
  }, [content, settings]);

  // 3. Check for unsaved changes
  const hasUnsavedChanges = lastSaved 
    ? (content !== lastSaved.content || JSON.stringify(settings) !== JSON.stringify(lastSaved.settings))
    : false;

  // 4. Warn on exit if unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; // Standard for Chrome/Firefox
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const handlePrintExport = useCallback(() => {
    const source = document.getElementById('preview-container');
    const target = document.getElementById('print-mount');

    if (!source || !target) {
      console.error("Print Error: Elements not found");
      return;
    }

    const cleanup = () => {
      if (target) {
        target.innerHTML = '';
      }
      window.removeEventListener('afterprint', cleanup);
    };

    window.addEventListener('afterprint', cleanup);

    try {
      target.innerHTML = '';
      const clone = source.cloneNode(true) as HTMLElement;
      
      // Clean up UI-specific attributes
      clone.removeAttribute('class');
      clone.removeAttribute('id');
      
      // Ensure print container styles
      clone.style.width = '100%';
      clone.style.height = 'auto';
      clone.style.overflow = 'visible';
      clone.style.position = 'relative';
      clone.style.display = 'block';

      // --- SANITIZATION FOR PRINTING ---
      // Removes iframes, scripts, and browser extension artifacts (Grammarly, etc.) that cause "red dots"
      const elementsToRemove = clone.querySelectorAll('iframe, script, [data-grammarly-shadow-root], .grammarly-extension, grammarly-extension');
      elementsToRemove.forEach(el => el.remove());
      
      target.appendChild(clone);
      
      // Small delay to ensure styles render before print dialog
      setTimeout(() => {
        window.print();
      }, 50);
      
    } catch (error) {
      console.error("Print logic failed:", error);
      alert("אירעה שגיאה בטעינת ההדפסה. אנא נסה שוב.");
      cleanup();
    }
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100 font-sans" id="main-app-container">
      
      {/* Sidebar - Controls */}
      <div className="flex-none z-50 h-full no-print shadow-xl">
        <Sidebar 
          settings={settings} 
          onUpdate={updateSettings}
          onExport={handlePrintExport} 
          onPrint={handlePrintExport}
          onSave={handleSave}
          hasUnsavedChanges={hasUnsavedChanges}
        />
      </div>

      {/* Main Split Screen Area */}
      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
        
        {/* Preview Area (Left) */}
        <div className="flex-1 h-1/2 md:h-full relative z-0 order-2 md:order-1 border-r border-gray-300">
          <Preview content={content} settings={settings} />
        </div>

        {/* Editor Area (Right) */}
        <div className="flex-1 h-1/2 md:h-full order-1 md:order-2 shadow-2xl z-10 no-print">
          <Editor 
            value={content} 
            onChange={setContent} 
            direction={settings.direction} 
          />
        </div>

      </div>
    </div>
  );
};

export default App;