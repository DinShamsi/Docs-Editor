
export enum ThemeType {
  ACADEMIC = 'academic',
  MODERN = 'modern',
  TECH = 'tech',       
  STARTUP = 'startup', 
  NATURE = 'nature',   
  CLASSIC = 'classic',
  // New Themes
  CLEAN = 'clean',     // Minimalist
  ELEGANT = 'elegant', // Luxury
  BOLD = 'bold',       // High Impact
  SOFT = 'soft',       // Friendly
  NEWSPAPER = 'newspaper' // Serif Headings, Sans Body
}

export interface DocSettings {
  title: string; // Document main title
  showDate: boolean; // Show current date under title
  showTOC: boolean; // Show Table of Contents
  theme: ThemeType;
  fontSize: number; // in px
  margins: number; // in mm roughly (padding scale)
  lineHeight: number;
  direction: 'rtl' | 'ltr';
  isCompressed: boolean; // New Smart Compression Mode
}

export interface EditorProps {
  value: string;
  onChange: (val: string) => void;
  direction: 'rtl' | 'ltr';
}

export interface PreviewProps {
  content: string;
  settings: DocSettings;
}

export interface SidebarProps {
  settings: DocSettings;
  onUpdate: (newSettings: Partial<DocSettings>) => void;
  onExport: () => void;
  onPrint: () => void;
  onSave: () => void; // New
  hasUnsavedChanges: boolean; // New
}