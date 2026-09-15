import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_APP_SETTINGS,
  loadAppSettings,
  normalizeMaxDoseWarningUnits,
  saveAppSettings,
  type AppSettings,
} from '../../lib/appSettings';

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => loadAppSettings());

  useEffect(() => {
    setSettings(loadAppSettings());
  }, []);

  const setMaxDoseWarningUnits = useCallback((raw: number | string) => {
    const maxDoseWarningUnits = normalizeMaxDoseWarningUnits(raw);
    setSettings((prev) => {
      const next = { ...prev, maxDoseWarningUnits };
      saveAppSettings(next);
      return next;
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    const next = { ...DEFAULT_APP_SETTINGS };
    saveAppSettings(next);
    setSettings(next);
  }, []);

  return { settings, setMaxDoseWarningUnits, resetToDefaults };
}
