export type CertificateTheme = {
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
    seal: string;
  };
};

export const CERTIFICATE_THEMES: CertificateTheme[] = [
  {
    id: 'formal',
    name: 'رسمی',
    colors: {
      primary: '#1e3a5f',
      secondary: '#475569',
      accent: '#2563eb',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#cbd5e1',
      headerBg: '#1e3a5f',
      headerText: '#ffffff',
      seal: '#dc2626',
    },
  },
  {
    id: 'modern',
    name: 'مدرن',
    colors: {
      primary: '#0f766e',
      secondary: '#5eead4',
      accent: '#0d9488',
      background: '#f0fdfa',
      surface: '#ffffff',
      text: '#134e4a',
      textSecondary: '#5eead4',
      border: '#99f6e4',
      headerBg: '#0f766e',
      headerText: '#ffffff',
      seal: '#dc2626',
    },
  },
  {
    id: 'bilingual',
    name: 'دو زبانه',
    colors: {
      primary: '#6d28d9',
      secondary: '#a78bfa',
      accent: '#7c3aed',
      background: '#faf5ff',
      surface: '#ffffff',
      text: '#1e1b4b',
      textSecondary: '#6b7280',
      border: '#e9d5ff',
      headerBg: '#6d28d9',
      headerText: '#ffffff',
      seal: '#dc2626',
    },
  },
];

export function getCertificateThemeById(id: string): CertificateTheme {
  return CERTIFICATE_THEMES.find((t) => t.id === id) ?? CERTIFICATE_THEMES[0]!;
}
