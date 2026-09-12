import React from 'react';
import type { Injection } from '../../../lib/injections';
import { formatTimestamp } from './dateUtils';

export interface InjectionDetailsProps {
  record: Injection;
  onEdit: () => void;
  onPromptVoid: () => void;
  onBackToHistory: () => void;
}

export function InjectionDetails({
  record,
  onEdit,
  onPromptVoid,
  onBackToHistory,
}: InjectionDetailsProps) {
  return (
    <>
      <p>
        <strong>
          {record.units} units · {record.insulin}
        </strong>
        <br />
        {formatTimestamp(record.administeredAt)}
        <br />
        Caregiver: {record.caregiver}
        <br />
        Status: {record.status}
      </p>

      <h3>Record History</h3>
      <ol className="history-audit">
        {record.events.map((event, index) => (
          <li key={index}>
            <strong>
              {event.action === 'corrected'
                ? 'Edited'
                : event.action === 'created'
                ? 'Created'
                : event.action === 'voided'
                ? 'Voided'
                : event.action}
            </strong>{' '}
            · {formatTimestamp(event.at)}
            <br />
            {event.values.units} units · {formatTimestamp(event.values.administeredAt)} ·{' '}
            {event.values.caregiver}
          </li>
        ))}
      </ol>

      <div className="history-actions">
        {record.status === 'active' && (
          <>
            <button className="btn-secondary" type="button" onClick={onEdit}>
              Edit Entry
            </button>
            <button className="btn-destructive" type="button" onClick={onPromptVoid}>
              Void Entry
            </button>
          </>
        )}
        <button className="btn-ghost" type="button" onClick={onBackToHistory}>
          Back to History
        </button>
      </div>
    </>
  );
}
