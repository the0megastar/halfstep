import { formatTimestamp } from './dateUtils';
import type { InjectionValues } from '../../../lib/injections';
import { PATIENT } from '../../../lib/patient';

export interface InjectionConfirmationProps {
  values: InjectionValues;
  isEditing: boolean;
}

export function InjectionConfirmation({ values, isEditing }: InjectionConfirmationProps) {
  const glucoseLabel =
    values.glucoseMgDl != null && Number.isFinite(values.glucoseMgDl)
      ? `${values.glucoseMgDl} mg/dL`
      : '—';
  const carbsLabel =
    values.carbsGrams != null && Number.isFinite(values.carbsGrams)
      ? `${values.carbsGrams} g`
      : '—';

  return (
    <>
      <p className="confirm-lead text-copy-14">Review this entry before saving.</p>
      <dl className="confirm-review confirm-review--dialog">
        <div className="confirm-row">
          <dt>Dose</dt>
          <dd>
            {values.units} units {PATIENT.insulinName}
          </dd>
        </div>
        <div className="confirm-row">
          <dt>Time</dt>
          <dd>{formatTimestamp(values.administeredAt)}</dd>
        </div>
        <div className="confirm-row confirm-row--split">
          <div className="confirm-pair">
            <dt>Glucose</dt>
            <dd>{glucoseLabel}</dd>
          </div>
          <div className="confirm-pair">
            <dt>Carbs</dt>
            <dd>{carbsLabel}</dd>
          </div>
        </div>
      </dl>
      {isEditing && (
        <p className="text-copy-13 confirm-note">
          This edit keeps the original entry in the audit history.
        </p>
      )}
    </>
  );
}
