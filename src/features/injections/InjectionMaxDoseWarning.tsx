import { AlertTriangle } from 'lucide-react';

export interface InjectionMaxDoseWarningProps {
  units: number;
  threshold: number;
  onAcknowledge: () => void;
  onBack: () => void;
}

export function InjectionMaxDoseWarning({
  units,
  threshold,
  onAcknowledge,
  onBack,
}: InjectionMaxDoseWarningProps) {
  return (
    <>
      <p className="history-warning-lead" role="status">
        <AlertTriangle size={18} aria-hidden="true" />
        <span>
          This dose is at or above your warning threshold of {threshold} units. Confirm you meant
          to enter {units} units.
        </span>
      </p>
      <p className="form-subtext">
        The threshold is provisional until confirmed with the care plan. Confirming does not change
        the dose you entered.
      </p>
      <div className="history-actions">
        <button className="btn-primary" type="button" onClick={onAcknowledge}>
          Confirm dose amount
        </button>
        <button className="btn-ghost" type="button" onClick={onBack}>
          Back to edit
        </button>
      </div>
    </>
  );
}
