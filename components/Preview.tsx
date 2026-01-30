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

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

const Preview: React.FC<PreviewProps> = ({ content, settings }) => {
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Custom Styling Injection
  const generateCustomStyles = () => {
    const themeConfig = THEME_CONFIGS[settings.theme];
    const isColorful = themeConfig.isColorful; 
    
    // Logic for Text Align
    let textAlign = 'left';
    if (settings.theme === ThemeType.ACADEMIC || settings.theme === ThemeType.CLASSIC || settings.theme === ThemeType.NEWSPAPER) {
        textAlign = 'justify';
    } else {
        textAlign = settings.direction === 'rtl' ? 'right' : 'left';
    }

    const textColor = themeConfig.textColor || '#1f2937';

    // --- COMPRESSION LOGIC ---
    // If compressed, we force specific tight values, ignoring some sliders
    const fontSize = settings.isCompressed ? '10.5px' : `${settings.fontSize}px`;
    const lineHeight = settings.isCompressed ? '1.15' : settings.lineHeight;
    // Minimal padding for compressed
    
    const compressedCSS = settings.isCompressed ? `
        /* Smart 2-Column Layout */
        .preview-content {
            column-count: 2;
            column-gap: 0.6cm;
            column-rule: 1px solid #e5e7eb;
        }
        
        /* Main Title Spans All Columns */
        .doc-header, .toc-container {
            column-span: all;
        }
        
        .doc-header {
            margin-bottom: 0.5em !important;
            padding-bottom: 0.5em !important;
        }
        
        /* Tighter Headings */
        .preview-content h1, .preview-content h2, .preview-content h3 {
            margin-top: 0.6em !important;
            margin-bottom: 0.2em !important;
            line-height: 1.1 !important;
        }
        .preview-content h1 { font-size: 1.4em !important; }
        .preview-content h2 { font-size: 1.2em !important; }
        .preview-content h3 { font-size: 1.1em !important; }

        /* Tighter Paragraphs */
        .preview-content p, .preview-content ul, .preview-content ol {
            margin-bottom: 0.4em !important;
        }
        
        /* Compact Tables */
        .preview-content table {
            font-size: 0.9em; 
            margin: 0.5em 0 !important;
        }
        .preview-content td, .preview-content th {
            padding: 2px 4px !important;
        }

        /* Compact Math */
        .katex-display {
            margin: 0.3em 0 !important;
        }

        /* Prevent breaking inside boxes */
        .theory, .solution, table, pre, .katex-display, .toc-container {
            break-inside: avoid;
            page-break-inside: avoid;
        }
    ` : '';

    return `
      html {
        scroll-behavior: smooth;
      }
      .preview-content {
        font-family: ${themeConfig.bodyFontFamily};
        line-height: ${lineHeight};
        font-size: ${fontSize};
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
        font-size: ${settings.isCompressed ? '1.8em' : '2.2em'};
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
      
      /* --- Table of Contents Styles --- */
      .toc-container {
        background-color: ${themeConfig.backgroundColor === '#ffffff' ? '#f8fafc' : 'rgba(0,0,0,0.03)'};
        border: 1px solid ${themeConfig.borderColor};
        border-right: 4px solid ${themeConfig.accentColor}; /* Significant RTL border */
        padding: 1em;
        margin-bottom: 2em;
        border-radius: 6px;
        unicode-bidi: isolate;
      }
      .toc-title {
        font-family: ${themeConfig.headerFontFamily};
        font-weight: bold;
        font-size: 1.1em;
        margin-bottom: 0.5em;
        color: ${themeConfig.headingColor};
        border-bottom: 1px solid ${themeConfig.borderColor};
        padding-bottom: 0.3em;
      }
      .toc-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .toc-item {
        margin-bottom: 0.3em;
      }
      .toc-item.level-1 {
        font-weight: 600;
      }
      .toc-item.level-2 {
        font-weight: normal;
        padding-inline-start: 1.5em; /* Indentation */
        font-size: 0.95em;
        opacity: 0.9;
      }
      .toc-link {
        color: ${themeConfig.textColor};
        text-decoration: none;
        transition: color 0.2s;
        cursor: pointer;
      }
      .toc-link:hover {
        color: ${themeConfig.accentColor};
        text-decoration: underline;
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
      
      /* Force bold math in bold contexts (Headers, Strong, Bold tags) */
      strong .katex, b .katex, h1 .katex, h2 .katex, h3 .katex, h4 .katex, h5 .katex, h6 .katex, .important .katex {
         font-weight: bold !important;
      }
      
      /* Ensure KaTeX internal elements inherit bold if forced */
      .katex .base, .katex .mord {
         font-weight: inherit !important;
      }

      /* Headings */
      .preview-content h1, .preview-content h2, .preview-content h3 {
        font-family: ${themeConfig.headerFontFamily};
        color: ${themeConfig.headingColor};
        font-weight: 700;
        margin-top: 1.5em;
        margin-bottom: 0.8em;
        unicode-bidi: isolate;
        scroll-margin-top: 1em; /* Ensure anchor doesn't stick to top edge */
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
        padding: ${settings.isCompressed ? '0.4em' : '1em'};
        margin: ${settings.isCompressed ? '0.5em 0' : '1.5em 0'};
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

      /* MOBILE OVERRIDES FOR PAPER PADDING */
      @media screen and (max-width: 768px) {
        .preview-content {
           font-size: 16px !important; /* Force readable text on mobile */
        }
        .preview-content h1 { font-size: 1.6em !important; }
      }

      /* INJECT COMPRESSED OVERRIDES AT THE END */
      ${compressedCSS}
    `;
  };

  // Logic to auto-scale large math formulas
  const scaleMathElements = () => {
    if (!previewRef.current) return;
    
    // We target the containers we inject, or katex-display directly
    const mathContainers = previewRef.current.querySelectorAll('.katex-display');
    
    mathContainers.forEach((el) => {
        const element = el as HTMLElement;
        const parent = element.parentElement;
        
        if (!parent) return;

        // Reset first to measure correctly
        element.style.transform = 'none';
        element.style.width = 'auto';
        
        const parentWidth = parent.clientWidth;
        const elementWidth = element.scrollWidth;
        
        // If element is wider than parent (with small tolerance)
        if (elementWidth > parentWidth && parentWidth > 0) {
             const scale = parentWidth / elementWidth;
             // Apply scale
             element.style.transform = `scale(${scale})`;
             element.style.transformOrigin = 'center'; // Center scale is usually best for centered equations
             element.style.width = '100%'; // Ensure it takes full width of container
             element.style.overflow = 'hidden'; // Hide any potential overflow
        }
    });
  };

  useEffect(() => {
    if (!previewRef.current) return;

    if (!window.katex) {
       console.warn("KaTeX not loaded yet");
       return; 
    }

    // Configure Marked
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
    
    // Custom Renderer to capture headings and add IDs
    const tocData: TOCItem[] = [];
    const renderer = new marked.Renderer();
    
    // FIX: Using correct signature (text, level) instead of object destructuring
    renderer.heading = (text, level) => {
      // Ensure text is a string to prevent crashes
      const safeText = String(text || '');
      
      // Create a slug for the ID
      const id = safeText
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\u0590-\u05FF\-]+/g, '') // Keep Hebrew chars, English chars, numbers, hyphens
        + '-' + Math.floor(Math.random() * 1000); // Random suffix to ensure uniqueness

      // Add to TOC data if H1 or H2
      if (level === 1 || level === 2) {
        tocData.push({ id, text: safeText, level });
      }

      return `<h${level} id="${id}">${safeText}</h${level}>`;
    };

    // Use the custom renderer for this parse
    marked.use({ renderer });

    const mathSegments: { id: string, tex: string, display: boolean }[] = [];
    
    // 1. EXTRACT MATH
    // We replace math with placeholders to prevent Markdown from messing them up.
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

    // 2. PRE-PROCESS HTML BLOCKS
    // This fixes the issue where Markdown (like **bold**) inside <div class="theory"> is ignored.
    const customBlocks = ['theory', 'solution'];
    customBlocks.forEach(cls => {
        const regex = new RegExp(`<div class="${cls}">([\\s\\S]*?)<\\/div>`, 'gi');
        processedContent = processedContent.replace(regex, (match, innerText) => {
            const parsedInner = marked.parse(innerText) as string;
            return `<div class="${cls}">\n${parsedInner}\n</div>\n`;
        });
    });

    // 3. MAIN MARKDOWN PARSE
    // Handle the rest of the document. marked supports HTML by default.
    processedContent = processedContent.replace(/<\/div>/gi, '</div>\n\n');
    let rawHtml = marked.parse(processedContent) as string;
    
    // 4. GENERATE TOC HTML (If enabled)
    let tocHtml = '';
    if (settings.showTOC && tocData.length > 0) {
        const listItems = tocData.map(item => `
            <li class="toc-item level-${item.level}">
                <a href="#${item.id}" class="toc-link">${item.text}</a>
            </li>
        `).join('');
        
        tocHtml = `
            <div class="toc-container">
                <div class="toc-title">תוכן עניינים</div>
                <ul class="toc-list">
                    ${listItems}
                </ul>
            </div>
        `;
    }

    // 5. COMBINE & RESTORE MATH
    // We add the TOC *before* restoring math, so any math in the TOC titles also gets rendered!
    let finalHtml = tocHtml + rawHtml;

    mathSegments.forEach(({ id, tex, display }) => {
      try {
        const rendered = window.katex.renderToString(tex, {
           displayMode: display,
           throwOnError: false,
           output: 'html', 
           fleqn: false
        });
        
        // Wrap in spans/divs to ensure layout stability
        const wrapped = display 
          ? `<div dir="ltr" style="display:block; text-align:center; margin: 1em 0;">${rendered}</div>`
          : `<span dir="ltr" style="display:inline-block;">${rendered}</span>`;

        finalHtml = finalHtml.replace(new RegExp(id, 'g'), () => wrapped);
      } catch (e) {
         console.error("KaTeX error:", e);
         finalHtml = finalHtml.replace(new RegExp(id, 'g'), () => `<span style="color:red; font-family:monospace;">${tex}</span>`);
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

    if (previewRef.current) {
        previewRef.current.innerHTML = headerHtml + finalHtml;
    }
    
    // 6. Run auto-scaling for math
    setTimeout(scaleMathElements, 0);

  }, [content, settings.theme, settings.title, settings.showDate, settings.showTOC, settings.direction, settings.isCompressed]);

  // Add Resize Listener to re-scale math on window resize
  useEffect(() => {
     const handleResize = () => {
         requestAnimationFrame(scaleMathElements);
     };
     window.addEventListener('resize', handleResize);
     return () => window.removeEventListener('resize', handleResize);
  }, []);

  const containerBg = THEME_CONFIGS[settings.theme].backgroundColor;

  return (
    <div className="h-full bg-gray-100 overflow-y-auto p-2 md:p-8 custom-scrollbar block" id="preview-container">
      {/* Key prop ensures style tag is re-mounted when settings change */}
      <style key={`${settings.theme}-${settings.fontSize}-${settings.lineHeight}-${settings.direction}-${settings.isCompressed}`}>{generateCustomStyles()}</style>
      
      <div 
        className="mx-auto shadow-xl min-h-[29.7cm] w-full max-w-[21cm] transition-all duration-300 ease-in-out box-border preview-page"
        style={{
          // Use CSS variables or calc for mobile responsiveness handled via style injection mostly, 
          // but here we clamp the padding for mobile directly in JS for the container
          padding: settings.isCompressed ? '5mm' : (window.innerWidth < 768 ? '15px' : `${settings.margins * 4}px`),
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