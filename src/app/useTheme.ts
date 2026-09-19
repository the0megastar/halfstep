import { useState, useEffect, useCallback, useMemo } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ColorMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'halfstep-theme-preference';

function systemColorMode(): ColorMode {
  if (typeof window === 'undefined') return 'light';
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function readPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    // Migrate legacy toggle storage
    const legacy = localStorage.getItem('halfstep-theme');
    if (legacy === 'light' || legacy === 'dark') return legacy;
  } catch {
    // localStorage unavailable or restricted
  }
  return 'system';
}

function resolveMode(preference: ThemePreference): ColorMode {
  return preference === 'system' ? systemColorMode() : preference;
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(readPreference);
  const [systemMode, setSystemMode] = useState<ColorMode>(systemColorMode);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemMode(mq.matches ? 'dark' : 'light');
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const colorMode: ColorMode = useMemo(
    () => (preference === 'system' ? systemMode : preference),
    [preference, systemMode],
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', colorMode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // localStorage unavailable or restricted
    }
  }, [colorMode, preference]);

  const setThemePreference = useCallback((next: ThemePreference) => {
    setPreference(next);
  }, []);

  /** Kept for typography specimen / one-shot flips; prefers explicit light/dark. */
  const toggleColorMode = useCallback(() => {
    setPreference((prev) => {
      const resolved = prev === 'system' ? systemColorMode() : prev;
      return resolved === 'light' ? 'dark' : 'light';
    });
  }, []);

  return { colorMode, preference, setThemePreference, toggleColorMode };
}
