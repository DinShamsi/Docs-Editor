import { ThemeType } from "./types";

export const DEFAULT_CONTENT = `<div class="theory">
<strong>הגדרה:</strong> מערכת לינארית היא מערכת המקיימת את עקרון הסופרפוזיציה.
עבור כניסות $x_1(t)$ ו-$x_2(t)$ ותגובות $y_1(t)$ ו-$y_2(t)$, מתקיים:
$$ T[a x_1(t) + b x_2(t)] = a y_1(t) + b y_2(t) $$
</div>

## 1. מבוא
בניסוי זה נחקור את התגובה של מעגל **RC** פשוט. 
המשוואה הדיפרנציאלית המתארת את המעגל היא:

$$ RC \\frac{dV_{out}}{dt} + V_{out} = V_{in} $$

<span class="important">חשוב מאוד לדייק במדידות המתח!</span>

## 2. פתרון אנליטי
עבור כניסת מדרגה $V_{in}(t) = u(t)$, הפתרון הוא:

<div class="solution">
<strong>פתרון:</strong>
$$ V_{out}(t) = V_0 (1 - e^{-t/RC}) $$
כאשר $V_0$ הוא מתח המקור.
</div>

## 3. תוצאות ודיון
להלן טבלת מדידות שנערכה במעבדה:

| זמן (ms) | מתח מדוד (V) | מתח תיאורטי (V) |
|----------|-------------|-----------------|
| 0        | 0.0         | 0.0             |
| 10       | 3.2         | 3.15            |
| 20       | 5.1         | 5.20            |

## 4. מסקנות
הניסוי אימת את המודל התיאורטי בדיוק רב.
`;

export const AI_PROMPT_GUIDE = `
Act as an expert academic document formatter. Your task is to take the provided text and format it into a professional document using Markdown, LaTeX, and custom HTML classes.

### CRITICAL RULES (MUST FOLLOW):
1. **NO CONVERSATIONAL FILLER:** Do NOT say "Here is your document", "I have formatted the text", or "Is there anything else?". Output **ONLY** the code block.
2. **NO SUMMARIZATION:** You must preserve the original content **WORD-FOR-WORD**. Do NOT summarize, shorten, delete, or rephrase the text unless explicitly asked to generate new content.
3. **RAW MARKDOWN OUTPUT:** Return the result inside a single, raw Markdown code block (start with \`\`\`markdown and end with \`\`\`).
4. **NO PAGE BREAKS:** Do not manually insert page breaks. Let the layout handle flow naturally.

### FORMATTING SYNTAX:

1. **Headings:**
   - Use \`#\` for the Main Title.
   - Use \`##\` for Chapter/Section titles.
   - Use \`###\` for Sub-sections.

2. **Mathematics (LaTeX):**
   - **Inline Math:** Wrap equations in single dollar signs. Example: \`$ E=mc^2 \$\`
   - **Block Math (Centered):** Wrap equations in double dollar signs on their own lines.
     Example:
     $$
     \\int_{a}^{b} f(x) dx
     $$

3. **Special Styling (HTML Classes):**
   - **Definitions/Theory:** \`<div class="theory"> ...content... </div>\`
   - **Solutions/Answers:** \`<div class="solution"> ...content... </div>\`
   - **Examples:** \`<div class="example"> ...content... </div>\`
   - **Proofs:** \`<div class="proof"> ...content... </div>\`
   - **Warnings/Alerts:** \`<div class="warning"> ...content... </div>\`
   - **Code/Terminal:** \`<div class="code-snippet"> ...content... </div>\`
   - **Important Highlights:** \`<span class="important"> ...text... </span>\`
   - **Captions:** \`<span class="caption"> Figure 1: Description </span>\`

4. **Advanced Layouts:**
   - **Two Columns:** Use for side-by-side comparisons or images next to text.
     \`<div class="two-columns">\`
       \`<div> ...left content... </div>\`
       \`<div> ...right content... </div>\`
     \`</div>\`
   - **Inline Lists:** Horizontal lists for tags or short items.
     \`<div class="inline-list"> - Item 1 - Item 2 </div>\`
   - **Side Notes:** Floating small note (use sparingly).
     \`<div class="side-note"> ...note... </div>\`

5. **Tables:**
   - Use standard Markdown table syntax.
   - For compact data tables, wrap the Markdown table in: \`<div class="compact-table"> ...md table... </div>\`

### INPUT TEXT TO FORMAT:
[PASTE YOUR TEXT HERE]
`;

