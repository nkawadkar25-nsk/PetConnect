import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark';
export type AccentColor = 'emerald' | 'teal' | 'amber' | 'indigo' | 'rose';

export interface ThemeConfig {
  name: string;
  id: AccentColor;
  primaryHex: string;
  accentClass: {
    btnPrimary: string;
    textPrimary: string;
    bgSubtle: string;
    borderSubtle: string;
    activeTab: string;
    ring: string;
  };
}

export const ACCENT_PALETTES: Record<AccentColor, ThemeConfig> = {
  emerald: {
    name: 'Forest Sage',
    id: 'emerald',
    primaryHex: '#059669',
    accentClass: {
      btnPrimary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      textPrimary: 'text-emerald-700 dark:text-emerald-400',
      bgSubtle: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderSubtle: 'border-emerald-200 dark:border-emerald-800/60',
      activeTab: 'bg-emerald-600 text-white',
      ring: 'focus:ring-emerald-500/30',
    },
  },
  teal: {
    name: 'Coastal Teal',
    id: 'teal',
    primaryHex: '#0d9488',
    accentClass: {
      btnPrimary: 'bg-teal-600 hover:bg-teal-700 text-white',
      textPrimary: 'text-teal-700 dark:text-teal-400',
      bgSubtle: 'bg-teal-50 dark:bg-teal-950/40',
      borderSubtle: 'border-teal-200 dark:border-teal-800/60',
      activeTab: 'bg-teal-600 text-white',
      ring: 'focus:ring-teal-500/30',
    },
  },
  amber: {
    name: 'Warm Honey',
    id: 'amber',
    primaryHex: '#d97706',
    accentClass: {
      btnPrimary: 'bg-amber-600 hover:bg-amber-700 text-white',
      textPrimary: 'text-amber-700 dark:text-amber-400',
      bgSubtle: 'bg-amber-50 dark:bg-amber-950/40',
      borderSubtle: 'border-amber-200 dark:border-amber-800/60',
      activeTab: 'bg-amber-600 text-white',
      ring: 'focus:ring-amber-500/30',
    },
  },
  indigo: {
    name: 'Nordic Indigo',
    id: 'indigo',
    primaryHex: '#4f46e5',
    accentClass: {
      btnPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      textPrimary: 'text-indigo-700 dark:text-indigo-400',
      bgSubtle: 'bg-indigo-50 dark:bg-indigo-950/40',
      borderSubtle: 'border-indigo-200 dark:border-indigo-800/60',
      activeTab: 'bg-indigo-600 text-white',
      ring: 'focus:ring-indigo-500/30',
    },
  },
  rose: {
    name: 'Terra Rose',
    id: 'rose',
    primaryHex: '#e11d48',
    accentClass: {
      btnPrimary: 'bg-rose-600 hover:bg-rose-700 text-white',
      textPrimary: 'text-rose-700 dark:text-rose-400',
      bgSubtle: 'bg-rose-50 dark:bg-rose-950/40',
      borderSubtle: 'border-rose-200 dark:border-rose-800/60',
      activeTab: 'bg-rose-600 text-white',
      ring: 'focus:ring-rose-500/30',
    },
  },
};

interface ThemeContextType {
  mode: ThemeMode;
  accent: AccentColor;
  themeConfig: ThemeConfig;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('petconnect_theme_mode') as ThemeMode;
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [accent, setAccentState] = useState<AccentColor>(() => {
    const saved = localStorage.getItem('petconnect_accent_color') as AccentColor;
    return saved && ACCENT_PALETTES[saved] ? saved : 'emerald';
  });

  useEffect(() => {
    localStorage.setItem('petconnect_theme_mode', mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('petconnect_accent_color', accent);
  }, [accent]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  const toggleMode = () => {
    setModeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setAccent = (newAccent: AccentColor) => {
    setAccentState(newAccent);
  };

  const themeConfig = ACCENT_PALETTES[accent] || ACCENT_PALETTES.emerald;

  return (
    <ThemeContext.Provider
      value={{
        mode,
        accent,
        themeConfig,
        setMode,
        setAccent,
        toggleMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
