import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Preview from './components/Preview';
import { DocSettings, ThemeType } from './types';
import { DEFAULT_CONTENT } from './constants';

const App: React.FC = () => {
  const [content, setContent] = useState<string>(DEFAULT_CONTENT);
  
  const [settings, setSettings] = useState<DocSettings>({
    title: 'דוח מעבדה: ניתוח מערכות לינאריות',
    showDate: true,
    theme: ThemeType.ACADEMIC,
    fontSize: 16,
    margins: 10,
    lineHeight: 1.5,
    direction: 'rtl',
  });

  const updateSettings = useCallback((newSettings: Partial<DocSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const handlePrintExport = useCallback(() => {
    const source = document.getElementById('preview-container');
    const target = document.getElementById('print-mount');

    if (!source || !target) {
      console.error("Print Error: Elements not found");
      return;
    }

    try {
      // 1. Clear previous content
      target.innerHTML = '';

      // 2. Clone the Preview Content
      const clone = source.cloneNode(true) as HTMLElement;
      
      // 3. CRITICAL: Remove layout-restricting classes from the root wrapper.
      // The original 'preview-container' has 'h-full' and 'overflow-y-auto' for screen scrolling.
      // These cause the print view to collapse to 0 height or hide content.
      clone.removeAttribute('class'); // Strip all Tailwind classes from the wrapper
      clone.removeAttribute('id');    // Remove ID to avoid duplicates
      
      // 4. Force Print-Friendly Styles on the wrapper
      clone.style.width = '100%';
      clone.style.height = 'auto';
      clone.style.overflow = 'visible';
      clone.style.position = 'relative';
      clone.style.display = 'block';

      // 5. Append and Print
      target.appendChild(clone);
      window.print();
      
    } catch (error) {
      console.error("Print logic failed:", error);
      alert("אירעה שגיאה בטעינת ההדפסה. אנא נסה שוב.");
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