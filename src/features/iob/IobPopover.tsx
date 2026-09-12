import React, { useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useDropdownBoundary } from '../../hooks/useDropdownBoundary';
import { remainingLabel } from '../../../lib/iob';
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
          aria-label="Active Insulin Details"
        >
          <div className="dropdown-header">
            <div className="dropdown-header-main">
              <span className="dropdown-title text-heading-16">Active Insulin (IOB)</span>
              <span
                className={`chip text-label-12 ${
                  total > 0 && !uncertain ? 'chip-active' : 'chip-locked'
                }`}
              >
                {uncertain ? 'Uncertain' : total > 0 ? 'Active' : 'Complete'}
              </span>
            </div>
            <span className="dropdown-subtitle text-copy-13">Linear 3-Hour NovoLog Model</span>
          </div>

          <div className="iob-summary-hero">
            <span className="iob-hero-caption iob-hero-left text-label-13">Active Insulin</span>
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
              <span className="iob-list-title text-heading-14">Contributing Injections</span>
              {activeContributing.map(({ record, item }) => (
                <div key={record.id} className="iob-item-row">
                  <div className="iob-item-info">
                    <strong className="text-label-14">
                      {record.units} U · {formatTimeShort(record.administeredAt)}
                    </strong>
                    <span className="iob-item-caregiver text-copy-13">{record.caregiver}</span>
                  </div>
                  <div className="iob-item-timing">
                    <span className="iob-item-remaining text-label-14">
                      ~{item.remainingUnits.toFixed(2)} U
                    </span>
                    <span className="iob-item-time-left text-label-12">
                      {remainingLabel(item.remainingMs)} left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="iob-empty-note text-copy-13">
              No active NovoLog doses recorded in the last 3 hours.
            </p>
          )}

          <p className="iob-disclaimer text-copy-13">
            Local device records only · Linear decay model. Missing injections are not factored in.
            Biological effect may persist past 3 hours.
          </p>

          <div className="iob-dropdown-footer">
            <button
              type="button"
              className="iob-view-history-btn text-button-14"
              onClick={() => {
                onClose();
                onOpenHistory();
              }}
            >
              <span>View Injection History</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
