export type ResumeTheme = {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    headerBg: string;
    headerText: string;
    link: string;
  };
};

export const RESUME_THEMES: ResumeTheme[] = [
  {
    id: 'professional',
    name: 'حرفه‌ای',
    colors: {
      primary: '#1e293b',
      secondary: '#475569',
      accent: '#2563eb',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      headerBg: '#1e293b',
      headerText: '#ffffff',
      link: '#2563eb',
    },
  },
  {
    id: 'modern',
    name: 'مدرن',
    colors: {
      primary: '#2563eb',
      secondary: '#60a5fa',
      accent: '#2563eb',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      headerBg: '#2563eb',
      headerText: '#ffffff',
      link: '#2563eb',
    },
  },
  {
    id: 'minimal',
    name: 'مینیمال',
    colors: {
      primary: '#374151',
      secondary: '#6b7280',
      accent: '#374151',
      background: '#ffffff',
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#d1d5db',
      headerBg: '#ffffff',
      headerText: '#111827',
      link: '#374151',
    },
  },
  {
    id: 'creative',
    name: 'خلاقانه',
    colors: {
      primary: '#7c3aed',
      secondary: '#a78bfa',
      accent: '#7c3aed',
      background: '#faf5ff',
      surface: '#ffffff',
      text: '#1e1b4b',
      textSecondary: '#6b7280',
      border: '#e9d5ff',
      headerBg: '#7c3aed',
      headerText: '#ffffff',
      link: '#7c3aed',
    },
  },
  {
    id: 'elegant',
    name: 'شیک',
    colors: {
      primary: '#1e293b',
      secondary: '#475569',
      accent: '#0f766e',
      background: '#f0fdfa',
      surface: '#ffffff',
      text: '#134e4a',
      textSecondary: '#5eead4',
      border: '#99f6e4',
      headerBg: '#134e4a',
      headerText: '#ffffff',
      link: '#0f766e',
    },
  },
];

export function getResumeThemeById(id: string): ResumeTheme {
  return RESUME_THEMES.find((t) => t.id === id) ?? (RESUME_THEMES[0] as ResumeTheme);
}
