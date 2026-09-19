import { useEffect } from 'react';
import { X } from 'lucide-react';
import { createInjection, reviseInjection, type Injection } from '../../../lib/injections';
import { PATIENT } from '../../../lib/patient';
import { loadAppSettings } from '../../../lib/appSettings';
import { InjectionList } from './InjectionList';
import { InjectionForm } from './InjectionForm';
import { InjectionConfirmation } from './InjectionConfirmation';
import { InjectionDetails } from './InjectionDetails';
import { InjectionVoidConfirmation } from './InjectionVoidConfirmation';
import { InjectionMaxDoseWarning } from './InjectionMaxDoseWarning';
import type { WorkflowState } from './useInjectionWorkflow';

export interface InjectionHistoryPanelProps {
  variant?: 'page' | 'dialog';
  onClose?: () => void;
  workflow: {
    state: WorkflowState;
    openHistory: () => void;
    startCreate: (suggestedDose?: number, extras?: { glucose?: string; carbs?: string }) => void;
    startEdit: (record: Injection) => void;
    updateField: (field: 'units' | 'date' | 'clock' | 'glucose' | 'carbs', value: string) => void;
    stepDose: (delta: number, fallbackDose?: number) => void;
    setTimeToNow: () => void;
    validateAndReview: (maxDoseWarningUnits?: number) => void;
    ackMaxDose: () => void;
    backToForm: () => void;
    viewDetail: (recordId: string) => void;
    promptVoid: () => void;
    cancelVoid: () => void;
    backToHistory: () => void;
    completeSave: () => void;
    getFormValues: () => import('../../../lib/injections').InjectionValues;
  };
  recordsState: {
    records: Injection[];
    loaded: boolean;
    loading: boolean;
    refreshError: string | null;
    saveError: string | null;
    notice: string | null;
    saving: boolean;
    saveRecord: (record: Injection, expectedRevision?: number) => Promise<void>;
    clearErrors: () => void;
    clearNotice: () => void;
  };
  now: number;
  iobSummary?: {
    total: number;
    uncertain: boolean;
  };
  onCancelForm?: () => void;
}

export function getHistorySectionTitle(
  view: WorkflowState['view'],
  selectedRecord: Injection | null,
): string {
  switch (view) {
    case 'history':
      return 'Injection History';
    case 'detail':
      return 'Injection Details';
    case 'void':
      return 'Void This Entry?';
    case 'max-dose-warn':
      return 'Large Dose Warning';
    case 'confirm':
      return 'Confirm Insulin Given';
    case 'form':
      return selectedRecord ? 'Edit Entry' : 'Record Insulin Given';
    default:
      return 'Injection History';
  }
}

