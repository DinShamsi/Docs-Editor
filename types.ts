import React from 'react';

export enum ThemeType {
  ACADEMIC = 'academic',
  MODERN = 'modern',
  TECH = 'tech',       
  STARTUP = 'startup', 
  NATURE = 'nature',   
  CLASSIC = 'classic',
  CLEAN = 'clean',     
  ELEGANT = 'elegant', 
  BOLD = 'bold',       
  SOFT = 'soft',       
  NEWSPAPER = 'newspaper' 
}

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
  isCompressed: boolean; 
}

export interface EditorProps {
  value: string;
  onChange: (val: string) => void;
  direction: 'rtl' | 'ltr';
  onScroll?: (percentage: number) => void;
  scrollRef?: React.RefObject<HTMLTextAreaElement>;
}

export interface PreviewProps {
  content: string;
  settings: DocSettings;
  scrollRef?: React.RefObject<HTMLDivElement>;
}

export interface SidebarProps {
  settings: DocSettings;
  onUpdate: (newSettings: Partial<DocSettings>) => void;
  onExport: () => void;
  onPrint: () => void;
  onSave: () => void;
  onDownload: () => void; 
  onImport: (content: string) => void; 
  onReset: () => void; // New
  hasUnsavedChanges: boolean;
  viewMode: ViewMode; 
  onViewModeChange: (mode: ViewMode) => void; 
  isSidebarOpen: boolean; // New
  onToggleSidebar: () => void; // New
}

export interface ToastNotification {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}