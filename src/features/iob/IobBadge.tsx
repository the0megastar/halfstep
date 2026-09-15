import { remainingLabel } from '../../../lib/iob';
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
  const ariaLabel = `Estimated IOB from this device: ${
    uncertain ? 'unavailable' : total.toFixed(2) + ' units'
  }. Latest active injection: ${
    latest ? remainingLabel(latest.remainingMs) + ' remaining' : 'none'
  }. Open active insulin details.`;

  return (
    <button
      type="button"
      className={`iob-badge-btn ${isOpen ? 'active' : ''}`}
      onClick={onToggle}
      aria-label={ariaLabel}
      title="Estimated IOB · Active insulin details"
      aria-expanded={isOpen}
      aria-haspopup="dialog"
    >
      <IobGauge fraction={latest?.fraction ?? 0} />
      <span className="iob-nav-values">
        <span className="iob-nav-units text-label-13">
          {uncertain ? '—' : `${total.toFixed(2)} U`}
        </span>
        <small className="text-label-12">
          {latest ? remainingLabel(latest.remainingMs) : 'No timer'}
        </small>
      </span>
    </button>
  );
}
