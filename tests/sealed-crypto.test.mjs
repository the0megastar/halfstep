import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sealHistorySnapshot,
  unsealHistorySnapshot,
  sealJson,
  unsealJson,
} from '../src/features/sealed/sealedCrypto.ts';
import { parseSealedPayloadV1 } from '../src/features/sealed/sealedStore.ts';
import { deriveSealedStoreId } from '../src/features/sealed/sealedStoreId.ts';

test('round-trip seals and unlocks injection history', async () => {
  const passphrase = 'household-test-phrase';
  const injections = [
    { id: 'a', units: 1.5, status: 'active' },
    { id: 'b', units: 2, status: 'voided' },
  ];
  const payload = await sealHistorySnapshot(passphrase, injections);
  const envelope = parseSealedPayloadV1(payload);
  assert.equal(envelope.v, 1);
  assert.ok(envelope.salt.length > 0);
  assert.ok(envelope.iv.length > 0);
  assert.ok(envelope.ct.length > 0);

  const unlocked = await unsealHistorySnapshot(passphrase, payload);
  assert.equal(unlocked.schemaVersion, 1);
  assert.deepEqual(unlocked.injections, injections);
});

test('wrong passphrase fails closed', async () => {
  const payload = await sealJson('correct-phrase', { hello: 'world' });
  await assert.rejects(
    () => unsealJson('wrong-phrase', payload),
    /Could not unlock sealed data/,
  );
});

test('store id is stable for the same passphrase and differs from payload', async () => {
  const a = await deriveSealedStoreId('same-phrase');
  const b = await deriveSealedStoreId('same-phrase');
  const c = await deriveSealedStoreId('other-phrase');
  assert.equal(a, b);
  assert.notEqual(a, c);
  assert.match(a, /^[0-9a-f]{64}$/);

  const payload = await sealJson('same-phrase', { n: 1 });
  assert.notEqual(payload, a);
});
