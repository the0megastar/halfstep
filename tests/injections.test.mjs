import test from 'node:test';
import assert from 'node:assert/strict';
import { createInjection, deriveCarbRatio, reviseInjection, validateInjection } from '../lib/injections.ts';
const now = Date.parse('2026-09-12T16:00:00Z');
const values = { units: 1.5, administeredAt: '2026-09-12T15:00:00Z' };
test('records actual administration separately from creation time', () => {
  const record = createInjection('one', values, now);
  assert.equal('caregiver' in record, false);
  assert.equal(record.administeredAt, values.administeredAt);
  assert.equal(record.createdAt, new Date(now).toISOString());
  assert.equal(record.events.length, 1);
  assert.equal(record.events[0].action, 'created');
  assert.equal(record.events[0].values.carbRatio, null);
});
test('rejects invalid doses and timestamps', () => {
  for (const units of [0, -1, NaN, Infinity]) assert.ok(validateInjection({ ...values, units }, now));
  for (const administeredAt of ['', 'bad', '2026-09-12T16:01:00Z']) assert.ok(validateInjection({ ...values, administeredAt }, now));
  assert.equal(validateInjection(values, now), null);
});
test('corrections retain original details without mutating the original record', () => {
  const original = { ...createInjection('one', values, now), caregiver: ' Parent ' };
  const corrected = reviseInjection(original, { ...values, units: 2 }, false, now + 1000);
  assert.equal(original.units, 1.5);
  assert.equal(original.events.length, 1);
  assert.equal(corrected.units, 2);
  assert.equal(corrected.events[0].values.units, 1.5);
  assert.equal(corrected.events[1].action, 'corrected');
  assert.equal(corrected.revision, 2);
  assert.equal('caregiver' in corrected, false);
});

test('legacy caregiver data remains readable but is not retained on revise', () => {
  const legacy = { ...createInjection('legacy', values, now), caregiver: 'Parent' };
  assert.equal(legacy.units, 1.5);
  const revised = reviseInjection(legacy, { ...values, units: 2 }, false, now + 1000);
  assert.equal('caregiver' in revised, false);
  assert.equal('caregiver' in revised.events.at(-1).values, false);
});
test('voiding retains the entry and prevents subsequent modification', () => {
  const original = createInjection('one', values, now);
  const voided = reviseInjection(original, original, true, now);
  assert.equal(voided.status, 'voided');
  assert.equal(voided.events.at(-1).action, 'voided');
  assert.equal(voided.units, 1.5);
  assert.throws(() => reviseInjection(voided, values, false, now));
});

test('accepts half-unit doses and rejects other increments', () => {
  for (const units of [0.5, 1, 1.5, 2, 2.5]) assert.equal(validateInjection({ ...values, units }, now), null);
  for (const units of [0.1, 0.25, 0.75, 1.2, 1.51]) assert.match(validateInjection({ ...values, units }, now), /half-unit/);
});

test('rejects doses above the locked maximum', () => {
  assert.match(validateInjection({ ...values, units: 5.5 }, now), /maximum/i);
  assert.equal(validateInjection({ ...values, units: 5 }, now), null);
});

test('uses explicit calculator ratio and derives manual ratio after correction', () => {
  assert.equal(deriveCarbRatio({ units: 2, carbsGrams: 70, glucoseMgDl: 150 }), 35);
  assert.equal(deriveCarbRatio({ units: 3, carbsGrams: 70, glucoseMgDl: 285 }), 35);
  assert.equal(deriveCarbRatio({ units: 1, carbsGrams: 0, glucoseMgDl: 285 }), null);
  assert.equal(deriveCarbRatio({ units: 1, carbsGrams: 45 }), null);
  assert.equal(deriveCarbRatio({ units: 1.5, carbsGrams: 76.41, glucoseMgDl: 150 }), 51);
  const record = createInjection('school', {
    units: 1,
    administeredAt: values.administeredAt,
    glucoseMgDl: 150,
    carbsGrams: 55,
    carbRatio: 55,
  }, now);
  assert.equal(record.carbRatio, 55);
  assert.equal(record.events[0].values.carbRatio, 55);
});

test('ratio edits preserve the old value in audit and update the current ratio', () => {
  const original = createInjection('ratio', {
    units: 2,
    administeredAt: values.administeredAt,
    glucoseMgDl: 150,
    carbsGrams: 70,
    carbRatio: 35,
  }, now);
  const edited = reviseInjection(original, {
    units: 2,
    administeredAt: values.administeredAt,
    glucoseMgDl: 150,
    carbsGrams: 90,
  }, false, now + 1000);
  assert.equal(edited.carbRatio, 45);
  assert.equal(edited.events[0].values.carbRatio, 35);
  assert.equal(edited.events[1].values.carbRatio, 45);
});
