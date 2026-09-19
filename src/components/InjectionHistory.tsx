import { useState } from 'react';
import { useInjectionRecords } from '../features/injections/useInjectionRecords';
import { useClock } from '../features/iob/useClock';
import { useIobSummary } from '../features/iob/useIobSummary';
import { IobPopover } from '../features/iob/IobPopover';

export interface InjectionHistoryProps {
  isIobOpen?: boolean;
  onToggleIob?: () => void;
  onCloseIob?: () => void;
  onOpenHistory?: () => void;
}

/** Top-bar IOB control. History itself lives on the History tab (full page). */
export function InjectionHistory({
  isIobOpen: controlledIobOpen,
  onToggleIob,
  onCloseIob,
  onOpenHistory,
}: InjectionHistoryProps) {
  const [internalIobOpen, setInternalIobOpen] = useState(false);

  const isIobOpen = controlledIobOpen !== undefined ? controlledIobOpen : internalIobOpen;
  const handleToggleIob = onToggleIob || (() => setInternalIobOpen((prev) => !prev));
  const handleCloseIob = onCloseIob || (() => setInternalIobOpen(false));

  const recordsState = useInjectionRecords();
  const now = useClock({ intervalMs: 1000 });
  const iobSummary = useIobSummary(recordsState.records, now, recordsState.loaded);

  return (
    <IobPopover
      isOpen={isIobOpen}
      onToggle={handleToggleIob}
      onClose={handleCloseIob}
      onOpenHistory={() => {
        handleCloseIob();
        onOpenHistory?.();
      }}
      total={iobSummary.total}
      latest={iobSummary.latest}
      activeContributing={iobSummary.activeContributing}
      uncertain={iobSummary.uncertain}
    />
  );
}

export default InjectionHistory;
