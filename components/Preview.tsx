import React, { useEffect, useRef, useState } from 'react';
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

const Preview: React.FC<PreviewProps> = ({ content, settings, zoom, onZoomChange }) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeId, setActiveId] = useState<string>('');
  
  // Calculate style values in component scope
  const calculateStyles = () => {
    let fontSize = `${settings.fontSize}px`;
    let lineHeight = settings.lineHeight.toString();
    // Default padding logic
    let containerPadding = (typeof window !== 'undefined' && window.innerWidth < 768) ? '15px' : `${settings.margins * 4}px`;
    let columnGap = '0.6cm';
    let columnCount = 2;

    if (settings.compressionLevel !== 'none') {
        switch (settings.compressionLevel) {
            case 'low': // Low Compression
                fontSize = '11.5px';
                lineHeight = '1.3';
                containerPadding = '12mm';
                columnGap = '0.8cm';
                break;
            case 'medium': // Medium Compression
                fontSize = '10.5px';
                lineHeight = '1.15';
                containerPadding = '5mm';
                columnGap = '0.6cm';
                break;
            case 'high': // High Compression
                fontSize = '9.5px';
                lineHeight = '1.1';
                containerPadding = '3mm';
                columnGap = '0.4cm';
                break;
        }
    }
    return { fontSize, lineHeight, containerPadding, columnGap, columnCount };
  };

  const { fontSize, lineHeight, containerPadding, columnGap, columnCount } = calculateStyles();

  // Custom Styling Injection
  const generateCustomStyles = () => {
    const themeConfig = THEME_CONFIGS[settings.theme];
    const isColorful = themeConfig.isColorful; 
    
    // Logic for Text Align
    let textAlign = 'left';
    if (settings.theme === ThemeType.ACADEMIC || settings.theme === ThemeType.NEWSPAPER) {
        textAlign = 'justify';
    } else {
        textAlign = settings.direction === 'rtl' ? 'right' : 'left';
    }

    const textColor = themeConfig.textColor || '#1f2937';
    const borderSide = settings.direction === 'rtl' ? 'right' : 'left';
    
    let compressionCSS = '';

    if (settings.compressionLevel !== 'none') {
        compressionCSS = `
            /* Smart Column Layout */
            .preview-content {
                column-count: ${columnCount};
                column-gap: ${columnGap};
                column-rule: 1px solid #e5e7eb;
            }
            
            /* Main Title Spans All Columns */
            .doc-header, .toc-container {
                column-span: all;
            }
            
            .doc-header {
                margin-bottom: ${settings.compressionLevel === 'high' ? '0.3em' : '0.5em'} !important;
                padding-bottom: ${settings.compressionLevel === 'high' ? '0.3em' : '0.5em'} !important;
            }
            
            /* Tighter Headings */
            .preview-content h1, .preview-content h2, .preview-content h3 {
                margin-top: ${settings.compressionLevel === 'high' ? '0.4em' : '0.6em'} !important;
                margin-bottom: 0.2em !important;
                line-height: 1.1 !important;
            }
            .preview-content h1 { font-size: ${settings.compressionLevel === 'high' ? '1.3em' : '1.4em'} !important; }
            .preview-content h2 { font-size: ${settings.compressionLevel === 'high' ? '1.1em' : '1.2em'} !important; }
            .preview-content h3 { font-size: ${settings.compressionLevel === 'high' ? '1em' : '1.1em'} !important; }

            /* Tighter Paragraphs & Lists */
            .preview-content p, .preview-content ul, .preview-content ol {
                margin-bottom: ${settings.compressionLevel === 'high' ? '0.2em' : '0.4em'} !important;
            }
            
            /* Compact Tables */
            .preview-content table {
                font-size: ${settings.compressionLevel === 'high' ? '0.85em' : '0.9em'}; 
                margin: 0.5em 0 !important;
            }
            .preview-content td, .preview-content th {
                padding: ${settings.compressionLevel === 'high' ? '1px 3px' : '2px 4px'} !important;
            }

            /* Compact Math */
            .katex-display {
                margin: 0.3em 0 !important;
            }

            /* Prevent breaking inside boxes */
            .theory, .solution, .example, .proof, .warning, table, pre, .katex-display, .toc-container {
                break-inside: avoid;
                page-break-inside: avoid;
            }
        `;
    }

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
        font-size: ${settings.compressionLevel !== 'none' ? '1.8em' : '2.2em'};
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
        border-${borderSide}: 4px solid ${themeConfig.accentColor};
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
        padding-inline-start: 1.5em;
        font-size: 0.95em;
        opacity: 0.9;
      }
      .toc-link {
        color: ${themeConfig.textColor};
        text-decoration: none;
        transition: color 0.2s;
        cursor: pointer;
        display: inline-block;
      }
      .toc-link:hover {
        color: ${themeConfig.accentColor};
        text-decoration: underline;
      }
      /* Active TOC Item */
      .toc-link.active {
          color: ${themeConfig.accentColor};
          font-weight: bold;
          border-${borderSide}: 2px solid ${themeConfig.accentColor};
          padding-${borderSide}: 0.5em;
          margin-${borderSide}: -0.5em;
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
      strong .katex, b .katex, h1 .katex, h2 .katex, h3 .katex, h4 .katex, h5 .katex, h6 .katex, .important .katex {
         font-weight: bold !important;
      }
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
        scroll-margin-top: 1em;
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

      /* --- NEW & EXISTING SPECIAL BOXES --- */

      .theory, .solution, .example, .proof, .warning, .code-snippet {
        border-radius: 4px;
        padding: ${settings.compressionLevel !== 'none' ? '0.4em' : '1em'};
        margin: ${settings.compressionLevel !== 'none' ? '0.5em 0' : '1.5em 0'};
        unicode-bidi: isolate;
      }

      /* Theory (Existing) */
      .theory {
        background-color: ${isColorful ? themeConfig.accentColor + '10' : 'transparent'};
        border-${borderSide}: 4px solid ${themeConfig.accentColor};
        ${!isColorful ? 'font-style: italic; border: 1px solid ' + themeConfig.borderColor + ';' : ''}
      }

      /* Solution (Existing) */
      .solution {
        background-color: #f0fdf4;
        border: 1px solid #86efac;
      }
      
      /* Important (Inline Span) */
      .important {
        background-color: ${themeConfig.accentColor}30;
        color: ${themeConfig.headingColor};
        padding: 0.1em 0.3em;
        border-radius: 2px;
        font-weight: 600;
        border-bottom: 2px solid ${themeConfig.accentColor};
        unicode-bidi: isolate;
      }

      /* --- NEW CLASSES --- */

      /* Example Box */
      .example {
        background-color: ${isColorful ? '#f3f4f6' : 'transparent'};
        border-${borderSide}: 4px solid ${themeConfig.borderColor};
        border-top: 1px solid ${themeConfig.borderColor}40;
        border-bottom: 1px solid ${themeConfig.borderColor}40;
        border-${borderSide === 'right' ? 'left' : 'right'}: 1px solid ${themeConfig.borderColor}40;
      }

      /* Proof Box */
      .proof {
        padding-inline-start: 1.5em;
        font-family: ${themeConfig.bodyFontFamily};
        font-style: italic;
        color: ${textColor}CC; /* Slightly transparent */
      }
      .proof::before {
        content: "הוכחה:";
        font-weight: bold;
        font-style: normal;
        margin-inline-end: 0.5em;
      }
      .proof::after {
        content: "■";
        display: block;
        text-align: ${borderSide === 'right' ? 'left' : 'right'};
        margin-top: 0.5em;
        font-style: normal;
      }

      /* Warning/Alert Box */
      .warning {
        background-color: #fff1f2;
        border: 1px solid #fda4af;
        color: #9f1239;
        display: flex;
        flex-direction: column;
      }
      .warning::before {
        content: "⚠️ שים לב";
        font-weight: bold;
        margin-bottom: 0.5em;
        font-family: ${themeConfig.headerFontFamily};
      }

      /* Code Snippet */
      .code-snippet {
        background-color: #1e293b;
        color: #e2e8f0;
        font-family: 'Courier New', Courier, monospace;
        border-radius: 6px;
        direction: ltr;
        text-align: left;
        font-size: 0.85em;
        overflow-x: auto;
        white-space: pre-wrap;
      }

      /* --- LAYOUT UTILITIES --- */

      /* Two Columns (Grid) */
      .two-columns {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1.5rem;
        margin: 1.5rem 0;
        align-items: start;
        width: 100%;
      }

      /* Inline List */
      .inline-list ul, .inline-list ol {
        display: flex;
        flex-wrap: wrap;
        gap: 1em;
        padding: 0;
        list-style: none;
      }
      .inline-list li {
        background-color: ${themeConfig.backgroundColor === '#ffffff' ? '#f3f4f6' : 'rgba(0,0,0,0.05)'};
        padding: 0.2em 0.8em;
        border-radius: 999px;
        font-size: 0.9em;
        border: 1px solid ${themeConfig.borderColor};
      }

      /* Compact Table (modifiers) */
      .compact-table table {
        margin: 0.5em 0;
        font-size: 0.85em;
      }
      .compact-table td, .compact-table th {
        padding: 0.25em 0.5em;
      }

      /* Side Note (Floating box, best used in non-compressed mode) */
      .side-note {
        float: ${borderSide === 'right' ? 'left' : 'right'};
        width: 30%;
        margin-${borderSide}: 1.5em;
        margin-bottom: 1em;
        background-color: ${themeConfig.accentColor}08;
        padding: 0.8em;
        font-size: 0.85em;
        border-${borderSide}: 2px solid ${themeConfig.accentColor}80;
        border-radius: 4px;
        clear: both; /* Clear floats to prevent stacking issues */
      }

      /* --- TYPOGRAPHY UTILITIES --- */
      
      .lead {
        font-size: 1.2em;
        line-height: 1.6;
        font-weight: 500;
        color: ${themeConfig.headingColor};
        margin-bottom: 1.5em;
      }

      .caption {
        text-align: center;
        font-size: 0.85em;
        color: #6b7280;
        font-style: italic;
        margin-top: -0.8em;
        margin-bottom: 1.5em;
        display: block;
      }

      .text-center { text-align: center !important; }
      .text-right { text-align: right !important; }
      .text-left { text-align: left !important; }

      /* --- PRINT UTILITIES --- */
      
      .page-break {
        height: 1px;
        background: transparent;
        border: none;
        margin: 0;
        display: block;
      }

      .no-break {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .force-break {
        break-before: page;
        page-break-before: always;
      }

      /* MOBILE OVERRIDES FOR PAPER PADDING */
      @media screen and (max-width: 768px) {
        .preview-content {
           font-size: 16px !important; /* Force readable text on mobile */
        }
        .preview-content h1 { font-size: 1.6em !important; }
        .two-columns { grid-template-columns: 1fr; gap: 1rem; } /* Stack on mobile */
        .side-note { float: none; width: 100%; margin: 1em 0; } /* Stack side notes */
      }

      /* INJECT COMPRESSED OVERRIDES AT THE END */
      ${compressionCSS}
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

    renderer.checkbox = (checked) => {
        return `<input type="checkbox" ${checked ? 'checked' : ''} disabled class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded mx-2 align-middle" />`;
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

    // 2. PRE-PROCESS HTML BLOCKS (Updated for new classes)
    // This fixes the issue where Markdown (like **bold**) inside <div class="..."> is ignored.
    const customBlocks = ['theory', 'solution', 'example', 'proof', 'warning', 'two-columns', 'side-note', 'inline-list', 'compact-table', 'lead', 'text-center', 'no-break'];
    customBlocks.forEach(cls => {
        // Regex handles attributes somewhat loosely to allow <div class="two-columns">...</div>
        const regex = new RegExp(`<div class="${cls}"[^>]*>([\\s\\S]*?)<\\/div>`, 'gi');
        processedContent = processedContent.replace(regex, (match, innerText) => {
            const parsedInner = marked.parse(innerText) as string;
            // Reconstruct the div with the class. Note: This strips other attributes if they existed in the regex match group 0 but we only captured innerText.
            // For simplicity in this regex, we assume straightforward usage.
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
                <a href="#${item.id}" class="toc-link ${activeId === item.id ? 'active' : ''}">${item.text}</a>
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

  }, [content, settings.theme, settings.title, settings.showDate, settings.showTOC, settings.direction, settings.compressionLevel, activeId]);

  // Add Resize Listener to re-scale math on window resize
  useEffect(() => {
     const handleResize = () => {
         requestAnimationFrame(scaleMathElements);
     };
     window.addEventListener('resize', handleResize);
     return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update Scroll Progress AND Active TOC
  useEffect(() => {
      const container = containerRef.current || document.getElementById('preview-container');
      if (!container) return;

      const handleScroll = () => {
          const { scrollTop, scrollHeight, clientHeight } = container;
          const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
          setScrollProgress(progress);
          setShowScrollTop(scrollTop > 400);

          // ScrollSpy Logic
          if (settings.showTOC && previewRef.current) {
              const headings = Array.from(previewRef.current.querySelectorAll('h1[id], h2[id]')) as HTMLElement[];
              let current = '';
              for (const h of headings) {
                  // If heading is above or near the top third of the viewport
                  if (h.offsetTop <= scrollTop + 150) {
                      current = h.id;
                  } else {
                      break; // Optimization: since headings are ordered, we can stop
                  }
              }
              setActiveId(current);
          }
      };

      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
  }, [settings.showTOC]);

  const handleCopyHTML = () => {
    if (previewRef.current) {
        navigator.clipboard.writeText(previewRef.current.innerHTML).then(() => {
            setCopyFeedback(true);
            setTimeout(() => setCopyFeedback(false), 2000);
        });
    }
  };

  const scrollToTop = () => {
      const container = containerRef.current || document.getElementById('preview-container');
      if (container) {
          container.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  const containerBg = THEME_CONFIGS[settings.theme].backgroundColor;

  return (
    <div className="h-full bg-gray-100 overflow-y-auto p-2 md:p-8 custom-scrollbar block relative" id="preview-container" ref={containerRef}>
      {/* Reading Progress Bar (Fixed at top of container) */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-transparent z-40 pointer-events-none">
           <div 
             className="h-full bg-blue-600 transition-all duration-150 ease-out" 
             style={{ width: `${Math.min(100, Math.max(0, scrollProgress))}%` }}
           />
      </div>

      {/* Key prop ensures style tag is re-mounted when settings change */}
      <style id="preview-styles" key={`${settings.theme}-${settings.fontSize}-${settings.lineHeight}-${settings.direction}-${settings.compressionLevel}`}>{generateCustomStyles()}</style>
      
      {/* Floating Zoom Toolbar */}
      <div className="sticky top-0 z-30 mb-4 flex justify-center pointer-events-none no-print">
          <div className="bg-white/80 backdrop-blur-md shadow-lg rounded-full px-4 py-1.5 flex items-center gap-3 border border-gray-200 pointer-events-auto transition-all hover:bg-white">
                <button 
                    onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))} 
                    className="text-gray-500 hover:text-blue-600 transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100"
                    title="הקטן"
                >
                    <i className="fa-solid fa-magnifying-glass-minus text-xs"></i>
                </button>
                <span className="text-xs font-mono w-10 text-center font-medium text-gray-700">{Math.round(zoom * 100)}%</span>
                <button 
                    onClick={() => onZoomChange(Math.min(2.0, zoom + 0.1))} 
                    className="text-gray-500 hover:text-blue-600 transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100"
                    title="הגדל"
                >
                    <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                </button>
                <div className="h-4 w-px bg-gray-300 mx-1"></div>
                <button 
                    onClick={() => onZoomChange(1)} 
                    className="text-gray-500 hover:text-blue-600 text-xs font-medium px-1 hover:bg-gray-100 rounded"
                    title="אפס זום"
                >
                    A4
                </button>
                <div className="h-4 w-px bg-gray-300 mx-1"></div>
                 <button 
                    onClick={handleCopyHTML} 
                    className={`transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 ${copyFeedback ? 'text-green-600' : 'text-gray-500 hover:text-blue-600'}`}
                    title="העתק HTML"
                >
                    <i className={`fa-solid ${copyFeedback ? 'fa-check' : 'fa-code'} text-xs`}></i>
                </button>
          </div>
      </div>

      <div 
        className="mx-auto shadow-xl min-h-[29.7cm] w-full max-w-[21cm] transition-transform duration-200 ease-out box-border preview-page"
        style={{
          // Use CSS variables or calc for mobile responsiveness handled via style injection mostly, 
          // but here we clamp the padding for mobile directly in JS for the container
          padding: containerPadding,
          backgroundColor: containerBg,
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
          marginBottom: `${(zoom - 1) * 200}px` // Add margin to bottom when zoomed in so it doesn't get cut off
        }}
      >
        <div 
          ref={previewRef}
          className="preview-content"
          dir={settings.direction}
        />
      </div>

      {/* Scroll To Top Button */}
      <button 
        onClick={scrollToTop}
        className={`fixed bottom-6 right-8 z-40 bg-gray-800 text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:bg-blue-600 hover:scale-110 no-print ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        title="חזור למעלה"
      >
         <i className="fa-solid fa-arrow-up"></i>
      </button>
    </div>
  );
};

export default Preview;