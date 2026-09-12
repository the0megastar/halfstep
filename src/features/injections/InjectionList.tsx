import React from 'react';
import { Plus } from 'lucide-react';
import type { Injection } from '../../../lib/injections';
import { injectionProgress, remainingLabel } from '../../../lib/iob';
import { formatDateHeading, formatTimeShort } from './dateUtils';

export interface InjectionListProps {
  records: Injection[];
  now: number;
  loading: boolean;
  onSelectRecord: (record: Injection) => void;
  onStartCreate: () => void;
}

export function InjectionList({
  records,
  now,
  loading,
  onSelectRecord,
  onStartCreate,
}: InjectionListProps) {
  if (loading) {
    return <p role="status">Loading history…</p>;
  }

  if (!records.length) {
    return (
      <>
        <button type="button" className="history-primary" onClick={onStartCreate}>
          <Plus size={17} /> Record Insulin Given
        </button>
        <p>No injections recorded on this device.</p>
      </>
    );
  }

  const sorted = [...records].sort(
    (a, b) => Date.parse(b.administeredAt) - Date.parse(a.administeredAt)
  );

  let previousDay = '';

  return (
    <>
      <button type="button" className="history-primary" onClick={onStartCreate}>
        <Plus size={17} /> Record Insulin Given
      </button>

      <div className="history-list">
        {sorted.map((record) => {
          const day = formatDateHeading(record.administeredAt);
          const timing =
            record.status === 'active'
              ? injectionProgress(record.administeredAt, record.units, now)
              : null;
          const showHeading = day !== previousDay;
          previousDay = day;

          return (
            <div key={record.id}>
              {showHeading && <h3>{day}</h3>}
              <button
                type="button"
                className="history-row"
                onClick={() => onSelectRecord(record)}
              >
                <strong>
                  {record.units} units · NovoLog {record.status === 'voided' && '· Voided'}
                </strong>
                {record.status === 'active' && (
                  <span className="injection-timing">
                    {timing ? (
                      <>
                        <progress
                          max="1"
                          value={timing.fraction}
                          aria-label="Modeled time remaining"
                        />
                        {timing.remainingMs > 0
                          ? `${remainingLabel(timing.remainingMs)} remaining · ${timing.remainingUnits.toFixed(2)} U estimated`
                          : '3-hour interval complete'}
                      </>
                    ) : (
                      'Check injection time: device clock may have changed'
                    )}
                  </span>
                )}
                <span>
                  {formatTimeShort(record.administeredAt)} · {record.caregiver}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
