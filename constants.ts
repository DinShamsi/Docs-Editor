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
   - **Definitions, Theorems, Theory:** Wrap the entire block in:
     \`<div class="theory"> ...content... </div>\`
   - **Solutions, Proofs, Examples:** Wrap the entire block in:
     \`<div class="solution"> ...content... </div>\`
   - **Important Highlights:** Wrap specific words/phrases in:
     \`<span class="important"> ...text... </span>\`

4. **Tables:**
   - Use standard Markdown table syntax.
   - Ensure columns are aligned correctly.

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
  [ThemeType.STARTUP]: {
    headerFontFamily: '"Heebo", sans-serif',
    bodyFontFamily: '"Heebo", sans-serif',
    headingColor: '#be185d', // Pink-700
    borderColor: '#fbcfe8',
    backgroundColor: '#ffffff',
    textColor: '#4b5563',
    accentColor: '#ec4899',
    isColorful: false
  },
  [ThemeType.NATURE]: {
    headerFontFamily: '"Alef", sans-serif',
    bodyFontFamily: '"Alef", sans-serif',
    headingColor: '#15803d', // Green-700
    borderColor: '#bbf7d0',
    backgroundColor: '#ffffff',
    textColor: '#14532d',
    accentColor: '#22c55e',
    isColorful: false
  },
  [ThemeType.CLASSIC]: {
    headerFontFamily: '"Frank Ruhl Libre", serif',
    bodyFontFamily: '"Frank Ruhl Libre", serif',
    headingColor: '#451a03', // Amber-950
    borderColor: '#d6d3d1',
    backgroundColor: '#ffffff',
    textColor: '#292524',
    accentColor: '#78350f',
    isColorful: false
  },

  // --- NEW THEMES ---

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
  }
};