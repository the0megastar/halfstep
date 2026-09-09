import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate, parseDecimal, displayUnits, calculateHalfStepRounding } from '../lib/dose.ts';

test('70 g at 285 mg/dL gives 2 food + 1 correction = 3 units', () => {
  const r = calculate('285', '70');
  assert.equal(r.food, 2);
  assert.equal(r.correction, 1);
  assert.equal(r.total, 3);
  assert.equal(r.rounding?.rounded, 3);
});

test('at target (150 mg/dL) there is no correction', () => {
  const r = calculate('150', '35');
  assert.equal(r.food, 1);
  assert.equal(r.correction, 0);
  assert.equal(r.total, 1);
  assert.equal(r.rounding?.rounded, 1);
});

test('zero carbs is valid and preserves correction', () => {
  const r = calculate('285', '0');
  assert.equal(r.food, 0);
  assert.equal(r.correction, 1);
  assert.equal(r.total, 1);
});

test('below target (between 70 and 149) suppresses correction and retains food math', () => {
  const r = calculate('100', '35');
  assert.equal(r.correction, null);
  assert.equal(r.food, 1);
  assert.equal(r.total, 1);
  assert.equal(r.belowTarget, true);
  assert.equal(r.isLowGlucose, false);
});

test('low glucose (< 70) triggers warning and suppresses dose recommendation', () => {
  const r = calculate('62', '35');
  assert.equal(r.isLowGlucose, true);
  assert.equal(r.total, null);
  assert.match(r.glucoseWarning || '', /under 70/);
});

test('high glucose (> 400) triggers warning to check ketones', () => {
  const r = calculate('425', '35');
  assert.equal(r.isHighGlucose, true);
  assert.match(r.glucoseWarning || '', /over 400/i);
});

test('high carbs (> 100g) triggers double-check warning', () => {
  const r = calculate('180', '120');
  assert.equal(r.isHighCarbs, true);
  assert.match(r.carbsWarning || '', /over 100g/i);
});

test('half-unit rounding rule: .1 to .3 round down', () => {
  // 1.1 -> 1.0
  assert.equal(calculateHalfStepRounding(1.1).rounded, 1.0);
  // 1.25 -> 1.0
  assert.equal(calculateHalfStepRounding(1.25).rounded, 1.0);
  // 1.33 -> 1.0
  assert.equal(calculateHalfStepRounding(1.33).rounded, 1.0);
  assert.equal(calculateHalfStepRounding(1.33).ruleCategory, 'round-down');
});

test('half-unit rounding rule: .4 to .7 round to .5', () => {
  // 1.4 -> 1.5
  assert.equal(calculateHalfStepRounding(1.4).rounded, 1.5);
  // 1.48 -> 1.5
  assert.equal(calculateHalfStepRounding(1.48).rounded, 1.5);
  // 1.65 -> 1.5
  assert.equal(calculateHalfStepRounding(1.65).rounded, 1.5);
  // 1.72 -> 1.5
  assert.equal(calculateHalfStepRounding(1.72).rounded, 1.5);
  assert.equal(calculateHalfStepRounding(1.5).ruleCategory, 'round-half');
});

test('half-unit rounding rule: .8 to .9 round up to next whole unit', () => {
  // 1.8 -> 2.0
  assert.equal(calculateHalfStepRounding(1.8).rounded, 2.0);
  // 1.88 -> 2.0
  assert.equal(calculateHalfStepRounding(1.88).rounded, 2.0);
  // 1.95 -> 2.0
  assert.equal(calculateHalfStepRounding(1.95).rounded, 2.0);
  assert.equal(calculateHalfStepRounding(1.85).ruleCategory, 'round-up');
});

test('exact unit requires no rounding', () => {
  const round = calculateHalfStepRounding(2.0);
  assert.equal(round.rounded, 2.0);
  assert.equal(round.ruleCategory, 'exact');
});

test('empty fields never become zero', () => {
  assert.equal(calculate('', '').total, null);
  assert.equal(calculate('285', '').total, null);
  assert.equal(calculate('', '0').total, null);
});

test('reject malformed, negative, infinite and unsafe input', () => {
  for (const x of ['-1', '1e3', '1,5', 'NaN', 'Infinity', '<script>', '1.2.3', '9007199254740992']) {
    assert.equal(parseDecimal(x), null);
  }
  assert.equal(calculate('0', '35').total, null);
});

test('displayUnits helper formats with approximation marker', () => {
  assert.equal(displayUnits(3), '3');
  assert.equal(displayUnits(0), '0');
  assert.equal(displayUnits(null), '—');
  assert.equal(displayUnits(1 / 3), '≈ 0.333');
});
