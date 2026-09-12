import React from 'react';
import { Droplet, Clock, User, Plus, Minus } from 'lucide-react';

export interface InjectionFormProps {
  units: string;
  time: string;
  caregiver: string;
  onUnitsChange: (val: string) => void;
  onTimeChange: (val: string) => void;
  onCaregiverChange: (val: string) => void;
  onStepDose: (delta: number) => void;
  onSetTimeToNow: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function InjectionForm({
  units,
  time,
  caregiver,
  onUnitsChange,
  onTimeChange,
  onCaregiverChange,
  onStepDose,
  onSetTimeToNow,
  onSubmit,
  onCancel,
}: InjectionFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <p className="form-subtext">
        NovoLog · Enter the amount actually administered. A calculation does not record an injection.
      </p>

      <div className="history-field">
        <label htmlFor="history-dose-units" className="history-field-label">
          <Droplet size={16} className="field-icon" />
          <span>Actual Dose</span>
        </label>
        <div className="dose-stepper">
          <button
            type="button"
            className="stepper-btn"
            onClick={() => onStepDose(-0.5)}
            disabled={!units || Number(units) <= 0.5}
            aria-label="Decrease dose by 0.5 units"
            title="Decrease by 0.5 units"
          >
            <Minus size={18} />
          </button>
          <div className="stepper-input-wrapper">
            <input
              id="history-dose-units"
              autoFocus
              type="number"
              inputMode="decimal"
              step="0.5"
              min="0.5"
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
            aria-label="Increase dose by 0.5 units"
            title="Increase by 0.5 units"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="history-field">
        <div className="history-field-header">
          <label htmlFor="history-admin-time" className="history-field-label">
            <Clock size={16} className="field-icon" />
            <span>Administration Date & Time</span>
          </label>
          <button
            type="button"
            className="history-label-action"
            onClick={onSetTimeToNow}
            title="Reset to current device time"
          >
            Set to Now
          </button>
        </div>
        <input
          id="history-admin-time"
          type="datetime-local"
          required
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          className="history-datetime-input"
          title="Local device time"
        />
      </div>

      <div className="history-field">
        <label htmlFor="history-caregiver" className="history-field-label">
          <User size={16} className="field-icon" />
          <span>Caregiver</span>
        </label>
        <input
          id="history-caregiver"
          required
          maxLength={100}
          value={caregiver}
          onChange={(e) => onCaregiverChange(e.target.value)}
          autoComplete="name"
          placeholder="e.g. Mom, Dad, Nurse"
          className="history-text-input"
        />
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
