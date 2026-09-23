import { AlertTriangle } from 'lucide-react';

export interface InjectionMaxDoseWarningProps {
  units: number;
  threshold: number;
}

export function InjectionMaxDoseWarning({ units, threshold }: InjectionMaxDoseWarningProps) {
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
    </>
  );
}
