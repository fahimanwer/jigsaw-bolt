import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

type ThemeType = 'light' | 'dark';

interface ThemeContextProps {
  theme: ThemeType;
  isDark: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    cardBg: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: 'light',
  isDark: false,
  colors: {
    primary: '#4A90E2',
    secondary: '#7E57C2',
    accent: '#F5A623',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    background: '#F5F5F5',
    cardBg: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    border: '#E0E0E0',
  },
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>(colorScheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    setTheme(colorScheme === 'dark' ? 'dark' : 'light');
  }, [colorScheme]);

  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const lightColors = {
    primary: '#4A90E2',
    secondary: '#7E57C2',
    accent: '#F5A623',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    background: '#F5F5F5',
    cardBg: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    border: '#E0E0E0',
  };

  const darkColors = {
    primary: '#5B9FFF',
    secondary: '#9575CD',
    accent: '#FFB74D',
    success: '#66BB6A',
    warning: '#FFA726',
    error: '#EF5350',
    background: '#121212',
    cardBg: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    border: '#333333',
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, isDark, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);