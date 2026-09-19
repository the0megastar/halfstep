import { useReducer, useCallback } from 'react';
import {
  generateUUID,
  validateInjection,
  type Injection,
  type InjectionValues,
} from '../../../lib/injections.ts';
import { PATIENT } from '../../../lib/patient.ts';
import {
  localDateInput,
  localClockInput,
  combineLocalDateAndClock,
} from './dateUtils.ts';

export type WorkflowView =
  | 'history'
  | 'form'
  | 'max-dose-warn'
  | 'confirm'
  | 'detail'
  | 'void';

export interface WorkflowState {
  view: WorkflowView;
  selectedId: string | null;
  units: string;
  date: string;
  clock: string;
  glucose: string;
  carbs: string;
  submissionId: string;
  formError: string | null;
  maxDoseAcknowledged: boolean;
}

export type WorkflowAction =
  | { type: 'OPEN_HISTORY' }
  | { type: 'START_CREATE'; suggestedDose?: number; glucose?: string; carbs?: string }
  | { type: 'START_EDIT'; record: Injection }
  | {
      type: 'UPDATE_FIELD';
      field: 'units' | 'date' | 'clock' | 'glucose' | 'carbs';
      value: string;
    }
  | { type: 'STEP_DOSE'; delta: number; fallbackDose?: number }
  | { type: 'SET_TIME_NOW' }
  | { type: 'VALIDATE_AND_REVIEW'; maxDoseWarningUnits?: number }
  | { type: 'ACK_MAX_DOSE' }
  | { type: 'BACK_TO_FORM' }
  | { type: 'VIEW_DETAIL'; recordId: string }
  | { type: 'PROMPT_VOID' }
  | { type: 'CANCEL_VOID' }
  | { type: 'BACK_TO_HISTORY' }
  | { type: 'COMPLETE_SAVE' };

export const initialWorkflowState: WorkflowState = {
  view: 'history',
  selectedId: null,
  units: '',
  date: '',
  clock: '',
  glucose: '',
  carbs: '',
  submissionId: '',
  formError: null,
  maxDoseAcknowledged: false,
};

function clampDose(units: number): number {
  const max = PATIENT.maxDoseUnits;
  const stepped = Math.round(units * 2) / 2;
  return Math.min(max, Math.max(0.5, stepped));
}

function valuesFromState(state: WorkflowState): InjectionValues {
  const unitsNum = state.units.trim() === '' ? NaN : Number(state.units);
  const combined = combineLocalDateAndClock(state.date, state.clock);
  const parsedTime = Number.isFinite(new Date(combined).getTime())
    ? new Date(combined).toISOString()
    : '';
  const glucoseRaw = state.glucose.trim();
  const carbsRaw = state.carbs.trim();
  const glucoseMgDl = glucoseRaw === '' ? null : Number(glucoseRaw);
  const carbsGrams = carbsRaw === '' ? null : Number(carbsRaw);
  return {
    units: unitsNum,
    administeredAt: parsedTime,
    caregiver: '',
    glucoseMgDl: glucoseMgDl !== null && Number.isFinite(glucoseMgDl) ? glucoseMgDl : null,
    carbsGrams: carbsGrams !== null && Number.isFinite(carbsGrams) ? carbsGrams : null,
  };
}

