import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useInjectionRecords } from '../features/injections/useInjectionRecords';
import { useInjectionWorkflow } from '../features/injections/useInjectionWorkflow';
import { useClock } from '../features/iob/useClock';
import { useIobSummary } from '../features/iob/useIobSummary';
import { InjectionHistoryPanel } from '../features/injections/InjectionHistoryPanel';
import { PageHeader } from '../components/ui/PageHeader';

export interface HistoryPageHandle {
  openHistory: () => void;
  recordDose: (dose?: number) => void;
}

export interface HistoryPageProps {
  suggestedDose?: number;
  pendingLog?: { dose: number; glucose: string; carbs: string } | null;
  onPendingLogConsumed?: () => void;
  onAbandonToCalculator?: () => void;
}

export const HistoryPage = forwardRef<HistoryPageHandle, HistoryPageProps>(
  function HistoryPage(
    { suggestedDose, pendingLog, onPendingLogConsumed, onAbandonToCalculator },
    ref,
  ) {
    const recordsState = useInjectionRecords();
    const workflow = useInjectionWorkflow();
    const now = useClock({ intervalMs: 1000 });
    const iobSummary = useIobSummary(recordsState.records, now, recordsState.loaded);
    const entrySourceRef = useRef<'calculator' | 'history'>('history');

    const openHistory = () => {
      recordsState.clearErrors();
      recordsState.clearNotice();
      workflow.openHistory();
      void recordsState.refresh();
    };

    const recordDose = (
      dose?: number,
      opts?: { glucose?: string; carbs?: string; source?: 'calculator' | 'history' },
    ) => {
      recordsState.clearErrors();
      recordsState.clearNotice();
      void recordsState.refresh();
      entrySourceRef.current = opts?.source ?? 'history';
      workflow.startCreate(dose ?? suggestedDose, {
        glucose: opts?.glucose,
        carbs: opts?.carbs,
      });
    };

    useImperativeHandle(ref, () => ({ openHistory, recordDose }));

    useEffect(() => {
      openHistory();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (pendingLog === undefined || pendingLog === null) return;
      recordDose(pendingLog.dose, {
        glucose: pendingLog.glucose,
        carbs: pendingLog.carbs,
        source: 'calculator',
      });
      onPendingLogConsumed?.();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingLog]);

    const handleCancelForm = () => {
      recordsState.clearErrors();
      if (entrySourceRef.current === 'calculator' && onAbandonToCalculator) {
        entrySourceRef.current = 'history';
        onAbandonToCalculator();
        return;
      }
      workflow.backToHistory();
    };

    return (
      <section className="history-page" aria-label="Injection history">
        {(workflow.state.view === 'history' ||
          workflow.state.view === 'detail' ||
          workflow.state.view === 'void') && (
          <PageHeader
            title="History"
            intro="Local only. Entries stay on this device."
          />
        )}

        <InjectionHistoryPanel
          variant="page"
          workflow={workflow}
          recordsState={recordsState}
          now={now}
          iobSummary={iobSummary}
          onCancelForm={handleCancelForm}
        />
      </section>
    );
  },
);

export default HistoryPage;