export function InjectionHistoryPanel({
  variant = 'page',
  onClose,
  workflow,
  recordsState,
  now,
  onCancelForm,
}: InjectionHistoryPanelProps) {
  const { state } = workflow;
  const { records, loading, saveError, refreshError, notice, saving, saveRecord, clearErrors } =
    recordsState;

  const selectedRecord = state.selectedId
    ? records.find((r) => r.id === state.selectedId) || null
    : null;

  const handleSave = async (voided = false) => {
    try {
      const values = workflow.getFormValues();
      const record = selectedRecord
        ? reviseInjection(selectedRecord, voided ? selectedRecord : values, voided)
        : createInjection(state.submissionId, values);

      await saveRecord(record, selectedRecord?.revision);
      workflow.completeSave();
    } catch {
      // Error is set in saveError by useInjectionRecords
    }
  };

  const maxDoseThreshold = Math.min(
    loadAppSettings().maxDoseWarningUnits,
    PATIENT.maxDoseUnits,
  );
  const title = getHistorySectionTitle(state.view, selectedRecord);
  const activeError = state.formError || saveError || refreshError;
  const isRootList = state.view === 'history';
  const sheetOpen = state.view === 'detail' || state.view === 'void';

  useEffect(() => {
    document.body.classList.toggle('history-sheet-open', sheetOpen);
    return () => document.body.classList.remove('history-sheet-open');
  }, [sheetOpen]);

  return (
    <div
      className={`injection-history-panel injection-history-panel--${variant}`}
      aria-labelledby="injection-title"
    >
      {variant === 'dialog' && (
        <header className="injection-heading">
          <h2 id="injection-title" className="text-heading-16">
            {title}
          </h2>
          <button
            type="button"
            className="nav-btn"
            aria-label="Close Injection History"
            disabled={saving}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </header>
      )}

      {variant === 'page' && !isRootList && state.view !== 'detail' && state.view !== 'void' && (
        <header className="injection-heading injection-heading--page">
          <h2 id="injection-title" className="text-heading-16">
            {title}
          </h2>
        </header>
      )}

      {variant === 'page' && isRootList && (
        <span id="injection-title" className="sr-only">
          Injection History
        </span>
      )}
      {variant !== 'page' && (isRootList || state.view === 'detail' || state.view === 'void') && (
        <p className="local-notice text-copy-13">
          Local only. Entries stay on this device and are not synced.
        </p>
      )}

      {activeError && (
        <p role="alert" className="history-error">
          {activeError}
        </p>
      )}

      {notice && <p role="status">{notice}</p>}

      {(state.view === 'history' || state.view === 'detail' || state.view === 'void') && (
        <InjectionList
          records={records}
          now={now}
          loading={loading}
          onSelectRecord={(rec) => {
            clearErrors();
            workflow.viewDetail(rec.id);
          }}
          onStartCreate={() => {
            clearErrors();
            workflow.startCreate();
          }}
        />
      )}

      {state.view === 'form' && (
        <InjectionForm
          units={state.units}
          date={state.date}
          clock={state.clock}
          glucose={state.glucose}
          carbs={state.carbs}
          onUnitsChange={(val) => workflow.updateField('units', val)}
          onDateChange={(val) => workflow.updateField('date', val)}
          onClockChange={(val) => workflow.updateField('clock', val)}
          onGlucoseChange={(val) => workflow.updateField('glucose', val)}
          onCarbsChange={(val) => workflow.updateField('carbs', val)}
          onStepDose={(delta) => workflow.stepDose(delta)}
          onSetTimeToNow={workflow.setTimeToNow}
          onSubmit={(e) => {
            e.preventDefault();
            workflow.validateAndReview(maxDoseThreshold);
          }}
          onCancel={() => {
            clearErrors();
            if (onCancelForm) onCancelForm();
            else workflow.backToHistory();
          }}
        />
      )}

      {state.view === 'max-dose-warn' && (
        <InjectionMaxDoseWarning
          units={Number(state.units)}
          threshold={maxDoseThreshold}
          onAcknowledge={workflow.ackMaxDose}
          onBack={workflow.backToForm}
        />
      )}

      {state.view === 'confirm' && (
        <InjectionConfirmation
          values={workflow.getFormValues()}
          isEditing={selectedRecord != null}
          saving={saving}
          onConfirm={() => void handleSave(false)}
          onBack={workflow.backToForm}
        />
      )}

      {(state.view === 'detail' || state.view === 'void') && selectedRecord && (
        <div
          className="history-sheet-backdrop"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              clearErrors();
              workflow.backToHistory();
            }
          }}
        >
          <div
            className="history-sheet card-surface"
            role="dialog"
            aria-modal="true"
            aria-labelledby={
              state.view === 'void' ? 'injection-void-title' : 'injection-detail-title'
            }
          >
            {state.view === 'detail' ? (
              <InjectionDetails
                record={selectedRecord}
                onEdit={() => {
                  clearErrors();
                  workflow.startEdit(selectedRecord);
                }}
                onPromptVoid={workflow.promptVoid}
                onClose={() => {
                  clearErrors();
                  workflow.backToHistory();
                }}
              />
            ) : (
              <InjectionVoidConfirmation
                record={selectedRecord}
                saving={saving}
                onConfirmVoid={() => void handleSave(true)}
                onCancel={workflow.cancelVoid}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
