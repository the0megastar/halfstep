import React from 'react';
import { formatTimestamp } from './dateUtils';
import type { InjectionValues } from '../../../lib/injections';

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
  return (
    <>
      <p>
        Confirm that <strong>{values.units} units of NovoLog</strong> were administered at{' '}
        <strong>{formatTimestamp(values.administeredAt)}</strong> by <strong>{values.caregiver}</strong>.
      </p>
      {isEditing && <p>This edit preserves the original entry in the audit history.</p>}
      <div className="history-actions">
        <button className="btn-primary" disabled={saving} onClick={onConfirm}>
          {saving ? 'Saving…' : 'Confirm and Save'}
        </button>
        <button className="btn-ghost" disabled={saving} onClick={onBack}>
          Back
        </button>
      </div>
    </>
  );
}
