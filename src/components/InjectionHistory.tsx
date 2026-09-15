import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { History } from 'lucide-react';
import { useInjectionRecords } from '../features/injections/useInjectionRecords';
import { useInjectionWorkflow } from '../features/injections/useInjectionWorkflow';
import { useClock } from '../features/iob/useClock';
import { useIobSummary } from '../features/iob/useIobSummary';
import { IobPopover } from '../features/iob/IobPopover';
import { InjectionHistoryDialog } from '../features/injections/InjectionHistoryDialog';

export interface InjectionHistoryHandle {
  openHistory: () => void;
  recordDose: (dose?: number) => void;
}

export interface InjectionHistoryProps {
  suggestedDose?: number;
  isIobOpen?: boolean;
  onToggleIob?: () => void;
  onCloseIob?: () => void;
  hideHistoryButton?: boolean;
  forceOpen?: boolean;
  onDialogClose?: () => void;
}

const InjectionHistory = forwardRef<InjectionHistoryHandle, InjectionHistoryProps>(
  function InjectionHistory(
    {
      suggestedDose,
      isIobOpen: controlledIobOpen,
      onToggleIob,
      onCloseIob,
      hideHistoryButton = false,
      forceOpen = false,
      onDialogClose,
    },
    ref
  ) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [internalIobOpen, setInternalIobOpen] = useState(false);

    const isIobOpen = controlledIobOpen !== undefined ? controlledIobOpen : internalIobOpen;
    const handleToggleIob = onToggleIob || (() => setInternalIobOpen((prev) => !prev));
    const handleCloseIob = onCloseIob || (() => setInternalIobOpen(false));

    const recordsState = useInjectionRecords();
    const workflow = useInjectionWorkflow();
    const now = useClock({ intervalMs: 1000 });
    const iobSummary = useIobSummary(recordsState.records, now, recordsState.loaded);

    const openHistory = () => {
      recordsState.clearErrors();
      recordsState.clearNotice();
      workflow.openHistory();
      setIsDialogOpen(true);
      void recordsState.refresh();
    };

    const recordDose = (dose?: number) => {
      recordsState.clearErrors();
      recordsState.clearNotice();
      setIsDialogOpen(true);
      void recordsState.refresh();
      workflow.startCreate(dose ?? suggestedDose);
    };

    useImperativeHandle(ref, () => ({
      openHistory,
      recordDose,
    }));

    useEffect(() => {
      if (forceOpen && !isDialogOpen) {
        openHistory();
      }
      // intentionally only react to forceOpen toggles
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceOpen]);

    const closeDialog = () => {
      setIsDialogOpen(false);
      onDialogClose?.();
    };

    return (
      <>
        <IobPopover
          isOpen={isIobOpen}
          onToggle={handleToggleIob}
          onClose={handleCloseIob}
          onOpenHistory={() => {
            handleCloseIob();
            openHistory();
          }}
          total={iobSummary.total}
          latest={iobSummary.latest}
          activeContributing={iobSummary.activeContributing}
          uncertain={iobSummary.uncertain}
        />

        {!hideHistoryButton && (
          <button
            type="button"
            className="nav-btn"
            onClick={openHistory}
            aria-label="Injection History"
            title="Injection History"
          >
            <History size={19} />
          </button>
        )}

        <InjectionHistoryDialog
          isOpen={isDialogOpen}
          onClose={closeDialog}
          workflow={workflow}
          recordsState={recordsState}
          now={now}
          iobSummary={iobSummary}
        />
      </>
    );
  }
);

export default InjectionHistory;
