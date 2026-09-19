import { formatTimestamp } from './dateUtils';
import type { InjectionValues } from '../../../lib/injections';
import { PATIENT } from '../../../lib/patient';

export interface InjectionConfirmationProps {
  values: InjectionValues;
  isEditing: boolean;
  saving: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

export function InjectionConfirmation({
  values,
  isEditing,
  saving,
  onConfirm,
  onBack,
}: InjectionConfirmationProps) {
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
      <dl className="confirm-review">
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
      <div className="history-actions">
        <button className="btn-primary" disabled={saving} onClick={onConfirm}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button className="btn-ghost" disabled={saving} onClick={onBack}>
          Back
        </button>
      </div>
    </>
  );
}
