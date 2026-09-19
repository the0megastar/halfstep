import type { Injection } from '../../../lib/injections';
import { formatTimestamp } from './dateUtils';

export interface InjectionDetailsProps {
  record: Injection;
  onEdit: () => void;
  onPromptVoid: () => void;
  onClose: () => void;
}

function eventLabel(action: string): string {
  if (action === 'corrected') return 'Edited';
  if (action === 'created') return 'Created';
  if (action === 'voided') return 'Voided';
  return action;
}

export function InjectionDetails({
  record,
  onEdit,
  onPromptVoid,
  onClose,
}: InjectionDetailsProps) {
  const glucoseLabel =
    record.glucoseMgDl != null && Number.isFinite(record.glucoseMgDl)
      ? `${record.glucoseMgDl} mg/dL`
      : '—';
  const carbsLabel =
    record.carbsGrams != null && Number.isFinite(record.carbsGrams)
      ? `${record.carbsGrams} g`
      : '—';
  const isActive = record.status === 'active';
  // Summary already shows current dose/time; audit only earns space after a change.
  const showAudit = record.events.some((event) => event.action !== 'created');

  return (
    <>
      <header className="history-sheet-header">
        <h2 id="injection-detail-title" className="text-heading-16">
          Injection details
        </h2>
      </header>

      <dl className="confirm-review confirm-review--dialog">
        <div className="confirm-row">
          <dt>Dose</dt>
          <dd>
            {record.units} units {record.insulin}
            {!isActive ? ' · voided' : ''}
          </dd>
        </div>
        <div className="confirm-row">
          <dt>Time</dt>
          <dd>{formatTimestamp(record.administeredAt)}</dd>
        </div>
        <div className="confirm-row">
          <dt>Glucose</dt>
          <dd>{glucoseLabel}</dd>
        </div>
        <div className="confirm-row">
          <dt>Carbs</dt>
          <dd>{carbsLabel}</dd>
        </div>
      </dl>

      {showAudit && (
        <>
          <h3 className="history-sheet-section text-heading-14">Changes</h3>
          <ol className="history-audit">
            {record.events
              .filter((event) => event.action !== 'created')
              .map((event, index) => (
                <li key={index}>
                  <strong>{eventLabel(event.action)}</strong>
                  <span className="history-audit-meta"> · {formatTimestamp(event.at)}</span>
                  <br />
                  <span className="history-audit-detail">
                    {event.values.units} units · {formatTimestamp(event.values.administeredAt)}
                  </span>
                </li>
              ))}
          </ol>
        </>
      )}

      <div className="history-sheet-actions">
        <button type="button" className="btn-ghost" onClick={onClose}>
          Close
        </button>
        {isActive && (
          <>
            <button type="button" className="btn-secondary" onClick={onEdit}>
              Edit
            </button>
            <button type="button" className="btn-destructive" onClick={onPromptVoid}>
              Void
            </button>
          </>
        )}
      </div>
    </>
  );
}