export function workflowReducer(state: WorkflowState, action: WorkflowAction): WorkflowState {
  switch (action.type) {
    case 'OPEN_HISTORY':
      return { ...state, view: 'history', selectedId: null, formError: null };

    case 'START_CREATE': {
      const dose =
        action.suggestedDose !== undefined && action.suggestedDose > 0
          ? String(clampDose(action.suggestedDose))
          : '';
      const nowIso = new Date().toISOString();
      return {
        ...state,
        view: 'form',
        selectedId: null,
        units: dose,
        date: localDateInput(nowIso),
        clock: localClockInput(nowIso),
        glucose: action.glucose ?? '',
        carbs: action.carbs ?? '',
        submissionId: generateUUID(),
        formError: null,
        maxDoseAcknowledged: false,
      };
    }

    case 'START_EDIT':
      return {
        ...state,
        view: 'form',
        selectedId: action.record.id,
        units: String(action.record.units),
        date: localDateInput(action.record.administeredAt),
        clock: localClockInput(action.record.administeredAt),
        glucose:
          action.record.glucoseMgDl != null ? String(action.record.glucoseMgDl) : '',
        carbs: action.record.carbsGrams != null ? String(action.record.carbsGrams) : '',
        submissionId: generateUUID(),
        formError: null,
        maxDoseAcknowledged: false,
      };

    case 'UPDATE_FIELD': {
      let value = action.value;
      if (action.field === 'units') {
        const n = Number(value);
        if (Number.isFinite(n) && n > PATIENT.maxDoseUnits) {
          value = String(PATIENT.maxDoseUnits);
        }
      }
      return {
        ...state,
        [action.field]: value,
        formError: null,
        maxDoseAcknowledged:
          action.field === 'units' ? false : state.maxDoseAcknowledged,
      };
    }

    case 'STEP_DOSE': {
      const current = Number(state.units);
      if (!Number.isFinite(current) || current <= 0) {
        const fallback = clampDose(action.fallbackDose || 0.5);
        return {
          ...state,
          units: String(fallback),
          formError: null,
          maxDoseAcknowledged: false,
        };
      }
      const next = clampDose(current + action.delta);
      return {
        ...state,
        units: Number(next.toFixed(1)).toString(),
        formError: null,
        maxDoseAcknowledged: false,
      };
    }

    case 'SET_TIME_NOW': {
      const nowIso = new Date().toISOString();
      return {
        ...state,
        date: localDateInput(nowIso),
        clock: localClockInput(nowIso),
        formError: null,
      };
    }

    case 'VALIDATE_AND_REVIEW': {
      const values = valuesFromState(state);
      const error = validateInjection(values);
      if (error) {
        return { ...state, formError: error };
      }
      const threshold = action.maxDoseWarningUnits;
      const needsWarn =
        Number.isFinite(threshold) &&
        Number.isFinite(values.units) &&
        values.units >= (threshold as number) &&
        !state.maxDoseAcknowledged;
      if (needsWarn) {
        return { ...state, view: 'max-dose-warn', formError: null };
      }
      return { ...state, view: 'confirm', formError: null };
    }

    case 'ACK_MAX_DOSE':
      return { ...state, view: 'confirm', formError: null, maxDoseAcknowledged: true };

    case 'BACK_TO_FORM':
      return { ...state, view: 'form', formError: null };

    case 'VIEW_DETAIL':
      return {
        ...state,
        view: 'detail',
        selectedId: action.recordId,
        formError: null,
      };

    case 'PROMPT_VOID':
      return { ...state, view: 'void', formError: null };

    case 'CANCEL_VOID':
      return { ...state, view: 'detail', formError: null };

    case 'BACK_TO_HISTORY':
      return {
        ...state,
        view: 'history',
        selectedId: null,
        formError: null,
      };

    case 'COMPLETE_SAVE':
      return {
        ...state,
        view: 'history',
        selectedId: null,
        formError: null,
      };

    default:
      return state;
  }
}

export function useInjectionWorkflow() {
  const [state, dispatch] = useReducer(workflowReducer, initialWorkflowState);

  const openHistory = useCallback(() => dispatch({ type: 'OPEN_HISTORY' }), []);
  const startCreate = useCallback(
    (suggestedDose?: number, extras?: { glucose?: string; carbs?: string }) => {
      dispatch({
        type: 'START_CREATE',
        suggestedDose,
        glucose: extras?.glucose,
        carbs: extras?.carbs,
      });
    },
    [],
  );
  const startEdit = useCallback((record: Injection) => {
    dispatch({ type: 'START_EDIT', record });
  }, []);
  const updateField = useCallback(
    (field: 'units' | 'date' | 'clock' | 'glucose' | 'carbs', value: string) => {
      dispatch({ type: 'UPDATE_FIELD', field, value });
    },
    [],
  );
  const stepDose = useCallback((delta: number, fallbackDose?: number) => {
    dispatch({ type: 'STEP_DOSE', delta, fallbackDose });
  }, []);
  const setTimeToNow = useCallback(() => dispatch({ type: 'SET_TIME_NOW' }), []);
  const validateAndReview = useCallback((maxDoseWarningUnits?: number) => {
    dispatch({ type: 'VALIDATE_AND_REVIEW', maxDoseWarningUnits });
  }, []);
  const ackMaxDose = useCallback(() => dispatch({ type: 'ACK_MAX_DOSE' }), []);
  const backToForm = useCallback(() => dispatch({ type: 'BACK_TO_FORM' }), []);
  const viewDetail = useCallback(
    (recordId: string) => dispatch({ type: 'VIEW_DETAIL', recordId }),
    [],
  );
  const promptVoid = useCallback(() => dispatch({ type: 'PROMPT_VOID' }), []);
  const cancelVoid = useCallback(() => dispatch({ type: 'CANCEL_VOID' }), []);
  const backToHistory = useCallback(() => dispatch({ type: 'BACK_TO_HISTORY' }), []);
  const completeSave = useCallback(() => dispatch({ type: 'COMPLETE_SAVE' }), []);

  const getFormValues = useCallback(
    (): InjectionValues => valuesFromState(state),
    [state],
  );

  return {
    state,
    dispatch,
    openHistory,
    startCreate,
    startEdit,
    updateField,
    stepDose,
    setTimeToNow,
    validateAndReview,
    ackMaxDose,
    backToForm,
    viewDetail,
    promptVoid,
    cancelVoid,
    backToHistory,
    completeSave,
    getFormValues,
  };
}
