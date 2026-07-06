export type EmploymentTheme = {
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
  };
};

export const EMPLOYMENT_THEMES: EmploymentTheme[] = [
  {
    id: 'standard',
    name: 'استاندارد',
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
    },
  },
  {
    id: 'comprehensive',
    name: 'جامع',
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
    },
  },
];

export function getEmploymentThemeById(id: string): EmploymentTheme {
  return EMPLOYMENT_THEMES.find((t) => t.id === id) ?? (EMPLOYMENT_THEMES[0] as EmploymentTheme);
}
