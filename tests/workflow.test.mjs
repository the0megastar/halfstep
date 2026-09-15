import test from 'node:test';
import assert from 'node:assert/strict';
import {
  workflowReducer,
  initialWorkflowState,
} from '../src/features/injections/useInjectionWorkflow.ts';
import {
  localTimeInput,
  formatDateHeading,
  formatTimeShort,
} from '../src/features/injections/dateUtils.ts';

test('initial workflow state begins in history view with no selection', () => {
  assert.equal(initialWorkflowState.view, 'history');
  assert.equal(initialWorkflowState.selectedId, null);
  assert.equal(initialWorkflowState.formError, null);
});

test('START_CREATE initializes form with suggested dose and submissionId', () => {
  const state = workflowReducer(initialWorkflowState, {
    type: 'START_CREATE',
    suggestedDose: 2.5,
  });
  assert.equal(state.view, 'form');
  assert.equal(state.units, '2.5');
  assert.equal(state.selectedId, null);
  assert.ok(state.submissionId.length > 0);
  assert.ok(state.time.length > 0);
});

test('STEP_DOSE increments and decrements by 0.5 units with 0.5 floor', () => {
  let state = workflowReducer(initialWorkflowState, {
    type: 'START_CREATE',
    suggestedDose: 1.0,
  });
  state = workflowReducer(state, { type: 'STEP_DOSE', delta: 0.5 });
  assert.equal(state.units, '1.5');

  state = workflowReducer(state, { type: 'STEP_DOSE', delta: -0.5 });
  assert.equal(state.units, '1');

  // Decrement past 0.5 clamps to 0.5
  state = workflowReducer(state, { type: 'STEP_DOSE', delta: -0.5 });
  assert.equal(state.units, '0.5');
  state = workflowReducer(state, { type: 'STEP_DOSE', delta: -0.5 });
  assert.equal(state.units, '0.5');
});

test('VALIDATE_AND_REVIEW advances to confirm on valid values or sets formError', () => {
  let state = workflowReducer(initialWorkflowState, {
    type: 'START_CREATE',
    suggestedDose: 1.5,
  });
  // Missing caregiver should fail
  state = workflowReducer(state, { type: 'VALIDATE_AND_REVIEW' });
  assert.equal(state.view, 'form');
  assert.match(state.formError, /caregiver/i);

  // Providing caregiver should succeed
  state = workflowReducer(state, {
    type: 'UPDATE_FIELD',
    field: 'caregiver',
    value: 'Dad',
  });
  state = workflowReducer(state, { type: 'VALIDATE_AND_REVIEW' });
  assert.equal(state.view, 'confirm');
  assert.equal(state.formError, null);
});

test('Detail and Void confirmation workflow transitions', () => {
  let state = workflowReducer(initialWorkflowState, {
    type: 'VIEW_DETAIL',
    recordId: 'rec-123',
  });
  assert.equal(state.view, 'detail');
  assert.equal(state.selectedId, 'rec-123');

  state = workflowReducer(state, { type: 'PROMPT_VOID' });
  assert.equal(state.view, 'void');
  assert.equal(state.selectedId, 'rec-123');

  state = workflowReducer(state, { type: 'CANCEL_VOID' });
  assert.equal(state.view, 'detail');

  state = workflowReducer(state, { type: 'BACK_TO_HISTORY' });
  assert.equal(state.view, 'history');
  assert.equal(state.selectedId, null);
});

test('dateUtils formats ISO strings into display headings and time', () => {
  const iso = '2026-09-12T14:30:00.000Z';
  const heading = formatDateHeading(iso);
  assert.ok(heading.includes('2026'));
  const shortTime = formatTimeShort(iso);
  assert.ok(shortTime.length > 0);
  const inputVal = localTimeInput(iso);
  assert.match(inputVal, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
});


test('VALIDATE_AND_REVIEW routes large doses through max-dose warning', () => {
  let state = workflowReducer(initialWorkflowState, {
    type: 'START_CREATE',
    suggestedDose: 5,
  });
  state = workflowReducer(state, {
    type: 'UPDATE_FIELD',
    field: 'caregiver',
    value: 'Mom',
  });
  state = workflowReducer(state, { type: 'VALIDATE_AND_REVIEW', maxDoseWarningUnits: 5 });
  assert.equal(state.view, 'max-dose-warn');
  assert.equal(state.maxDoseAcknowledged, false);

  state = workflowReducer(state, { type: 'ACK_MAX_DOSE' });
  assert.equal(state.view, 'confirm');
  assert.equal(state.maxDoseAcknowledged, true);

  // Below threshold skips warning
  state = workflowReducer(initialWorkflowState, {
    type: 'START_CREATE',
    suggestedDose: 4.5,
  });
  state = workflowReducer(state, {
    type: 'UPDATE_FIELD',
    field: 'caregiver',
    value: 'Mom',
  });
  state = workflowReducer(state, { type: 'VALIDATE_AND_REVIEW', maxDoseWarningUnits: 5 });
  assert.equal(state.view, 'confirm');
});
