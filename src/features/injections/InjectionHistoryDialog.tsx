import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { createInjection, reviseInjection, type Injection } from '../../../lib/injections';
import { InjectionList } from './InjectionList';
import { InjectionForm } from './InjectionForm';
import { InjectionConfirmation } from './InjectionConfirmation';
import { InjectionDetails } from './InjectionDetails';
import { InjectionVoidConfirmation } from './InjectionVoidConfirmation';
import { InjectionMaxDoseWarning } from './InjectionMaxDoseWarning';
import { loadAppSettings } from '../../../lib/appSettings';
import type { WorkflowState } from './useInjectionWorkflow';

export interface InjectionHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: {
    state: WorkflowState;
    openHistory: () => void;
    startCreate: (suggestedDose?: number) => void;
    startEdit: (record: Injection) => void;
    updateField: (field: 'units' | 'time' | 'caregiver', value: string) => void;
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
  iobSummary: {
    total: number;
    uncertain: boolean;
  };
}

export function InjectionHistoryDialog({
  isOpen,
  onClose,
  workflow,
  recordsState,
  now,
  iobSummary,
}: InjectionHistoryDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { state } = workflow;
  const { records, loading, saveError, refreshError, notice, saving, saveRecord, clearErrors } =
    recordsState;

  // Sync native dialog modal state
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

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

  const maxDoseThreshold = loadAppSettings().maxDoseWarningUnits;

  const getTitle = () => {
    switch (state.view) {
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
  };

  const activeError = state.formError || saveError || refreshError;

  return (
    <dialog
      ref={dialogRef}
      className="injection-dialog"
      aria-labelledby="injection-title"
      onCancel={(e) => {
        if (saving) {
          e.preventDefault();
        } else {
          onClose();
        }
      }}
    >
      <header className="injection-heading">
        <h2 id="injection-title">{getTitle()}</h2>
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

      <p className="local-notice">
        Only on this device · Not shared or backed up. Caregiver names are labels, not verified
        identities.
      </p>

      <p className="iob-summary">
        <strong>
          Estimated IOB: {iobSummary.uncertain ? 'unavailable' : `${iobSummary.total.toFixed(2)} units`}
        </strong>
        <br />
        Linear 3-hour model · Recorded NovoLog only. Missing injections are not included. A
        completed interval does not mean insulin has no remaining biological effect.
      </p>

      {activeError && (
        <p role="alert" className="history-error">
          {activeError}
        </p>
      )}

      {notice && <p role="status">{notice}</p>}

      {state.view === 'history' && (
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
          time={state.time}
          caregiver={state.caregiver}
          onUnitsChange={(val) => workflow.updateField('units', val)}
          onTimeChange={(val) => workflow.updateField('time', val)}
          onCaregiverChange={(val) => workflow.updateField('caregiver', val)}
          onStepDose={(delta) => workflow.stepDose(delta)}
          onSetTimeToNow={workflow.setTimeToNow}
          onSubmit={(e) => {
            e.preventDefault();
            workflow.validateAndReview(maxDoseThreshold);
          }}
          onCancel={() => {
            clearErrors();
            workflow.backToHistory();
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
          isEditing={Boolean(selectedRecord)}
          saving={saving}
          onConfirm={() => void handleSave(false)}
          onBack={workflow.backToForm}
        />
      )}

      {state.view === 'detail' && selectedRecord && (
        <InjectionDetails
          record={selectedRecord}
          onEdit={() => {
            clearErrors();
            workflow.startEdit(selectedRecord);
          }}
          onPromptVoid={() => {
            clearErrors();
            workflow.promptVoid();
          }}
          onBackToHistory={() => {
            clearErrors();
            workflow.backToHistory();
          }}
        />
      )}

      {state.view === 'void' && selectedRecord && (
        <InjectionVoidConfirmation
          record={selectedRecord}
          saving={saving}
          onConfirmVoid={() => void handleSave(true)}
          onCancel={workflow.cancelVoid}
        />
      )}
    </dialog>
  );
}
