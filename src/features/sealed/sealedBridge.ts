/**
 * Seal local history ↔ public.sealed_stores.
 * Passphrase never leaves the device; only ciphertext is uploaded.
 */

import type { Injection } from '../../../lib/injections';
import { loadInjections, replaceAllInjections } from '../../../lib/storage';
import { sealHistorySnapshot, unsealHistorySnapshot } from './sealedCrypto';
import { SEALED_PAYLOAD_SCHEMA_VERSION } from './sealedStore';
import { deriveSealedStoreId } from './sealedStoreId';
import { fetchSealedStore, isSealedSyncConfigured, upsertSealedStore } from './sealedSync';
import { readSealedPassphrase, rememberSealedPassphrase } from './sealedSession';
import { isPassphraseSaved, rememberPassphraseForDevice, savePassphraseMarker } from './sealedPassphrase';

const BROADCAST_CHANNEL_NAME = 'halfstep-injections';

export type LinkSealedResult = {
  action: 'created' | 'joined';
  count: number;
};

function notifyHistoryTabs(): void {
  try {
    const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    channel.postMessage({ type: 'injections-updated' });
    channel.close();
  } catch {
    // History will refresh on next focus/visit.
  }
}

function isInjectionRecord(value: unknown): value is Injection {
  if (!value || typeof value !== 'object') return false;
  const row = value as Partial<Injection>;
  return (
    typeof row.id === 'string' &&
    typeof row.units === 'number' &&
    typeof row.revision === 'number' &&
    row.schemaVersion === 1
  );
}

function mergeByRevision(local: Injection[], incoming: unknown[]): Injection[] {
  const map = new Map<string, Injection>();
  for (const row of local) {
    map.set(row.id, row);
  }
  for (const item of incoming) {
    if (!isInjectionRecord(item)) continue;
    const existing = map.get(item.id);
    if (!existing || item.revision >= existing.revision) {
      map.set(item.id, item);
    }
  }
  return [...map.values()];
}

async function pushSnapshot(passphrase: string, injections: Injection[]): Promise<void> {
  const id = await deriveSealedStoreId(passphrase);
  const payload = await sealHistorySnapshot(passphrase, injections);
  await upsertSealedStore({
    id,
    payload,
    schema_version: SEALED_PAYLOAD_SCHEMA_VERSION,
  });
}

/** First save: join an existing remote blob, or create one from local history. */
export async function linkSealedStore(passphrase: string): Promise<LinkSealedResult> {
  const trimmed = passphrase.trim();
  if (!trimmed) {
    throw new Error('Passphrase is empty.');
  }
  if (!globalThis.crypto?.subtle) {
    throw new Error('This browser cannot seal history.');
  }

  const id = await deriveSealedStoreId(trimmed);
  const remote = await fetchSealedStore(id);
  const local = await loadInjections();

  if (remote) {
    const snapshot = await unsealHistorySnapshot(trimmed, remote.payload);
    const merged = mergeByRevision(local, snapshot.injections);
    await replaceAllInjections(merged);
    await pushSnapshot(trimmed, merged);
    rememberSealedPassphrase(trimmed);
    savePassphraseMarker(trimmed);
    await rememberPassphraseForDevice(trimmed);
    notifyHistoryTabs();
    return { action: 'joined', count: merged.length };
  }

  await pushSnapshot(trimmed, local);
  rememberSealedPassphrase(trimmed);
  savePassphraseMarker(trimmed);
  await rememberPassphraseForDevice(trimmed);
  return { action: 'created', count: local.length };
}

/** Pull remote sealed blob (or push local if none), merge into IndexedDB. */
export async function refreshSealedStore(passphrase: string): Promise<{ count: number }> {
  const trimmed = passphrase.trim();
  if (!trimmed) {
    throw new Error('Passphrase is empty.');
  }

  const id = await deriveSealedStoreId(trimmed);
  const remote = await fetchSealedStore(id);
  const local = await loadInjections();

  if (!remote) {
    await pushSnapshot(trimmed, local);
    rememberSealedPassphrase(trimmed);
    await rememberPassphraseForDevice(trimmed);
    return { count: local.length };
  }

  const snapshot = await unsealHistorySnapshot(trimmed, remote.payload);
  const merged = mergeByRevision(local, snapshot.injections);
  await replaceAllInjections(merged);
  await pushSnapshot(trimmed, merged);
  rememberSealedPassphrase(trimmed);
  await rememberPassphraseForDevice(trimmed);
  notifyHistoryTabs();
  return { count: merged.length };
}

/**
 * After a local create/edit/void: push the full sealed snapshot if this tab
 * has an unlocked passphrase and cloud sync is on. Never blocks the local save.
 */
export async function pushSealedStoreAfterLocalChange(): Promise<void> {
  if (!isSealedSyncConfigured()) return;
  if (!isPassphraseSaved()) return;
  const passphrase = readSealedPassphrase();
  if (!passphrase) return; // Needs unlock this tab session before auto-push.

  const local = await loadInjections();
  await pushSnapshot(passphrase, local);
}
