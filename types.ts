import React from 'react';

export enum ThemeType {
  // Existing Kept
  ACADEMIC = 'academic',
  MODERN = 'modern',
  TECH = 'tech',       
  CLEAN = 'clean',     
  ELEGANT = 'elegant', 
  BOLD = 'bold',       
  SOFT = 'soft',       
  NEWSPAPER = 'newspaper',

  // Remaining from previous batch
  FOREST = 'forest', 
  CRIMSON = 'crimson', 
  STANDARD = 'standard', 
  COFFEE = 'coffee', 
  IMPACT = 'impact', 
  SYSTEM = 'system', 

  // Hebrew Special Themes
  HEBREW_ACADEMIC = 'hebrew_academic',
  HEBREW_TECH = 'hebrew_tech',
  HEBREW_LITERATURE = 'hebrew_lit',

  // --- NEW ADDITIONS ---
  MINIMALIST = 'minimalist', // Arimo + Heebo (Greyscale)
  NATURE = 'nature',         // Secular One + Assistant (Greens)
  OFFICIAL = 'official'      // Alef (Blue/Gold)
}

export type CompressionLevel = 'none' | 'low' | 'medium' | 'high';

export type ViewMode = 'split' | 'editor' | 'preview';

export interface DocSettings {
  title: string; 
  showDate: boolean; 
  showTOC: boolean; 
  theme: ThemeType;
  fontSize: number; 
  margins: number; 
  lineHeight: number;
  direction: 'rtl' | 'ltr';
  compressionLevel: CompressionLevel; 
}

export interface EditorProps {
  value: string;
  onChange: (val: string) => void;
  direction: 'rtl' | 'ltr';
  onScroll?: (percentage: number) => void;
  scrollRef?: React.RefObject<HTMLTextAreaElement>;
  isSyncScroll: boolean;
  onToggleSyncScroll: () => void;
}

export interface PreviewProps {
  content: string;
  settings: DocSettings;
  scrollRef?: React.RefObject<HTMLDivElement>;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
}

export interface SidebarProps {
  settings: DocSettings;
  onUpdate: (newSettings: Partial<DocSettings>) => void;
  onExport: () => void;
  onExportHTML: () => void; // New Prop
  onPrint: () => void;
  onSave: () => void;
  onDownload: () => void; 
  onImport: (content: string) => void; 
  onReset: () => void; 
  hasUnsavedChanges: boolean;
  viewMode: ViewMode; 
  onViewModeChange: (mode: ViewMode) => void; 
  isSidebarOpen: boolean; 
  onToggleSidebar: () => void; 
}

export interface ToastNotification {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}