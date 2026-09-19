import { useRef, useEffect } from 'react';
import { ClipboardList } from 'lucide-react';
import { useDropdownBoundary } from '../../hooks/useDropdownBoundary';
import { remainingLabel } from '../../../lib/iob';
import { PATIENT } from '../../../lib/patient';
import { IobBadge } from './IobBadge';
import { formatTimeShort } from '../injections/dateUtils';
import type { ContributingInjectionItem } from './useIobSummary';

export interface IobPopoverProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onOpenHistory: () => void;
  total: number;
  latest?: ContributingInjectionItem['item'];
  activeContributing: ContributingInjectionItem[];
  uncertain: boolean;
}

export function IobPopover({
  isOpen,
  onToggle,
  onClose,
  onOpenHistory,
  total,
  latest,
  activeContributing,
  uncertain,
}: IobPopoverProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelStyle = useDropdownBoundary({
    isOpen,
    triggerRef: wrapperRef,
    preferredWidth: 336,
    margin: 12,
  });

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <div className="iob-dropdown-wrapper" ref={wrapperRef}>
      <IobBadge
        isOpen={isOpen}
        onToggle={onToggle}
        total={total}
        latest={latest}
        uncertain={uncertain}
      />

      {isOpen && (
        <div
          style={panelStyle}
          className="iob-dropdown-panel"
          role="dialog"
          aria-label="Insulin on Board"
        >
          <div className="dropdown-header">
            <div className="dropdown-header-main">
              <span className="dropdown-title text-heading-16">Insulin on Board (IOB)</span>
              <span
                className={`chip text-label-12 ${
                  total > 0 && !uncertain ? 'chip-active' : 'chip-locked'
                }`}
              >
                {uncertain ? 'Uncertain' : total > 0 ? 'On board' : 'Clear'}
              </span>
            </div>
            <span className="dropdown-subtitle text-copy-13">{`Linear ${PATIENT.durationOfInsulinHours}-Hour ${PATIENT.insulinName} Model`}</span>
          </div>

          <div className="iob-summary-hero">
            <span className="iob-hero-caption iob-hero-left text-label-13">Insulin on Board</span>
            <div className="iob-hero-divider" aria-hidden="true" />
            <span className="iob-hero-caption iob-hero-right text-label-13">Time Remaining</span>

            <div className="iob-hero-stat iob-hero-left">
              <span className="iob-hero-value text-heading-20">
                {uncertain ? '—' : total.toFixed(2)}
              </span>
              <span className="iob-hero-unit text-heading-20">units</span>
            </div>
            <div className="iob-hero-stat iob-hero-right">
              <span className="iob-hero-timer-val text-heading-20">
                {latest ? remainingLabel(latest.remainingMs) : 'None'}
              </span>
            </div>
          </div>

          {activeContributing.length > 0 ? (
            <div className="iob-active-list">
              <span className="iob-list-title text-heading-14">Contributing Doses</span>
              {activeContributing.map(({ record, item }) => (
                <div key={record.id} className="iob-item-row">
                  <span className="iob-item-primary">
                    <strong className="text-heading-14 iob-item-title">
                      {record.units} U · {PATIENT.insulinName}
                    </strong>
                    <span className="text-label-14 iob-item-remaining">
                      ~{item.remainingUnits.toFixed(2)} U
                    </span>
                  </span>
                  <span className="text-copy-13 iob-item-subtitle">
                    {formatTimeShort(record.administeredAt)} · {record.caregiver}
                  </span>
                  <span className="iob-item-timing">
                    <progress
                      max="1"
                      value={item.fraction}
                      aria-label="Modeled time remaining"
                    />
                    <span className="iob-item-timing-copy">
                      <span className="text-label-14 iob-item-time-left">
                        {remainingLabel(item.remainingMs)} remaining
                      </span>
                      <span className="text-label-12 iob-item-until">
                        Until {formatTimeShort(item.endsAt)}
                      </span>
                    </span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="iob-empty-note text-copy-13">{`No ${PATIENT.insulinName} doses recorded in the last ${PATIENT.durationOfInsulinHours} hours.`}</p>
          )}

          <p className="iob-disclaimer text-copy-13">{`Local device records only · Linear decay model. Missing doses are not factored in. Biological effect may persist past ${PATIENT.durationOfInsulinHours} hours. Duration is locked in Settings.`}</p>

          <div className="iob-dropdown-footer">
            <button
              type="button"
              className="iob-history-nav-btn"
              onClick={() => {
                onClose();
                onOpenHistory();
              }}
            >
              <ClipboardList size={20} strokeWidth={1.75} aria-hidden="true" />
              <span className="iob-history-nav-label text-label-12">History</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
