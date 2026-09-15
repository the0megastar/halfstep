import type { Injection } from '../../../lib/injections';
import { formatTimestamp } from './dateUtils';

export interface InjectionVoidConfirmationProps {
  record: Injection;
  saving: boolean;
  onConfirmVoid: () => void;
  onCancel: () => void;
}

export function InjectionVoidConfirmation({
  record,
  saving,
  onConfirmVoid,
  onCancel,
}: InjectionVoidConfirmationProps) {
  return (
    <>
      <p>
        Mark the {record.units}-unit entry at {formatTimestamp(record.administeredAt)} as entered in
        error? This does not undo an injection. The original record will remain visible.
      </p>
      <div className="history-actions">
        <button
          className="btn-destructive-solid"
          type="button"
          disabled={saving}
          onClick={onConfirmVoid}
        >
          {saving ? 'Saving…' : 'Confirm Void'}
        </button>
        <button className="btn-ghost" type="button" disabled={saving} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </>
  );
}
