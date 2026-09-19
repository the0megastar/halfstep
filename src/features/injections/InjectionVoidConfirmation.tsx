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
      <header className="history-sheet-header">
        <h2 id="injection-void-title" className="text-heading-16">
          Void this entry?
        </h2>
      </header>

      <dl className="confirm-review confirm-review--dialog">
        <div className="confirm-row">
          <dt>Dose</dt>
          <dd>
            {record.units} units {record.insulin}
          </dd>
        </div>
        <div className="confirm-row">
          <dt>Time</dt>
          <dd>{formatTimestamp(record.administeredAt)}</dd>
        </div>
      </dl>

      <p className="text-copy-13 confirm-note">
        Marks the entry as entered in error. It does not undo insulin that was given. The original
        record stays visible in history.
      </p>

      <div className="confirm-dialog-actions">
        <button
          type="button"
          className="btn-ghost"
          disabled={saving}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn-destructive-solid"
          disabled={saving}
          onClick={onConfirmVoid}
        >
          {saving ? 'Saving…' : 'Void'}
        </button>
      </div>
    </>
  );
}
