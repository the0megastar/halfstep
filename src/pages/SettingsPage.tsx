import { Lock, Moon, Sun, Type } from 'lucide-react';
import { ROMAN } from '../../lib/dose';
import { PROVISIONAL_MAX_DOSE_WARNING_UNITS } from '../../lib/appSettings';
import type { AppSettings } from '../../lib/appSettings';

export interface SettingsPageProps {
  settings: AppSettings;
  onMaxDoseChange: (value: number | string) => void;
  colorMode: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenTypography?: () => void;
}

export function SettingsPage({
  settings,
  onMaxDoseChange,
  colorMode,
  onToggleTheme,
  onOpenTypography,
}: SettingsPageProps) {
  return (
    <section className="settings-page" aria-labelledby="settings-heading">
      <header className="page-heading">
        <div className="heading-text">
          <h1 id="settings-heading">Settings</h1>
          <p className="eyebrow">APP & PRESCRIBED PARAMETERS</p>
        </div>
      </header>

      <div className="card-surface settings-card">
        <div className="dropdown-header">
          <div className="dropdown-header-main">
            <span className="dropdown-title text-heading-16">Prescribed Settings</span>
            <Lock size={15} className="dropdown-title-lock" aria-label="Locked to physician orders" />
          </div>
        </div>
        <div className="dropdown-metric-list">
          <div className="dropdown-metric-row">
            <div className="dropdown-metric-text">
              <span className="dropdown-metric-name text-label-14">Carb Ratio</span>
              <span className="dropdown-metric-caption text-copy-13">1 unit per {ROMAN.ratio}g carbs</span>
            </div>
            <span className="dropdown-metric-val text-label-14">1 u : {ROMAN.ratio} g</span>
          </div>
          <div className="dropdown-metric-row">
            <div className="dropdown-metric-text">
              <span className="dropdown-metric-name text-label-14">Sensitivity (ISF)</span>
              <span className="dropdown-metric-caption text-copy-13">1 unit drops {ROMAN.sensitivity} mg/dL</span>
            </div>
            <span className="dropdown-metric-val text-label-14">{ROMAN.sensitivity} mg/dL</span>
          </div>
          <div className="dropdown-metric-row">
            <div className="dropdown-metric-text">
              <span className="dropdown-metric-name text-label-14">Target Glucose</span>
              <span className="dropdown-metric-caption text-copy-13">Correct if &ge; {ROMAN.target} mg/dL</span>
            </div>
            <span className="dropdown-metric-val text-label-14">{ROMAN.target} mg/dL</span>
          </div>
        </div>
        <div className="dropdown-footer text-label-12">
          <Lock size={12} className="dropdown-lock-icon" />
          <span>Parameters are locked to physician orders</span>
        </div>
      </div>

      <div className="card-surface settings-card">
        <h2 className="text-heading-16">Dose safety</h2>
        <label className="settings-field" htmlFor="max-dose-warning">
          <span className="dropdown-metric-name text-label-14">Maximum dose warning</span>
          <span className="dropdown-metric-caption text-copy-13">
            Extra confirmation when a recorded dose is at or above this amount. Provisional default
            is {PROVISIONAL_MAX_DOSE_WARNING_UNITS} units — confirm with the care plan.
          </span>
        </label>
        <div className="settings-inline-control">
          <input
            id="max-dose-warning"
            type="number"
            inputMode="decimal"
            min={0.5}
            step={0.5}
            value={settings.maxDoseWarningUnits}
            onChange={(e) => onMaxDoseChange(e.target.value)}
          />
          <span>units</span>
        </div>
      </div>

      <div className="card-surface settings-card">
        <h2 className="text-heading-16">Appearance</h2>
        <button type="button" className="settings-row-btn" onClick={onToggleTheme}>
          {colorMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          <span>{colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}</span>
        </button>
        {onOpenTypography && (
          <button type="button" className="settings-row-btn" onClick={onOpenTypography}>
            <Type size={18} />
            <span>Typography specimen</span>
          </button>
        )}
      </div>
    </section>
  );
}
