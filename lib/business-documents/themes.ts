export type InvoiceTheme = {
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
    discount: string;
  };
};

export const INVOICE_THEMES: InvoiceTheme[] = [
  {
    id: 'classic',
    name: 'کلاسیک',
    colors: {
      primary: '#1e293b',
      secondary: '#475569',
      accent: '#2563eb',
      background: '#f1f5f9',
      surface: '#ffffff',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      headerBg: '#1e293b',
      headerText: '#ffffff',
      discount: '#dc2626',
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
      discount: '#dc2626',
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
      discount: '#dc2626',
    },
  },
  {
    id: 'warm',
    name: 'گرم',
    colors: {
      primary: '#92400e',
      secondary: '#b45309',
      accent: '#d97706',
      background: '#fffbeb',
      surface: '#ffffff',
      text: '#1c1917',
      textSecondary: '#78716c',
      border: '#e7e5e4',
      headerBg: '#92400e',
      headerText: '#ffffff',
      discount: '#dc2626',
    },
  },
  {
    id: 'professional',
    name: 'حرفه‌ای',
    colors: {
      primary: '#0f766e',
      secondary: '#14b8a6',
      accent: '#0d9488',
      background: '#f0fdfa',
      surface: '#ffffff',
      text: '#134e4a',
      textSecondary: '#5eead4',
      border: '#99f6e4',
      headerBg: '#0f766e',
      headerText: '#ffffff',
      discount: '#dc2626',
    },
  },
];

export function getThemeById(id: string): InvoiceTheme {
  return INVOICE_THEMES.find((t) => t.id === id) ?? (INVOICE_THEMES[0] as InvoiceTheme);
}