export const LOCAL_STORAGE_KEY = 'academic_editor_data_v1';

interface ThemeConfig {
  headerFontFamily: string; // Font for H1, H2, H3
  bodyFontFamily: string;   // Font for p, span, li
  headingColor: string;
  borderColor: string;
  backgroundColor: string;
  textColor?: string;
  accentColor: string; // Used for bullets, special borders, table headers
  isColorful?: boolean;
}

export const THEME_CONFIGS: Record<ThemeType, ThemeConfig> = {
  // --- Existing Themes (Refined) ---
  [ThemeType.ACADEMIC]: {
    headerFontFamily: '"David Libre", serif',
    bodyFontFamily: '"David Libre", serif',
    headingColor: '#1a202c',
    borderColor: '#000',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    accentColor: '#1a202c',
    isColorful: false
  },
  [ThemeType.MODERN]: {
    headerFontFamily: '"Assistant", sans-serif',
    bodyFontFamily: '"Assistant", sans-serif',
    headingColor: '#1d4ed8', // Blue-700
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    textColor: '#374151',
    accentColor: '#3b82f6',
    isColorful: true
  },
  [ThemeType.TECH]: {
    headerFontFamily: '"Rubik", sans-serif',
    bodyFontFamily: '"Rubik", sans-serif',
    headingColor: '#6d28d9', // Violet-700
    borderColor: '#ddd6fe',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    accentColor: '#8b5cf6',
    isColorful: false
  },
  
  [ThemeType.CLEAN]: {
    headerFontFamily: '"IBM Plex Sans Hebrew", sans-serif',
    bodyFontFamily: '"Assistant", sans-serif',
    headingColor: '#0f172a', // Slate-900
    borderColor: '#94a3b8',
    backgroundColor: '#ffffff',
    textColor: '#334155',
    accentColor: '#64748b', // Slate-500
    isColorful: false
  },
  
  [ThemeType.ELEGANT]: {
    headerFontFamily: '"Noto Serif Hebrew", serif',
    bodyFontFamily: '"Assistant", sans-serif',
    headingColor: '#881337', // Rose-900 (Burgundy)
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    textColor: '#1e293b',
    accentColor: '#be123c', // Rose-700
    isColorful: true
  },

  [ThemeType.BOLD]: {
    headerFontFamily: '"Secular One", sans-serif',
    bodyFontFamily: '"Heebo", sans-serif',
    headingColor: '#000000',
    borderColor: '#000000',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    accentColor: '#f59e0b', // Amber-500 (Sharp contrast)
    isColorful: true
  },

  [ThemeType.SOFT]: {
    headerFontFamily: '"Varela Round", sans-serif',
    bodyFontFamily: '"Rubik", sans-serif',
    headingColor: '#4c1d95', // Violet-900
    borderColor: '#e9d5ff',
    backgroundColor: '#ffffff',
    textColor: '#4b5563',
    accentColor: '#a78bfa', // Violet-400
    isColorful: true
  },

  [ThemeType.NEWSPAPER]: {
    headerFontFamily: '"Frank Ruhl Libre", serif', // Classic Headlines
    bodyFontFamily: '"Heebo", sans-serif', // Clean modern body
    headingColor: '#111827',
    borderColor: '#374151',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    accentColor: '#dc2626', // Red accents (Like news)
    isColorful: false
  },

  // Remaining Extra Themes
  [ThemeType.FOREST]: {
    headerFontFamily: '"Heebo", sans-serif',
    bodyFontFamily: '"Assistant", sans-serif',
    headingColor: '#2D4628',
    borderColor: '#8FBC8F',
    backgroundColor: '#ffffff',
    textColor: '#2E2E2E',
    accentColor: '#556B2F',
    isColorful: false
  },
  [ThemeType.CRIMSON]: {
    headerFontFamily: '"League Spartan", sans-serif',
    bodyFontFamily: '"Libre Baskerville", serif',
    headingColor: '#800000',
    borderColor: '#CD5C5C',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    accentColor: '#A52A2A',
    isColorful: false
  },
  [ThemeType.STANDARD]: {
    headerFontFamily: '"Roboto", sans-serif',
    bodyFontFamily: '"Open Sans", sans-serif',
    headingColor: '#0056B3',
    borderColor: '#B0C4DE',
    backgroundColor: '#ffffff',
    textColor: '#1C1C1C',
    accentColor: '#004494',
    isColorful: true
  },
  [ThemeType.COFFEE]: {
    headerFontFamily: '"Raleway", sans-serif',
    bodyFontFamily: '"Nunito", sans-serif',
    headingColor: '#3D2B1F',
    borderColor: '#D2B48C',
    backgroundColor: '#ffffff',
    textColor: '#404040',
    accentColor: '#8B4513',
    isColorful: false
  },
  [ThemeType.IMPACT]: {
    headerFontFamily: '"Archivo Black", sans-serif',
    bodyFontFamily: '"Hind", sans-serif',
    headingColor: '#4B0082',
    borderColor: '#9370DB',
    backgroundColor: '#ffffff',
    textColor: '#101010',
    accentColor: '#6A5ACD',
    isColorful: true
  },
  [ThemeType.SYSTEM]: {
    headerFontFamily: '"Ubuntu", sans-serif',
    bodyFontFamily: '"Arimo", sans-serif',
    headingColor: '#3F51B5',
    borderColor: '#C5CAE9',
    backgroundColor: '#ffffff',
    textColor: '#303030',
    accentColor: '#303F9F',
    isColorful: true
  },

  // --- HEBREW SPECIAL THEMES ---

  [ThemeType.HEBREW_ACADEMIC]: {
    headerFontFamily: '"David Libre", serif',
    bodyFontFamily: '"Frank Ruhl Libre", serif',
    headingColor: '#003366', // Deep Navy
    borderColor: '#1e40af',  // Blue-800
    backgroundColor: '#ffffff',
    textColor: '#0f172a',    // Slate-900
    accentColor: '#1e3a8a',  // Blue-900
    isColorful: true         
  },

  [ThemeType.HEBREW_TECH]: {
    headerFontFamily: '"Heebo", sans-serif',
    bodyFontFamily: '"Assistant", sans-serif',
    headingColor: '#0e7490', // Cyan-700
    borderColor: '#a5f3fc',  // Cyan-200
    backgroundColor: '#f8fafc', 
    textColor: '#334155',    // Slate-700
    accentColor: '#0ea5e9',  // Sky-500
    isColorful: true         
  },

  [ThemeType.HEBREW_LITERATURE]: {
    headerFontFamily: '"Noto Serif Hebrew", serif',
    bodyFontFamily: '"Alef", sans-serif',
    headingColor: '#7c2d12', // Orange-900 (Brownish)
    borderColor: '#fdba74',  // Orange-300
    backgroundColor: '#fffaf5', // Warm paper color
    textColor: '#292524',    // Stone-800
    accentColor: '#c2410c',  // Orange-700
    isColorful: true         
  },

  // --- NEW ADDITIONS (High Contrast & Hebrew) ---

  // 1. MINIMALIST (מינימליסטי)
  // Clean, dark grey tones, modern professional look.
  [ThemeType.MINIMALIST]: {
    headerFontFamily: '"Arimo", sans-serif',
    bodyFontFamily: '"Heebo", sans-serif',
    headingColor: '#111827', // Gray 900
    borderColor: '#9ca3af',  // Gray 400
    backgroundColor: '#ffffff',
    textColor: '#374151',    // Gray 700
    accentColor: '#4b5563',  // Gray 600
    isColorful: false
  },

  // 2. NATURE (טבע)
  // Fresh greens, highly readable dark green text on white.
  [ThemeType.NATURE]: {
    headerFontFamily: '"Secular One", sans-serif',
    bodyFontFamily: '"Assistant", sans-serif',
    headingColor: '#14532d', // Green 900
    borderColor: '#86efac',  // Green 300
    backgroundColor: '#ffffff', 
    textColor: '#1a2e05',    // Dark Moss
    accentColor: '#16a34a',  // Green 600
    isColorful: true
  },

  // 3. OFFICIAL (ממלכתי)
  // Uses "Alef", the standard clear Israeli font. Navy and Gold.
  [ThemeType.OFFICIAL]: {
    headerFontFamily: '"Alef", sans-serif',
    bodyFontFamily: '"Alef", sans-serif',
    headingColor: '#1e3a8a', // Blue 900
    borderColor: '#fcd34d',  // Amber 300 (Gold-ish)
    backgroundColor: '#ffffff',
    textColor: '#020617',    // Slate 950
    accentColor: '#ca8a04',  // Yellow 600 (Dark Gold)
    isColorful: true
  }

};