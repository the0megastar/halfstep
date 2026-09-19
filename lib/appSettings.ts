/**
 * Local app settings (not prescribed therapy parameters).
 * maxDoseWarningUnits is provisional until the owner confirms clinically.
 */
export const PROVISIONAL_MAX_DOSE_WARNING_UNITS = 5.0;
export const APP_SETTINGS_KEY = 'halfstep-app-settings-v1';

export interface AppSettings {
  /** Warn when recorded dose is >= this many units. Provisional default. */
  maxDoseWarningUnits: number;
}

export const DEFAULT_APP_SETTINGS: AppSettings = Object.freeze({
  maxDoseWarningUnits: PROVISIONAL_MAX_DOSE_WARNING_UNITS,
});

export function normalizeMaxDoseWarningUnits(raw: unknown): number {
  const n = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : NaN;
  if (!Number.isFinite(n) || n < 0.5) return PROVISIONAL_MAX_DOSE_WARNING_UNITS;
  // Half-unit steps
  return Math.round(n * 2) / 2;
}

export function parseAppSettings(raw: unknown): AppSettings {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_APP_SETTINGS };
  const obj = raw as Record<string, unknown>;
  return {
    maxDoseWarningUnits: normalizeMaxDoseWarningUnits(obj.maxDoseWarningUnits),
  };
}

export function loadAppSettings(): AppSettings {
  if (typeof localStorage === 'undefined') return { ...DEFAULT_APP_SETTINGS };
  try {
    const raw = localStorage.getItem(APP_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_APP_SETTINGS };
    return parseAppSettings(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_APP_SETTINGS };
  }
}

export function saveAppSettings(settings: AppSettings): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const next = {
      maxDoseWarningUnits: normalizeMaxDoseWarningUnits(settings.maxDoseWarningUnits),
    };
    localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(next));
  } catch {
    // ignore quota / privacy mode
  }
}

export function needsMaxDoseWarning(units: number, threshold = loadAppSettings().maxDoseWarningUnits): boolean {
  if (!Number.isFinite(units) || units <= 0) return false;
  const t = normalizeMaxDoseWarningUnits(threshold);
  return units >= t;
}
