import React from 'react';
import { Droplet, Calendar, Plus, Minus, Apple } from 'lucide-react';
import { PATIENT } from '../../../lib/patient';

export interface InjectionFormProps {
  units: string;
  date: string;
  clock: string;
  glucose: string;
  carbs: string;
  onUnitsChange: (val: string) => void;
  onDateChange: (val: string) => void;
  onClockChange: (val: string) => void;
  onGlucoseChange: (val: string) => void;
  onCarbsChange: (val: string) => void;
  onStepDose: (delta: number) => void;
  onSetTimeToNow: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function InjectionForm({
  units,
  date,
  clock,
  glucose,
  carbs,
  onUnitsChange,
  onDateChange,
  onClockChange,
  onGlucoseChange,
  onCarbsChange,
  onStepDose,
  onSetTimeToNow,
  onSubmit,
  onCancel,
}: InjectionFormProps) {
  const max = PATIENT.maxDoseUnits;
  const unitsNum = Number(units);
  const atMax = Number.isFinite(unitsNum) && unitsNum >= max;
  const atMin = !Number.isFinite(unitsNum) || unitsNum <= 0.5;

  return (
    <form className="log-form" onSubmit={onSubmit}>
      <p className="form-subtext">
        {PATIENT.insulinName} · Enter the amount actually given. A calculation does not record an
        injection.
      </p>

      <div className="log-form-card">
        <div className="log-form-row">
          <label htmlFor="history-dose-units" className="history-field-label">
            <Droplet size={16} className="field-icon" />
            <span>Actual Dose</span>
          </label>
          <div className="dose-stepper">
            <button
              type="button"
              className="stepper-btn"
              onClick={() => onStepDose(-0.5)}
              disabled={atMin}
              aria-label="Decrease dose by 0.5 units"
              title="Decrease by 0.5 units"
            >
              <Minus size={18} />
            </button>
            <div className="stepper-input-wrap">
              <input
                id="history-dose-units"
                autoFocus
                type="number"
                inputMode="decimal"
                step="0.5"
                min="0.5"
                max={max}
                required
                value={units}
                onChange={(e) => onUnitsChange(e.target.value)}
                className="stepper-input"
                placeholder="0.5"
              />
              <span className="stepper-unit">units</span>
            </div>
            <button
              type="button"
              className="stepper-btn"
              onClick={() => onStepDose(0.5)}
              disabled={atMax}
              aria-label="Increase dose by 0.5 units"
              title="Increase by 0.5 units"
            >
              <Plus size={18} />
            </button>
          </div>
          <p className="field-hint text-copy-13">Locked maximum {max} units.</p>
        </div>

        <div className="log-form-row">
          <div className="history-field-header log-form-now-row">
            <span className="history-field-label">
              <Calendar size={16} className="field-icon" aria-hidden="true" />
              <span>When given</span>
            </span>
            <button
              type="button"
              className="history-label-action"
              onClick={onSetTimeToNow}
              title="Set date and time to now"
            >
              Set to Now
            </button>
          </div>
          <div className="log-form-row--split log-form-when">
            <div className="log-form-pair">
              <label htmlFor="history-admin-date" className="history-field-label">
                <span>Date</span>
              </label>
              <input
                id="history-admin-date"
                type="date"
                required
                value={date}
                onChange={(e) => onDateChange(e.target.value)}
                className="history-text-input history-date-input"
              />
            </div>
            <div className="log-form-pair">
              <label htmlFor="history-admin-clock" className="history-field-label">
                <span>Time</span>
              </label>
              <input
                id="history-admin-clock"
                type="time"
                required
                value={clock}
                onChange={(e) => onClockChange(e.target.value)}
                className="history-text-input history-time-input"
              />
            </div>
          </div>
        </div>

        <div className="log-form-row log-form-row--split">
          <div className="log-form-pair">
            <label htmlFor="history-glucose" className="history-field-label">
              <Droplet size={16} className="field-icon" />
              <span>Glucose</span>
              <span className="field-optional">Optional</span>
            </label>
            <input
              id="history-glucose"
              type="number"
              inputMode="decimal"
              min={0}
              value={glucose}
              onChange={(e) => onGlucoseChange(e.target.value)}
              placeholder="mg/dL"
              className="history-text-input"
            />
          </div>
          <div className="log-form-pair">
            <label htmlFor="history-carbs" className="history-field-label">
              <Apple size={16} className="field-icon" />
              <span>Carbs</span>
              <span className="field-optional">Optional</span>
            </label>
            <input
              id="history-carbs"
              type="number"
              inputMode="decimal"
              min={0}
              value={carbs}
              onChange={(e) => onCarbsChange(e.target.value)}
              placeholder="grams"
              className="history-text-input"
            />
          </div>
        </div>
      </div>

      <div className="history-actions">
        <button className="btn-primary" type="submit">
          Review Entry
        </button>
        <button className="btn-ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
