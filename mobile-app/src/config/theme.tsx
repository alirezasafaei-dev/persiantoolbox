import React, {createContext, useContext, ReactNode} from 'react';
import {useColorScheme} from 'react-native';

type ThemeContextType = {
  isDark: boolean;
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    primary: string;
    border: string;
  };
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: {
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b',
    primary: '#6366f1',
    border: '#e2e8f0',
  },
});

export function ThemeProvider({children}: {children: ReactNode}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = isDark
    ? {
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f1f5f9',
        textSecondary: '#94a3b8',
        primary: '#818cf8',
        border: '#334155',
      }
    : {
        background: '#f8fafc',
        surface: '#ffffff',
        text: '#1e293b',
        textSecondary: '#64748b',
        primary: '#6366f1',
        border: '#e2e8f0',
      };

  return (
    <ThemeContext.Provider value={{isDark, colors}}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
