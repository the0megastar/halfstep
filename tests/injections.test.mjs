import test from 'node:test';
import assert from 'node:assert/strict';
import { createInjection, reviseInjection, validateInjection } from '../lib/injections.ts';
const now = Date.parse('2026-09-12T16:00:00Z');
const values = { units: 1.5, administeredAt: '2026-09-12T15:00:00Z', caregiver: ' Parent ' };
test('records actual administration separately from creation time', () => {
  const record = createInjection('one', values, now);
  assert.equal(record.caregiver, 'Parent');
  assert.equal(record.administeredAt, values.administeredAt);
  assert.equal(record.createdAt, new Date(now).toISOString());
  assert.equal(record.events.length, 1);
});
test('rejects invalid doses, timestamps and missing caregiver', () => {
  for (const units of [0, -1, NaN, Infinity]) assert.ok(validateInjection({ ...values, units }, now));
  for (const administeredAt of ['', 'bad', '2026-09-12T16:01:00Z']) assert.ok(validateInjection({ ...values, administeredAt }, now));
  assert.ok(validateInjection({ ...values, caregiver: ' ' }, now));
  assert.equal(validateInjection(values, now), null);
});
test('corrections retain original details without mutating the original record', () => {
  const original = createInjection('one', values, now);
  const corrected = reviseInjection(original, { ...values, units: 2 }, false, now + 1000);
  assert.equal(original.units, 1.5);
  assert.equal(original.events.length, 1);
  assert.equal(corrected.units, 2);
  assert.equal(corrected.events[0].values.units, 1.5);
  assert.equal(corrected.events[1].action, 'corrected');
  assert.equal(corrected.revision, 2);
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
