import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateGlucoseAfterDose, formatEstimatedGlucose } from '../lib/estimate.ts';
import { needsMaxDoseWarning, normalizeMaxDoseWarningUnits, parseAppSettings, PROVISIONAL_MAX_DOSE_WARNING_UNITS } from '../lib/appSettings.ts';

test('correction-only example: 235 mg/dL, 0g, 1U ISF135 -> 100', () => {
  const r = estimateGlucoseAfterDose({ glucose: 235, carbs: 0, doseUnits: 1 });
  assert.equal(r.complete, true);
  assert.equal(r.estimatedGlucose, 100);
  assert.equal(r.carbRise, 0);
  assert.equal(r.insulinDrop, 135);
});

test('food + matching insulin trends toward target-ish math', () => {
  // 90g / 45 = 2U food; glucose at target 150 with 2U and 90g:
  // rise = 2*135=270, drop=270, estimate = 150
  const r = estimateGlucoseAfterDose({ glucose: 150, carbs: 90, doseUnits: 2 });
  assert.equal(r.estimatedGlucose, 150);
});

test('incomplete inputs yield null estimate', () => {
  assert.equal(estimateGlucoseAfterDose({ glucose: null, carbs: 10, doseUnits: 1 }).complete, false);
  assert.equal(estimateGlucoseAfterDose({ glucose: 200, carbs: null, doseUnits: 1 }).complete, false);
  assert.equal(estimateGlucoseAfterDose({ glucose: 200, carbs: 10, doseUnits: null }).complete, false);
});

test('formatEstimatedGlucose rounds for display', () => {
  assert.equal(formatEstimatedGlucose(100.4), '100');
  assert.equal(formatEstimatedGlucose(null), '—');
});

test('max dose warning boundaries at provisional 5.0', () => {
  assert.equal(needsMaxDoseWarning(4.5, 5), false);
  assert.equal(needsMaxDoseWarning(5, 5), true);
  assert.equal(needsMaxDoseWarning(5.5, 5), true);
  assert.equal(normalizeMaxDoseWarningUnits(5.25), 5.5);
  assert.equal(parseAppSettings({}).maxDoseWarningUnits, PROVISIONAL_MAX_DOSE_WARNING_UNITS);
});
