/**
 * Passphrase-sealed blobs via Web Crypto (PBKDF2-SHA-256 + AES-GCM).
 * Matches SealedPayloadV1 in sealedStore.ts — not a messaging ratchet.
 */

import {
  parseSealedPayloadV1,
  serializeSealedPayloadV1,
  type SealedPayloadV1,
} from './sealedStore.ts';

/** OWASP ballpark for PBKDF2-HMAC-SHA-256 (browser-native). */
const PBKDF2_ITERATIONS = 600_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;
const KEY_BITS = 256;

/** Plaintext snapshot version inside the ciphertext (separate from envelope v). */
export type SealedHistorySnapshotV1 = {
  schemaVersion: 1;
  injections: unknown[];
};

export async function sealJson(
  passphrase: string,
  value: unknown,
): Promise<string> {
  const plaintext = new TextEncoder().encode(JSON.stringify(value));
  const envelope = await sealBytes(passphrase, plaintext);
  return serializeSealedPayloadV1(envelope);
}

export async function unsealJson(passphrase: string, payload: string): Promise<unknown> {
  const envelope = parseSealedPayloadV1(payload);
  const bytes = await unsealBytes(passphrase, envelope);
  return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
}

export async function sealHistorySnapshot(
  passphrase: string,
  injections: unknown[],
): Promise<string> {
  const snapshot: SealedHistorySnapshotV1 = {
    schemaVersion: 1,
    injections,
  };
  return sealJson(passphrase, snapshot);
}

export async function unsealHistorySnapshot(
  passphrase: string,
  payload: string,
): Promise<SealedHistorySnapshotV1> {
  const parsed = await unsealJson(passphrase, payload);
  if (
    !parsed ||
    typeof parsed !== 'object' ||
    (parsed as SealedHistorySnapshotV1).schemaVersion !== 1 ||
    !Array.isArray((parsed as SealedHistorySnapshotV1).injections)
  ) {
    throw new Error('Sealed history snapshot is not valid v1.');
  }
  return parsed as SealedHistorySnapshotV1;
}

export async function sealBytes(
  passphrase: string,
  plaintext: Uint8Array,
): Promise<SealedPayloadV1> {
  const trimmed = passphrase.trim();
  if (!trimmed) {
    throw new Error('Passphrase is empty.');
  }
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveAesKey(trimmed, salt);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: bufferSource(iv) },
    key,
    bufferSource(plaintext),
  );
  return {
    v: 1,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ct: bytesToBase64(new Uint8Array(ciphertext)),
  };
}

export async function unsealBytes(
  passphrase: string,
  envelope: SealedPayloadV1,
): Promise<Uint8Array> {
  const trimmed = passphrase.trim();
  if (!trimmed) {
    throw new Error('Passphrase is empty.');
  }
  if (envelope.v !== 1) {
    throw new Error('Unsupported sealed envelope version.');
  }
  const salt = base64ToBytes(envelope.salt);
  const iv = base64ToBytes(envelope.iv);
  const ct = base64ToBytes(envelope.ct);
  if (salt.byteLength !== SALT_BYTES || iv.byteLength !== IV_BYTES) {
    throw new Error('Sealed envelope has unexpected salt or IV length.');
  }
  const key = await deriveAesKey(trimmed, salt);
  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: bufferSource(iv) },
      key,
      bufferSource(ct),
    );
    return new Uint8Array(plaintext);
  } catch {
    throw new Error('Could not unlock sealed data. Check the passphrase.');
  }
}

async function deriveAesKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: bufferSource(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: KEY_BITS },
    false,
    ['encrypt', 'decrypt'],
  );
}

/** Copy into a standalone ArrayBuffer so TS BufferSource accepts it. */
function bufferSource(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
