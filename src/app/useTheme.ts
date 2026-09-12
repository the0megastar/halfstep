import { useState, useEffect, useCallback } from 'react';

export type ColorMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'halfstep-theme';

function getInitialTheme(): ColorMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // localStorage unavailable or restricted
  }
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function useTheme() {
  const [colorMode, setColorMode] = useState<ColorMode>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', colorMode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, colorMode);
    } catch {
      // localStorage unavailable or restricted
    }
  }, [colorMode]);

  const toggleColorMode = useCallback(() => {
    setColorMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return { colorMode, toggleColorMode, setColorMode };
}
