import React, { useState, useCallback, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Preview from './components/Preview';
import { DocSettings, ThemeType, ViewMode, ToastNotification } from './types';
import { DEFAULT_CONTENT, LOCAL_STORAGE_KEY } from './constants';

const App: React.FC = () => {
  const [content, setContent] = useState<string>(DEFAULT_CONTENT);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Refs for Scroll Sync
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<'editor' | 'preview' | null>(null);

  const [settings, setSettings] = useState<DocSettings>({
    title: 'דוח מעבדה: ניתוח מערכות לינאריות',
    showDate: true,
    showTOC: false,
    theme: ThemeType.ACADEMIC,
    fontSize: 16,
    margins: 10,
    lineHeight: 1.5,
    direction: 'rtl',
    isCompressed: false,
  });

  const [lastSaved, setLastSaved] = useState<{content: string, settings: DocSettings} | null>(null);

  // --- Toast Logic ---
  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // --- Resize Handler ---
  useEffect(() => {
    const handleResize = () => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        if (mobile && viewMode === 'split') {
            setViewMode('editor'); // Force single view on mobile
        }
    };
    window.addEventListener('resize', handleResize);
    // Initial check
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.content && parsed.settings) {
          setContent(parsed.content);
          setSettings(parsed.settings);
          setLastSaved(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved data", e);
        setLastSaved({ content: DEFAULT_CONTENT, settings: settings });
      }
    } else {
        setLastSaved({ content: DEFAULT_CONTENT, settings: settings });
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<DocSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const handleSave = useCallback(() => {
    const dataToSave = { content, settings };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    setLastSaved(dataToSave);
    addToast('המסמך נשמר בהצלחה', 'success');
  }, [content, settings]);

  const hasUnsavedChanges = lastSaved 
    ? (content !== lastSaved.content || JSON.stringify(settings) !== JSON.stringify(lastSaved.settings))
    : false;

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        // Save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            handleSave();
        }
        // Print
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            handlePrintExport();
        }
        // Toggle Sidebar (Zen Mode)
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            setIsSidebarOpen(prev => !prev);
            addToast(isSidebarOpen ? 'מצב זן: פעיל' : 'סרגל כלים: מוצג', 'info');
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, isSidebarOpen]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; 
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // --- File Operations ---
  const handleDownloadSource = useCallback(() => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${settings.title || 'document'}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('קובץ המקור הורד למחשב', 'info');
  }, [content, settings.title]);

  const handleImportSource = useCallback((newContent: string) => {
      setContent(newContent);
      addToast('הקובץ נטען בהצלחה', 'success');
  }, []);

  const handleReset = useCallback(() => {
      if (window.confirm('האם אתה בטוח שברצונך לאפס את המסמך? כל התוכן הנוכחי יימחק.')) {
          setContent('');
          addToast('המסמך אופס', 'info');
      }
  }, []);

  // --- Drag & Drop Logic ---
  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith('.md') || file.name.endsWith('.txt') || file.name.endsWith('.markdown'))) {
          const reader = new FileReader();
          reader.onload = (event) => {
              if (event.target?.result) {
                  if (hasUnsavedChanges) {
                      if (!window.confirm('יש לך שינויים שלא נשמרו. האם להחליף את התוכן?')) return;
                  }
                  handleImportSource(event.target.result as string);
              }
          };
          reader.readAsText(file);
      } else {
          addToast('אנא גרור קובץ טקסט תקין (.md / .txt)', 'error');
      }
  };

  const handlePrintExport = useCallback(() => {
    const source = document.getElementById('preview-container');
    const target = document.getElementById('print-mount');

    if (!source || !target) {
      console.error("Print Error: Elements not found");
      addToast('שגיאה בהכנה להדפסה', 'error');
      return;
    }

    addToast('מכין להדפסה...', 'info');

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
      clone.removeAttribute('class');
      clone.removeAttribute('id');
      clone.style.width = '100%';
      clone.style.height = 'auto';
      clone.style.overflow = 'visible';
      clone.style.position = 'relative';
      clone.style.display = 'block';

      const elementsToRemove = clone.querySelectorAll('iframe, script, [data-grammarly-shadow-root], .grammarly-extension, grammarly-extension');
      elementsToRemove.forEach(el => el.remove());
      
      target.appendChild(clone);
      
      setTimeout(() => {
        window.print();
      }, 50);
      
    } catch (error) {
      console.error("Print logic failed:", error);
      addToast('שגיאה בתהליך ההדפסה', 'error');
      cleanup();
    }
  }, []);

  // --- Scroll Sync Logic ---
  const handleEditorScroll = (percentage: number) => {
      if (isScrollingRef.current === 'preview') return;
      isScrollingRef.current = 'editor';
      
      if (previewContainerRef.current) {
          const targetScroll = (previewContainerRef.current.scrollHeight - previewContainerRef.current.clientHeight) * percentage;
          previewContainerRef.current.scrollTop = targetScroll;
      }
      
      clearTimeout((window as any).scrollTimeout);
      (window as any).scrollTimeout = setTimeout(() => isScrollingRef.current = null, 100);
  };

  const handlePreviewScroll = (e: React.UIEvent<HTMLDivElement>) => {
      if (isScrollingRef.current === 'editor') return;
      isScrollingRef.current = 'preview';
      
      const el = e.currentTarget;
      const percentage = el.scrollTop / (el.scrollHeight - el.clientHeight);
      
      if (editorRef.current) {
          const targetScroll = (editorRef.current.scrollHeight - editorRef.current.clientHeight) * percentage;
          editorRef.current.scrollTop = targetScroll;
      }
      
      clearTimeout((window as any).scrollTimeout);
      (window as any).scrollTimeout = setTimeout(() => isScrollingRef.current = null, 100);
  };

  // Mobile: Handle view switching manually if needed
  const toggleMobileView = () => {
      setViewMode(prev => prev === 'editor' ? 'preview' : 'editor');
  };

  return (
    <div 
        className="flex h-screen w-screen overflow-hidden bg-gray-100 font-sans relative" 
        id="main-app-container"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
    >
      
      {/* Toast Container */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none w-full max-w-xs px-2">
        {toasts.map(toast => (
          <div key={toast.id} className={`
             px-4 py-3 rounded-full shadow-xl text-white text-sm font-bold flex items-center justify-center gap-2 animate-bounce-in
             ${toast.type === 'success' ? 'bg-emerald-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}
          `}>
             <i className={`fa-solid ${toast.type === 'success' ? 'fa-check' : toast.type === 'error' ? 'fa-circle-exclamation' : 'fa-info-circle'}`}></i>
             <span className="truncate">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Drag Overlay */}
      {isDragging && (
          <div className="fixed inset-0 z-[200] bg-blue-600/90 flex flex-col items-center justify-center text-white backdrop-blur-sm animate-fade-in pointer-events-none p-4 text-center">
              <i className="fa-solid fa-cloud-arrow-up text-9xl mb-8 animate-bounce"></i>
              <h2 className="text-4xl font-bold">שחרר קובץ לטעינה</h2>
              <p className="mt-4 text-xl opacity-80">תומך בקבצי Markdown ו-Text</p>
          </div>
      )}

      {/* Floating Controls for Mobile */}
      <div className="fixed bottom-6 left-6 z-[60] flex gap-3">
          {/* Sidebar Toggle */}
          {!isSidebarOpen && (
            <button 
                onClick={() => setIsSidebarOpen(true)}
                title="פתח תפריט"
                className="bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            >
                <i className="fa-solid fa-bars text-xl"></i>
            </button>
          )}

          {/* Mobile View Switcher (Only visible on mobile) */}
          {isMobile && !isSidebarOpen && (
              <button 
                onClick={toggleMobileView}
                title={viewMode === 'editor' ? 'עבור לתצוגה מקדימה' : 'עבור לעורך'}
                className="bg-indigo-600 hover:bg-indigo-700 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              >
                  <i className={`fa-solid ${viewMode === 'editor' ? 'fa-eye' : 'fa-pen'} text-xl`}></i>
              </button>
          )}
      </div>

      {/* Mobile Backdrop */}
      {isMobile && isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-[40] backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container - Responsive Behavior */}
      <div 
        className={`
            h-full bg-white shadow-xl z-[50] transition-all duration-300 ease-in-out flex-none overflow-hidden
            ${isMobile ? 'fixed top-0 right-0 bottom-0' : 'relative'}
            ${isSidebarOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full opacity-0'}
        `}
      >
        <Sidebar 
          settings={settings} 
          onUpdate={updateSettings}
          onExport={handlePrintExport} 
          onPrint={handlePrintExport}
          onSave={handleSave}
          onDownload={handleDownloadSource}
          onImport={handleImportSource}
          onReset={handleReset}
          hasUnsavedChanges={hasUnsavedChanges}
          viewMode={viewMode}
          onViewModeChange={(mode) => {
              setViewMode(mode);
              if (isMobile) setIsSidebarOpen(false); // Auto close sidebar on mobile selection
          }}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden relative bg-gray-100">
        
        {/* Preview Area (Left) */}
        <div 
            ref={previewContainerRef}
            onScroll={handlePreviewScroll}
            className={`
                h-full relative z-0 md:border-r border-gray-300 transition-all duration-300 overflow-y-auto custom-scrollbar
                ${viewMode === 'preview' ? 'w-full block' : viewMode === 'split' ? 'hidden md:block md:w-1/2' : 'hidden'}
            `}
        >
          <Preview content={content} settings={settings} />
        </div>

        {/* Editor Area (Right) */}
        <div 
            className={`
                h-full shadow-2xl z-10 no-print transition-all duration-300 bg-gray-900
                ${viewMode === 'editor' ? 'w-full block' : viewMode === 'split' ? 'w-full md:w-1/2 block' : 'hidden'}
            `}
        >
          <Editor 
            value={content} 
            onChange={setContent} 
            direction={settings.direction} 
            scrollRef={editorRef}
            onScroll={handleEditorScroll}
          />
        </div>

      </div>
    </div>
  );
};

export default App;