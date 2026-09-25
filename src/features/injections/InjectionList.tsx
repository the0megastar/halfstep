import { Plus } from 'lucide-react';
import type { Injection } from '../../../lib/injections';
import { PATIENT } from '../../../lib/patient';
import { injectionProgress, remainingLabel } from '../../../lib/iob';
import { formatDateHeading, formatTimeShort } from './dateUtils';

/**
 * Compact row facts with list hierarchy (Apple/Material):
 * dose is primary; time + labs are supporting. Unit suffixes stay quieter than values.
 * Default insulin omitted (locked in Settings). Voided keeps the whole line muted.
 */
function CompactFacts({
  record,
  emphasizeDose,
}: {
  record: Injection;
  emphasizeDose: boolean;
}) {
  const meta: { value: string; unit?: string }[] = [
    { value: formatTimeShort(record.administeredAt) },
  ];
  if (record.glucoseMgDl != null && Number.isFinite(record.glucoseMgDl)) {
    meta.push({ value: String(record.glucoseMgDl), unit: 'mg/dL' });
  }
  if (record.carbsGrams != null && Number.isFinite(record.carbsGrams)) {
    meta.push({ value: String(record.carbsGrams), unit: 'g' });
  }
  if (record.carbRatio != null && Number.isFinite(record.carbRatio)) {
    meta.push({ value: `1:${record.carbRatio}` });
  }
  if (record.insulin && record.insulin !== PATIENT.insulinName) {
    meta.push({ value: record.insulin });
  }

  return (
    <span className="history-compact-facts">
      {/* Same type size for complete + voided; mute only via color */}
      <strong
        className={`text-heading-14 history-compact-dose${
          emphasizeDose ? '' : ' history-compact-dose--muted'
        }`}
      >
        {record.units} U
      </strong>
      <span className="history-compact-meta text-copy-13">
        {meta.map((part, i) => (
          <span key={`${part.value}-${part.unit ?? ''}`} className="history-compact-part">
            {i > 0 ? (
              <span className="history-compact-sep" aria-hidden="true">
                ·
              </span>
            ) : null}
            <span className="history-compact-value">{part.value}</span>
            {part.unit ? (
              <span className="history-compact-unit"> {part.unit}</span>
            ) : null}
          </span>
        ))}
      </span>
    </span>
  );
}

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

  const dayKey = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Newest day first; within a day, active/complete above voided; then newest time.
  const sorted = [...records].sort((a, b) => {
    const dayA = dayKey(a.administeredAt);
    const dayB = dayKey(b.administeredAt);
    if (dayA !== dayB) return dayB.localeCompare(dayA);
    const voidA = a.status === 'voided' ? 1 : 0;
    const voidB = b.status === 'voided' ? 1 : 0;
    if (voidA !== voidB) return voidA - voidB;
    return Date.parse(b.administeredAt) - Date.parse(a.administeredAt);
  });

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
          const hasRemaining = Boolean(timing && timing.remainingMs > 0);
          const intervalComplete = Boolean(timing && timing.remainingMs === 0);

          return (
            <div key={record.id}>
              {showHeading && (
                <h3 className="text-heading-14 history-day-heading">{day}</h3>
              )}
              <button
                type="button"
                className={`history-row${
                  record.status === 'voided'
                    ? ' history-row--voided'
                    : intervalComplete
                      ? ' history-row--complete'
                      : ''
                }`}
                onClick={() => onSelectRecord(record)}
              >
                {record.status === 'voided' ? (
                  <span className="history-row-primary history-row-primary--single">
                    <CompactFacts record={record} emphasizeDose={false} />
                    <span className="chip chip-voided text-label-12">Voided</span>
                  </span>
                ) : intervalComplete ? (
                  <span className="history-row-primary history-row-primary--single">
                    <CompactFacts record={record} emphasizeDose />
                    <span className="chip chip-complete text-label-12 history-row-complete-chip">
                      Complete
                    </span>
                  </span>
                ) : (
                  <>
                    <span className="history-row-primary">
                      <strong className="text-heading-14 history-row-title">
                        {record.units} U
                      </strong>
                      {hasRemaining && timing && (
                        <span className="text-label-14 history-row-trailing">
                          ~{timing.remainingUnits.toFixed(2)} U
                        </span>
                      )}
                    </span>

                    <span className="text-copy-13 history-row-subtitle">
                      {formatTimeShort(record.administeredAt)}
                      {record.glucoseMgDl != null && Number.isFinite(record.glucoseMgDl)
                        ? ` · ${record.glucoseMgDl} mg/dL`
                        : ''}
                      {record.carbsGrams != null && Number.isFinite(record.carbsGrams)
                        ? ` · ${record.carbsGrams} g`
                        : ''}
                    </span>

                    {hasRemaining && timing && (
                      <span className="injection-timing">
                        <progress
                          max="1"
                          value={timing.fraction}
                          aria-label="Modeled time remaining"
                        />
                        <span className="injection-timing-copy">
                          <span className="text-label-14 injection-remaining">
                            {remainingLabel(timing.remainingMs)} remaining
                          </span>
                          <span className="text-label-12 injection-until">
                            Until {formatTimeShort(timing.endsAt)}
                          </span>
                        </span>
                      </span>
                    )}
                    {record.status === 'active' && !timing && (
                      <span className="text-copy-13 injection-timing-error">
                        Check injection time: device clock may have changed
                      </span>
                    )}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
