/**
 * Caregiver QA matrix for Calculate (Roman’s locked build).
 *
 * Glucose rows: 1 (hypo), 70 (below target), 150 (at target),
 * 250 (above target / real correction), 401 (high-BG warning).
 * Carb columns: 0, 50, 1000.
 *
 * Precedent: when glucose is low, no suggested dose wins over everything
 * else (carb warn may still show; over-max does not flag without a dose).
 *
 * CR 1:35 · ISF 135 · target 150 · max 5 U · low < 70 · high BG > 400 · carb gate 100 g
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate } from '../lib/dose.ts';
import { PATIENT } from '../lib/patient.ts';

test('locked patient params match the QA build', () => {
  assert.equal(PATIENT.carbRatio, 35);
  assert.equal(PATIENT.schoolCarbRatio, 55);
  assert.equal(PATIENT.isf, 135);
  assert.equal(PATIENT.targetGlucose, 150);
  assert.equal(PATIENT.maxDoseUnits, 5);
  assert.equal(PATIENT.lowGlucoseMgDl, 70);
  assert.equal(PATIENT.highGlucoseMgDl, 400);
  assert.equal(PATIENT.highCarbsGrams, 100);
});

const FOOD_50 = 50 / 35;
const FOOD_1000 = 1000 / 35;
const CORR_250 = (250 - 150) / 135;
const CORR_401 = (401 - 150) / 135;

const caregiverMatrix = [
  // —— BG 1 (hypo): no-dose precedent ——
  {
    name: 'BG 1, carbs 0 → hypo gate, no dose',
    glucose: '1',
    carbs: '0',
    expect: {
      food: 0,
      correction: null,
      total: null,
      rounded: null,
      isLowGlucose: true,
      belowTarget: true,
      isHighGlucose: false,
      isHighCarbs: false,
      exceedsMaxDose: false,
    },
  },
  {
    name: 'BG 1, carbs 50 → hypo gate, no dose even with food math',
    glucose: '1',
    carbs: '50',
    expect: {
      food: FOOD_50,
      correction: null,
      total: null,
      rounded: null,
      isLowGlucose: true,
      isHighCarbs: false,
      exceedsMaxDose: false,
    },
  },
  {
    name: 'BG 1, carbs 1000 → hypo no-dose wins; carb warn on; no over-max without a dose',
    glucose: '1',
    carbs: '1000',
    expect: {
      food: FOOD_1000,
      correction: null,
      total: null,
      rounded: null,
      isLowGlucose: true,
      isHighCarbs: true,
      exceedsMaxDose: false,
    },
  },

  // —— BG 70 (below target, not hypo) ——
  {
    name: 'BG 70, carbs 0 → below target, food 0 → 0 U',
    glucose: '70',
    carbs: '0',
    expect: {
      food: 0,
      correction: null,
      total: 0,
      rounded: 0,
      isLowGlucose: false,
      belowTarget: true,
      isHighGlucose: false,
      isHighCarbs: false,
      exceedsMaxDose: false,
    },
  },
  {
    name: 'BG 70, carbs 50 → below target, food only → 1.5 U',
    glucose: '70',
    carbs: '50',
    expect: {
      food: FOOD_50,
      correction: null,
      total: FOOD_50,
      rounded: 1.5,
      belowTarget: true,
      isHighCarbs: false,
      exceedsMaxDose: false,
    },
  },
  {
    name: 'BG 70, carbs 1000 → below target, carb warn, over max (28.5 U)',
    glucose: '70',
    carbs: '1000',
    expect: {
      food: FOOD_1000,
      correction: null,
      total: FOOD_1000,
      rounded: 28.5,
      belowTarget: true,
      isHighCarbs: true,
      exceedsMaxDose: true,
    },
  },

  // —— BG 150 (at target, correction 0) ——
  {
    name: 'BG 150, carbs 0 → at target, corr 0 → 0 U',
    glucose: '150',
    carbs: '0',
    expect: {
      food: 0,
      correction: 0,
      total: 0,
      rounded: 0,
      belowTarget: false,
      isHighGlucose: false,
      isHighCarbs: false,
      exceedsMaxDose: false,
    },
  },
  {
    name: 'BG 150, carbs 50 → at target, food only (corr 0) → 1.5 U',
    glucose: '150',
    carbs: '50',
    expect: {
      food: FOOD_50,
      correction: 0,
      total: FOOD_50,
      rounded: 1.5,
      belowTarget: false,
      isHighCarbs: false,
      exceedsMaxDose: false,
    },
  },
  {
    name: 'BG 150, carbs 1000 → at target, carb warn, over max (28.5 U)',
    glucose: '150',
    carbs: '1000',
    expect: {
      food: FOOD_1000,
      correction: 0,
      total: FOOD_1000,
      rounded: 28.5,
      belowTarget: false,
      isHighCarbs: true,
      exceedsMaxDose: true,
    },
  },

  // —— BG 250 (above target: real correction) ——
  {
    name: 'BG 250, carbs 0 → correction only → 0.5 U',
    glucose: '250',
    carbs: '0',
    expect: {
      food: 0,
      correction: CORR_250,
      total: CORR_250,
      rounded: 0.5,
      belowTarget: false,
      isHighGlucose: false,
      isHighCarbs: false,
      exceedsMaxDose: false,
    },
  },
  {
    name: 'BG 250, carbs 50 → food + correction → 2.0 U',
    glucose: '250',
    carbs: '50',
    expect: {
      food: FOOD_50,
      correction: CORR_250,
      total: FOOD_50 + CORR_250,
      rounded: 2,
      isHighCarbs: false,
      exceedsMaxDose: false,
    },
  },
  {
    name: 'BG 250, carbs 1000 → food + correction, carb warn, over max (29 U)',
    glucose: '250',
    carbs: '1000',
    expect: {
      food: FOOD_1000,
      correction: CORR_250,
      total: FOOD_1000 + CORR_250,
      rounded: 29,
      isHighCarbs: true,
      exceedsMaxDose: true,
    },
  },

  // —— BG 401 (high-BG warning, math still runs) ——
  {
    name: 'BG 401, carbs 0 → high-BG warn, correction only → 2.0 U',
    glucose: '401',
    carbs: '0',
    expect: {
      food: 0,
      correction: CORR_401,
      total: CORR_401,
      rounded: 2,
      isHighGlucose: true,
      isHighCarbs: false,
      exceedsMaxDose: false,
    },
  },
  {
    name: 'BG 401, carbs 50 → high-BG warn, food + correction → 3.0 U',
    glucose: '401',
    carbs: '50',
    expect: {
      food: FOOD_50,
      correction: CORR_401,
      total: FOOD_50 + CORR_401,
      rounded: 3,
      isHighGlucose: true,
      isHighCarbs: false,
      exceedsMaxDose: false,
    },
  },
  {
    name: 'BG 401, carbs 1000 → high-BG + carb warn, over max (30.5 U)',
    glucose: '401',
    carbs: '1000',
    expect: {
      food: FOOD_1000,
      correction: CORR_401,
      total: FOOD_1000 + CORR_401,
      rounded: 30.5,
      isHighGlucose: true,
      isHighCarbs: true,
      exceedsMaxDose: true,
    },
  },
];

for (const scenario of caregiverMatrix) {
  test(scenario.name, () => {
    const r = calculate(scenario.glucose, scenario.carbs);
    const e = scenario.expect;

    assert.equal(r.food, e.food);
    assert.equal(r.correction, e.correction);
    assert.equal(r.total, e.total);
    if (e.rounded === null) assert.equal(r.rounding, null);
    else assert.equal(r.rounding?.rounded, e.rounded);

    if ('isLowGlucose' in e) assert.equal(r.isLowGlucose, e.isLowGlucose);
    if ('belowTarget' in e) assert.equal(r.belowTarget, e.belowTarget);
    if ('isHighGlucose' in e) assert.equal(r.isHighGlucose, e.isHighGlucose);
    assert.equal(r.isHighCarbs, e.isHighCarbs);
    assert.equal(r.exceedsMaxDose, e.exceedsMaxDose);

    if (e.isHighGlucose) {
      assert.match(r.glucoseWarning || '', /over 400/i);
    }
    if (e.isLowGlucose) {
      assert.match(r.glucoseWarning || '', /under 70/i);
      // No-dose precedent: never a suggested rounded dose while hypo
      assert.equal(r.rounding, null);
      assert.equal(r.total, null);
      assert.equal(r.exceedsMaxDose, false);
    }
  });
}

test('empty inputs never become a zero dose', () => {
  assert.equal(calculate('', '').total, null);
  assert.equal(calculate('150', '').total, null);
  assert.equal(calculate('', '50').total, null);
});
