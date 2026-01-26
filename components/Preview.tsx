import React, { useEffect, useRef } from 'react';
import { marked } from 'marked';
import { PreviewProps, ThemeType } from '../types';
import { THEME_CONFIGS } from '../constants';

declare global {
  interface Window {
    katex: {
      renderToString: (tex: string, options?: any) => string;
    };
  }
}

const Preview: React.FC<PreviewProps> = ({ content, settings }) => {
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Custom Styling Injection
  const generateCustomStyles = () => {
    const themeConfig = THEME_CONFIGS[settings.theme];
    const isColorful = themeConfig.isColorful; 
    
    // Screen layout: We still want Justify for aesthetics on screen if Academic
    // But we will override this in @media print (see index.html)
    let textAlign = 'left';
    if (settings.theme === ThemeType.ACADEMIC || settings.theme === ThemeType.CLASSIC || settings.theme === ThemeType.NEWSPAPER) {
        textAlign = 'justify';
    } else {
        textAlign = settings.direction === 'rtl' ? 'right' : 'left';
    }

    const textColor = themeConfig.textColor || '#1f2937';

    return `
      .preview-content {
        font-family: ${themeConfig.bodyFontFamily};
        line-height: ${settings.lineHeight};
        font-size: ${settings.fontSize}px;
        color: ${textColor};
        text-align: ${textAlign}; 
        background-color: ${themeConfig.backgroundColor};
        min-height: 100%;
        width: 100%;
        overflow-wrap: break-word;
        word-wrap: break-word;
      }

      /* Document Header Container */
      .doc-header {
        text-align: center;
        width: 100%;
        margin-bottom: 2em;
        border-bottom: ${isColorful ? `3px solid ${themeConfig.accentColor}` : `1px solid ${themeConfig.borderColor}`};
        padding-bottom: 1em;
        unicode-bidi: isolate;
      }

      /* Main Document Title */
      .preview-content .doc-header h1.doc-title {
        font-family: ${themeConfig.headerFontFamily};
        text-align: center;
        font-size: 2.2em;
        font-weight: 800;
        margin-top: 0;
        margin-bottom: 0.2rem;
        line-height: 1.2;
        color: ${themeConfig.headingColor};
        border-bottom: none;
        padding-bottom: 0;
        width: 100%;
      }

      /* Document Date */
      .doc-header .doc-date {
        text-align: center;
        font-size: 0.9em;
        color: #6b7280;
        font-family: ${themeConfig.bodyFontFamily};
        opacity: 0.8;
        margin: 0;
      }

      /* KaTeX Fixes */
      .katex {
        direction: ltr !important;
        unicode-bidi: isolate;
        text-align: left;
      }
      
      .katex-display {
        margin: 1em 0;
        overflow-x: auto;
        overflow-y: hidden;
      }

      /* Headings */
      .preview-content h1, .preview-content h2, .preview-content h3 {
        font-family: ${themeConfig.headerFontFamily};
        color: ${themeConfig.headingColor};
        font-weight: 700;
        margin-top: 1.5em;
        margin-bottom: 0.8em;
        unicode-bidi: isolate;
      }
      
      .preview-content h1 { font-size: 1.8em; border-bottom: 2px solid ${themeConfig.borderColor}; padding-bottom: 0.3em; }
      .preview-content h2 { font-size: 1.5em; }
      .preview-content h3 { font-size: 1.25em; color: ${themeConfig.accentColor}; }

      /* Paragraphs & Text Elements */
      .preview-content p { 
        margin-bottom: 1em; 
        unicode-bidi: isolate;
      }
      
      /* Lists */
      .preview-content ul, .preview-content ol { 
        margin-bottom: 1em; 
        padding-inline-start: 2em; 
        unicode-bidi: isolate; 
      }
      .preview-content li { 
        margin-bottom: 0.5em; 
        unicode-bidi: isolate; 
      }
      
      .preview-content ul li::marker {
        color: ${themeConfig.accentColor};
        font-size: 1.2em;
      }
      
      .preview-content ol li::marker {
        color: ${themeConfig.accentColor};
        font-weight: bold;
        font-family: ${themeConfig.headerFontFamily};
      }
      
      /* Tables */
      .preview-content table { 
        width: 100%; 
        border-collapse: collapse; 
        margin: 1.5em 0; 
        font-size: 0.95em;
        color: ${textColor};
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        unicode-bidi: isolate;
      }
      
      .preview-content th { 
        background-color: ${themeConfig.accentColor}15; 
        font-family: ${themeConfig.headerFontFamily};
        font-weight: bold;
        border-bottom: 2px solid ${themeConfig.accentColor};
        padding: 0.75em;
        text-align: ${textAlign};
        color: ${themeConfig.headingColor};
      }

      .preview-content td { 
        border-bottom: 1px solid ${themeConfig.borderColor};
        padding: 0.75em; 
        text-align: ${textAlign};
        color: ${textColor};
      }

      .preview-content tr:nth-child(even) {
        background-color: ${themeConfig.backgroundColor === '#ffffff' ? '#f9fafb' : 'rgba(0,0,0,0.02)'};
      }

      /* Special Boxes */
      .theory, .solution {
        border-radius: 4px;
        padding: 1em;
        margin: 1.5em 0;
        unicode-bidi: isolate;
      }

      .theory {
        background-color: ${isColorful ? themeConfig.accentColor + '10' : 'transparent'};
        border-${settings.direction === 'rtl' ? 'right' : 'left'}: 4px solid ${themeConfig.accentColor};
        ${!isColorful ? 'font-style: italic; border: 1px solid ' + themeConfig.borderColor + ';' : ''}
      }

      .solution {
        background-color: #f0fdf4;
        border: 1px solid #86efac;
      }
      
      .important {
        background-color: ${themeConfig.accentColor}30;
        color: ${themeConfig.headingColor};
        padding: 0.1em 0.3em;
        border-radius: 2px;
        font-weight: 600;
        border-bottom: 2px solid ${themeConfig.accentColor};
        unicode-bidi: isolate;
      }

      .page-break {
        height: 1px;
        background: transparent;
        border: none;
        margin: 0;
        display: block;
      }
    `;
  };

  useEffect(() => {
    if (!previewRef.current) return;

    if (!window.katex) {
       console.warn("KaTeX not loaded yet");
       return; 
    }

    marked.setOptions({
      breaks: true,
      gfm: true,
    });

    const mathSegments: { id: string, tex: string, display: boolean }[] = [];
    
    // Extract Math
    let processedContent = content.replace(/\$\$([\s\S]*?)\$\$/g, (match, tex) => {
      const id = `MATHBLOCK${mathSegments.length}ENDMATHBLOCK`;
      mathSegments.push({ id, tex, display: true });
      return id;
    });

    processedContent = processedContent.replace(/\$([^$]+?)\$/g, (match, tex) => {
      const id = `MATHINLINE${mathSegments.length}ENDMATHINLINE`;
      mathSegments.push({ id, tex, display: false });
      return id;
    });

    // Markdown Parsing
    processedContent = processedContent.replace(/<\/div>/gi, '</div>\n\n');
    let rawHtml = marked.parse(processedContent) as string;
    
    // Restore Math
    mathSegments.forEach(({ id, tex, display }) => {
      try {
        const rendered = window.katex.renderToString(tex, {
           displayMode: display,
           throwOnError: false,
           output: 'html', 
           fleqn: false
        });
        
        const wrapped = display 
          ? `<div dir="ltr" style="display:block; text-align:center; margin: 1em 0;">${rendered}</div>`
          : `<span dir="ltr" style="display:inline-block;">${rendered}</span>`;

        rawHtml = rawHtml.replace(id, () => wrapped);
      } catch (e) {
         console.error("KaTeX error:", e);
         rawHtml = rawHtml.replace(id, () => `<span style="color:red; font-family:monospace;">${tex}</span>`);
      }
    });

    const dateHtml = settings.showDate
        ? `<div class="doc-date">${new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })}</div>`
        : '';
    
    const headerHtml = settings.title 
        ? `<div class="doc-header">
             <h1 class="doc-title">${settings.title}</h1>
             ${dateHtml}
           </div>` 
        : '';

    previewRef.current.innerHTML = headerHtml + rawHtml;

  }, [content, settings.theme, settings.title, settings.showDate, settings.direction]);

  const containerBg = THEME_CONFIGS[settings.theme].backgroundColor;

  return (
    <div className="h-full bg-gray-100 overflow-y-auto p-4 md:p-8 custom-scrollbar block" id="preview-container">
      <style>{generateCustomStyles()}</style>
      
      <div 
        className="mx-auto shadow-xl min-h-[29.7cm] w-full max-w-[21cm] transition-all duration-300 ease-in-out box-border preview-page"
        style={{
          padding: `${settings.margins * 4}px`,
          backgroundColor: containerBg
        }}
      >
        <div 
          ref={previewRef}
          className="preview-content"
          dir={settings.direction}
        />
      </div>
    </div>
  );
};

export default Preview;