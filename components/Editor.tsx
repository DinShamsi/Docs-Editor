import React, { useRef, useMemo, useState } from 'react';
import { EditorProps } from '../types';

const Editor: React.FC<EditorProps> = ({ value, onChange, direction, onScroll, scrollRef, isSyncScroll, onToggleSyncScroll }) => {
  const [showHelp, setShowHelp] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [editorFontSize, setEditorFontSize] = useState(14); // New Local State

  // --- Statistics Logic ---
  const stats = useMemo(() => {
    const text = value.trim();
    if (!text) return { words: 0, chars: 0, time: '< 1 דקה' };
    
    // Remove markdown symbols for rough estimation
    const cleanText = text.replace(/[#*`[\]()]/g, '');
    const wordCount = cleanText.split(/\s+/).length;
    const charCount = cleanText.length;
    const readTime = Math.ceil(wordCount / 200); // Avg reading speed

    return { words: wordCount, chars: charCount, time: `${readTime} דקות` };
  }, [value]);

  // --- Toolbar Insert Logic ---
  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    if (!scrollRef?.current) return;
    
    const textarea = scrollRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    const selectedText = text.substring(start, end);
    const textToInsert = selectedText.length > 0 ? selectedText : placeholder;
    
    const newText = text.substring(0, start) + before + textToInsert + after + text.substring(end);
    
    onChange(newText);
    
    // Restore focus and cursor
    setTimeout(() => {
        if (textarea) {
            textarea.focus();
            const newCursorPos = selectedText.length > 0 
                ? start + before.length + selectedText.length + after.length
                : start + before.length; // Place cursor inside if no selection
            textarea.setSelectionRange(newCursorPos, newCursorPos);
            // If placeholder used, select it
            if (selectedText.length === 0 && placeholder.length > 0) {
                 textarea.setSelectionRange(start + before.length, start + before.length + placeholder.length);
            }
        }
    }, 0);
  };

  // --- Auto-Close Pairs Logic ---
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const pairs: Record<string, string> = {
        '(': ')',
        '[': ']',
        '{': '}',
        '"': '"',
        '`': '`',
    };

    if (pairs[e.key]) {
        e.preventDefault();
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const closing = pairs[e.key];

        const newText = text.substring(0, start) + e.key + closing + text.substring(end);
        onChange(newText);

        // Move cursor to middle
        setTimeout(() => {
            textarea.selectionStart = start + 1;
            textarea.selectionEnd = start + 1;
        }, 0);
    }
  };

  const handleFullscreen = () => {
      if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(e => console.error(e));
      } else {
          document.exitFullscreen();
      }
  };

  const handleCopyMarkdown = () => {
      navigator.clipboard.writeText(value).then(() => {
          setCopyFeedback(true);
          setTimeout(() => setCopyFeedback(false), 2000);
      });
  };

  const toolbarItems = [
      { icon: 'fa-bold', label: 'מודגש', action: () => insertText('**', '**', 'טקסט מודגש') },
      { icon: 'fa-italic', label: 'נטוי', action: () => insertText('*', '*', 'טקסט נטוי') },
      { icon: 'fa-strikethrough', label: 'קו חוצה', action: () => insertText('~~', '~~', 'טקסט מחוק') },
      { icon: 'fa-heading', label: 'כותרת', action: () => insertText('## ', '', 'כותרת') },
      { icon: 'fa-list-ul', label: 'רשימה', action: () => insertText('\n- ', '', 'פריט רשימה') },
      { icon: 'fa-list-ol', label: 'מספור', action: () => insertText('\n1. ', '', 'פריט ממוספר') },
      { icon: 'fa-list-check', label: 'משימות', action: () => insertText('\n- [ ] ', '', 'משימה') },
      { icon: 'fa-minus', label: 'קו מפריד', action: () => insertText('\n---\n', '', '') },
      { icon: 'fa-scissors', label: 'מעבר עמוד', action: () => insertText('\n<div class="page-break"></div>\n', '', '') },
      { icon: 'fa-square-root-variable', label: 'נוסחה', action: () => insertText('$', '$', 'E=mc^2') },
      { icon: 'fa-table', label: 'טבלה', action: () => insertText('\n| עמודה 1 | עמודה 2 |\n|---|---|\n| תוכן 1 | תוכן 2 |\n', '', '') },
      { icon: 'fa-quote-right', label: 'ציטוט', action: () => insertText('\n> ', '', 'ציטוט') },
      { icon: 'fa-box', label: 'תיאוריה', action: () => insertText('<div class="theory">\n**הגדרה:** ', '\n</div>', 'תוכן ההגדרה...') },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white relative group border-l border-gray-800">
      {/* Help Modal */}
      {showHelp && (
        <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowHelp(false)}>
            <div className="bg-white text-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90%] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-xl font-bold">מדריך מקוצר (Cheat Sheet)</h2>
                    <button onClick={() => setShowHelp(false)} className="text-gray-500 hover:text-red-500"><i className="fa-solid fa-times text-xl"></i></button>
                </div>
                <div className="space-y-6 text-sm" dir="rtl">
                    
                    {/* Basics */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                        <div className="font-mono bg-gray-100 p-1 rounded">**מודגש**</div> <div>טקסט מודגש</div>
                        <div className="font-mono bg-gray-100 p-1 rounded">*נטוי*</div> <div>טקסט נטוי</div>
                        <div className="font-mono bg-gray-100 p-1 rounded">~~מחוק~~</div> <div>קו חוצה</div>
                        <div className="font-mono bg-gray-100 p-1 rounded"># כותרת 1</div> <div>כותרת ראשית</div>
                        <div className="font-mono bg-gray-100 p-1 rounded">## כותרת 2</div> <div>כותרת משנית</div>
                        <div className="font-mono bg-gray-100 p-1 rounded">- [ ] משימה</div> <div>רשימת משימות</div>
                        <div className="font-mono bg-gray-100 p-1 rounded">$E=mc^2$</div> <div>נוסחה בשורה</div>
                        <div className="font-mono bg-gray-100 p-1 rounded">$$...$$</div> <div>נוסחה במרכז</div>
                    </div>

                    {/* Boxes */}
                    <div>
                        <h3 className="font-bold mb-2 border-b pb-1">תיבות תוכן</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <code className="bg-blue-50 text-blue-700 block p-1 rounded mb-1 text-xs">div class="theory"</code>
                                <span className="text-xs text-gray-600">להגדרות ותיאוריה</span>
                            </div>
                            <div>
                                <code className="bg-green-50 text-green-700 block p-1 rounded mb-1 text-xs">div class="solution"</code>
                                <span className="text-xs text-gray-600">לפתרונות ותשובות</span>
                            </div>
                            <div>
                                <code className="bg-gray-100 text-gray-700 block p-1 rounded mb-1 text-xs">div class="example"</code>
                                <span className="text-xs text-gray-600">לדוגמאות ותרגילים</span>
                            </div>
                            <div>
                                <code className="bg-red-50 text-red-700 block p-1 rounded mb-1 text-xs">div class="warning"</code>
                                <span className="text-xs text-gray-600">להערות אזהרה</span>
                            </div>
                            <div>
                                <code className="bg-purple-50 text-purple-700 block p-1 rounded mb-1 text-xs">div class="proof"</code>
                                <span className="text-xs text-gray-600">להוכחות מתמטיות</span>
                            </div>
                             <div>
                                <code className="bg-slate-800 text-white block p-1 rounded mb-1 text-xs">div class="code-snippet"</code>
                                <span className="text-xs text-gray-600">לקוד/טרמינל</span>
                            </div>
                        </div>
                    </div>

                    {/* Layout */}
                    <div>
                        <h3 className="font-bold mb-2 border-b pb-1">עיצוב ופריסה</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <code className="bg-gray-100 block p-1 rounded mb-1 text-xs">div class="two-columns"</code>
                                <span className="text-xs text-gray-600">חלוקה ל-2 עמודות (גריד)</span>
                            </div>
                             <div>
                                <code className="bg-gray-100 block p-1 rounded mb-1 text-xs">div class="inline-list"</code>
                                <span className="text-xs text-gray-600">רשימה אופקית</span>
                            </div>
                             <div>
                                <code className="bg-gray-100 block p-1 rounded mb-1 text-xs">div class="compact-table"</code>
                                <span className="text-xs text-gray-600">טבלה צפופה</span>
                            </div>
                             <div>
                                <code className="bg-gray-100 block p-1 rounded mb-1 text-xs">div class="side-note"</code>
                                <span className="text-xs text-gray-600">הערת צד צפה</span>
                            </div>
                        </div>
                    </div>

                </div>
                <div className="mt-6 text-center">
                    <button onClick={() => setShowHelp(false)} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 shadow-lg">הבנתי, תודה!</button>
                </div>
            </div>
        </div>
      )}

      {/* Header & Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 flex flex-col shrink-0">
        <div className="px-4 py-2 flex justify-between items-center">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center gap-2">
                Editor
                <button 
                    onClick={handleCopyMarkdown} 
                    className={`hover:bg-gray-700 p-1 rounded transition-colors ${copyFeedback ? 'text-green-500' : 'text-gray-500 hover:text-white'}`} 
                    title="העתק טקסט מקור"
                >
                    <i className={`fa-solid ${copyFeedback ? 'fa-check' : 'fa-copy'}`}></i>
                </button>

                {/* Font Size Controls */}
                <div className="flex items-center gap-1 bg-gray-700 rounded px-1 ml-2">
                     <button onClick={() => setEditorFontSize(Math.max(10, editorFontSize - 1))} className="hover:text-white w-5 text-center">-</button>
                     <span className="text-[10px] w-4 text-center">{editorFontSize}</span>
                     <button onClick={() => setEditorFontSize(Math.min(24, editorFontSize + 1))} className="hover:text-white w-5 text-center">+</button>
                </div>
            </span>
            <div className="flex gap-2">
                 <button onClick={handleFullscreen} className="text-gray-500 hover:text-white transition-colors" title="מסך מלא (F11)">
                    <i className="fa-solid fa-expand"></i>
                 </button>
                 <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded">Markdown Supported</span>
            </div>
        </div>
        
        {/* Toolbar */}
        <div className="px-2 pb-2 flex gap-1 items-center">
            <div className="flex gap-1 overflow-x-auto custom-scrollbar flex-1">
                {toolbarItems.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={item.action}
                        className="p-1.5 min-w-[32px] rounded text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-sm"
                        title={item.label}
                    >
                        <i className={`fa-solid ${item.icon}`}></i>
                    </button>
                ))}
            </div>
            
            {/* Help Button */}
            <div className="border-l border-gray-600 pl-1 ml-1">
                <button
                    onClick={() => setShowHelp(true)}
                    className="p-1.5 min-w-[32px] rounded text-yellow-400 hover:bg-gray-700 hover:text-yellow-300 transition-colors text-sm"
                    title="עזרה / מחלקות"
                >
                    <i className="fa-solid fa-circle-question"></i>
                </button>
            </div>
        </div>
      </div>

      {/* Text Area */}
      <textarea
        ref={scrollRef}
        className="flex-1 w-full bg-gray-900 text-gray-100 p-6 font-mono resize-none focus:outline-none custom-scrollbar leading-relaxed"
        style={{ fontSize: `${editorFontSize}px` }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onScroll={(e) => {
            if (onScroll && e.currentTarget) {
                const height = e.currentTarget.scrollHeight - e.currentTarget.clientHeight;
                if (height > 0) {
                    const percentage = e.currentTarget.scrollTop / height;
                    onScroll(percentage);
                }
            }
        }}
        dir={direction}
        placeholder="התחל לכתוב כאן..."
        spellCheck={false}
        autoComplete="off"
        data-grammarly="false"
      />

      {/* Status Bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-1.5 flex justify-between items-center text-[11px] font-mono select-none text-gray-400">
          <div className="flex gap-4">
            <button 
                onClick={onToggleSyncScroll} 
                className={`flex items-center gap-1 hover:text-white transition-colors ${isSyncScroll ? 'text-green-400' : 'text-gray-500'}`}
                title={isSyncScroll ? "גלילה מסונכרנת פעילה" : "גלילה מסונכרנת כבויה"}
            >
                <i className={`fa-solid ${isSyncScroll ? 'fa-link' : 'fa-link-slash'}`}></i>
                <span className="hidden sm:inline">Sync</span>
            </button>
          </div>
          <div className="flex gap-4">
            <span>{stats.words} מילים</span>
            <span className="border-r border-gray-600"></span>
            <span>{stats.chars} תווים</span>
            <span className="border-r border-gray-600"></span>
            <span>~{stats.time} קריאה</span>
          </div>
      </div>
    </div>
  );
};

export default Editor;