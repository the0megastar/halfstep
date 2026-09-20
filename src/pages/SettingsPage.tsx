import { Lock } from 'lucide-react';
import { PATIENT, CARB_RATIO_MAP } from '../../lib/patient';
import type { ThemePreference } from '../app/useTheme';
import { PageHeader } from '../components/ui/PageHeader';

export interface SettingsPageProps {
  themePreference: ThemePreference;
  onThemePreferenceChange: (value: ThemePreference) => void;
}

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'Automatic' },
];

export function SettingsPage({
  themePreference,
  onThemePreferenceChange,
}: SettingsPageProps) {
  const diaHours = Number(PATIENT.durationOfInsulinHours);
  const diaLabel = diaHours === 1 ? '1 hour' : `${diaHours} hours`;

  return (
    <section className="settings-page" aria-labelledby="settings-heading">
      <PageHeader
        title="Settings"
        titleId="settings-heading"
        intro="Appearance and locked insulin parameters."
      />

      <div className="card-surface settings-card settings-card--locked">
        <div className="settings-card-header">
          <span className="text-heading-16">Locked Insulin Parameters</span>
          <Lock size={15} className="settings-lock" aria-label="Locked" />
        </div>
        <div className="settings-metric-list" role="list">
          <div className="settings-metric-row" role="listitem">
            <span className="settings-metric-name text-label-14">Name</span>
            <span className="settings-metric-val text-label-14">{PATIENT.name}</span>
          </div>
          <div className="settings-metric-row" role="listitem">
            <span className="settings-metric-name text-label-14">Insulin</span>
            <span className="settings-metric-val text-label-14">{PATIENT.insulinName}</span>
          </div>
          <div className="settings-metric-row" role="listitem">
            <span className="settings-metric-name text-label-14">Carb Ratio (Breakfast)</span>
            <span className="settings-metric-val text-label-14">1u : {CARB_RATIO_MAP.breakfast}g</span>
          </div>
          <div className="settings-metric-row" role="listitem">
            <span className="settings-metric-name text-label-14">Carb Ratio (School)</span>
            <span className="settings-metric-val text-label-14">1u : {CARB_RATIO_MAP.school}g</span>
          </div>
          <div className="settings-metric-row" role="listitem">
            <span className="settings-metric-name text-label-14">Carb Ratio (Dinner)</span>
            <span className="settings-metric-val text-label-14">1u : {CARB_RATIO_MAP.dinner}g</span>
          </div>
          <div className="settings-metric-row" role="listitem">
            <span className="settings-metric-name text-label-14">Sensitivity (ISF)</span>
            <span className="settings-metric-val text-label-14">{PATIENT.isf} mg/dL</span>
          </div>
          <div className="settings-metric-row" role="listitem">
            <span className="settings-metric-name text-label-14">Target Glucose</span>
            <span className="settings-metric-val text-label-14">{PATIENT.targetGlucose} mg/dL</span>
          </div>
          <div className="settings-metric-row" role="listitem">
            <span className="settings-metric-name text-label-14">Maximum Dose</span>
            <span className="settings-metric-val text-label-14">{PATIENT.maxDoseUnits} units</span>
          </div>
          <div className="settings-metric-row" role="listitem">
            <span className="settings-metric-name text-label-14">Insulin Duration</span>
            <span className="settings-metric-val text-label-14">{diaLabel}</span>
          </div>
          <div className="settings-metric-row" role="listitem">
            <span className="settings-metric-name text-label-14">Low Glucose Gate</span>
            <span className="settings-metric-val text-label-14">
              ≤ {PATIENT.lowGlucoseMgDl} mg/dL
            </span>
          </div>
          <div className="settings-metric-row" role="listitem">
            <span className="settings-metric-name text-label-14">Carb Check Gate</span>
            <span className="settings-metric-val text-label-14">
              &gt; {PATIENT.highCarbsGrams} g
            </span>
          </div>
        </div>
        <p className="settings-card-footer text-label-12">
          <Lock size={12} aria-hidden="true" />
          Locked
        </p>
      </div>

      <div className="card-surface settings-card settings-card--teaching">
        <h2 className="text-heading-16">How These Numbers Work</h2>
        <div className="settings-teaching text-copy-13">
          <p>
            Carb ratio turns food grams into insulin. The ratio varies by meal context (Breakfast,
            School, or Dinner) to match how insulin needs change across the day. Sensitivity (ISF) turns how far glucose sits
            above target into a correction.
          </p>
          <p>
            The suggested dose is food coverage plus correction, then rounded to the nearest half
            unit.
          </p>
          <p>
            Insulin on board fades in a straight line over {diaLabel}. The maximum dose is a hard
            ceiling for suggestions and logs.
          </p>
          <p>
            At or below {PATIENT.lowGlucoseMgDl} mg/dL, Halfstep does not suggest insulin. Follow
            your hypoglycemia plan.
          </p>
          <p>
            Above {PATIENT.highCarbsGrams} g of carbs, Halfstep asks you to confirm the count. If
            the half-unit math is above the locked maximum of {PATIENT.maxDoseUnits} units, Halfstep
            does not suggest a dose.
          </p>
          <p className="settings-teaching-footnote">
            These locked values come from the care plan baked into this build.
          </p>
        </div>
      </div>
<div className="card-surface settings-card">
        <h2 className="text-heading-16" id="appearance-heading">Appearance</h2>
        <div
          className="theme-segmented"
          role="radiogroup"
          aria-labelledby="appearance-heading"
        >
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={themePreference === opt.value}
              className={`theme-segment${themePreference === opt.value ? ' is-selected' : ''}`}
              onClick={() => onThemePreferenceChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

          </section>
  );
}
