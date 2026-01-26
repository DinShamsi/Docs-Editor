import React from 'react';
import { EditorProps } from '../types';

const Editor: React.FC<EditorProps> = ({ value, onChange, direction }) => {
  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex justify-between items-center">
        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Source Code (Markdown/HTML/LaTeX)</span>
        <div className="flex gap-2">
           <span className="text-xs text-gray-500">Markdown supported</span>
        </div>
      </div>
      <textarea
        className="flex-1 w-full bg-gray-900 text-gray-100 p-6 font-mono text-sm resize-none focus:outline-none custom-scrollbar leading-relaxed"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir={direction}
        placeholder="הדבק או כתוב את הטקסט כאן... השתמש ב-$ לנוסחאות"
        spellCheck={false}
      />
    </div>
  );
};

export default Editor;
