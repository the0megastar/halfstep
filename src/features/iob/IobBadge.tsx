import { remainingLabel } from '../../../lib/iob';
import { formatTimeShort } from '../injections/dateUtils';
import { IobGauge } from './IobGauge';
import type { ContributingInjectionItem } from './useIobSummary';

export interface IobBadgeProps {
  isOpen: boolean;
  onToggle: () => void;
  total: number;
  latest?: ContributingInjectionItem['item'];
  uncertain: boolean;
}

export function IobBadge({
  isOpen,
  onToggle,
  total,
  latest,
  uncertain,
}: IobBadgeProps) {
  const remaining = latest
    ? latest.remainingMs <= 0
      ? 'Done'
      : remainingLabel(latest.remainingMs)
    : 'No timer';
  const endTime = latest ? formatTimeShort(latest.endsAt) : null;
  const unitsText = uncertain ? '—' : total.toFixed(2);

  const ariaLabel = `Estimated insulin on board from this device: ${
    uncertain ? 'unavailable' : `${total.toFixed(2)} units`
  }. ${
    latest
      ? `${remaining} remaining, ends ${endTime}`
      : 'No timer'
  }. Open insulin on board details.`;

  return (
    <button
      type="button"
      className={`iob-badge-btn${isOpen ? ' is-open' : ''}`}
      onClick={onToggle}
      aria-label={ariaLabel}
      title="Insulin on Board · Details"
      aria-expanded={isOpen}
      aria-haspopup="dialog"
    >
      <span className="iob-nav-units" aria-hidden="true">
        <span className="iob-nav-units-value">{unitsText}</span>
        {!uncertain && <span className="iob-nav-units-suffix">U</span>}
      </span>
      <IobGauge fraction={latest?.fraction ?? 0} />
      <span className="iob-nav-time-stack" aria-hidden="true">
        <small className="text-label-12 iob-nav-remaining">{remaining}</small>
        <small
          className={`text-label-12 iob-nav-end${endTime ? '' : ' iob-nav-end--empty'}`}
        >
          {endTime ?? '—'}
        </small>
      </span>
    </button>
  );
}
