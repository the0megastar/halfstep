import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTION_DURATION_MS, injectionProgress, remainingLabel } from '../lib/iob.ts';
const start = '2026-09-12T12:00:00Z';
const now = Date.parse(start);
test('linear IOB follows recorded time and reaches zero at three hours', () => {
  assert.equal(injectionProgress(start, 1.5, now).remainingUnits, 1.5);
  assert.equal(injectionProgress(start, 1.5, now).endsAt, now + ACTION_DURATION_MS);
  assert.equal(injectionProgress(start, 1.5, now + 3600000).remainingUnits, 1);
  assert.equal(injectionProgress(start, 1.5, now + ACTION_DURATION_MS / 2).remainingUnits, .75);
  assert.equal(injectionProgress(start, 1.5, now + ACTION_DURATION_MS).remainingUnits, 0);
  assert.equal(injectionProgress(start, 1.5, now + ACTION_DURATION_MS * 2).remainingMs, 0);
});
test('invalid and future entries cannot inflate IOB', () => {
  assert.equal(injectionProgress(start, 1, now - 1), null);
  assert.equal(injectionProgress('bad', 1, now), null);
  assert.equal(injectionProgress(start, NaN, now), null);
});
test('countdown rounds up until interval has actually completed', () => {
  assert.equal(remainingLabel(1), '1m');
  assert.equal(remainingLabel(0), 'Interval complete');
  assert.equal(remainingLabel(10800000), '3h');
});
