const STORAGE_KEY = 'halfstep.sealed.passphraseMarker';
const ENCRYPTED_UNLOCK_KEY = 'halfstep.sealed.rememberedUnlock';

/** Remembers that a passphrase was saved on this device (not the passphrase itself). */
export function isPassphraseSaved(): boolean {
  try {
    return Boolean(localStorage.getItem(STORAGE_KEY));
  } catch {
    return false;
  }
}

export function savePassphraseMarker(passphrase: string): void {
  const trimmed = passphrase.trim();
  if (!trimmed) {
    throw new Error('Passphrase is empty.');
  }
  // Store a non-secret marker that indicates this device is linked.
  const marker = `v1:${trimmed.length}:${simpleFingerprint(trimmed)}`;
  localStorage.setItem(STORAGE_KEY, marker);
}

export function clearPassphraseMarker(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ENCRYPTED_UNLOCK_KEY);
}

/** Store the shared phrase encrypted with a device-only key held by Web Crypto. */
export async function rememberPassphraseForDevice(passphrase: string): Promise<void> {
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(passphrase.trim()),
  );
  const db = await openUnlockDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('unlock', 'readwrite');
    tx.objectStore('unlock').put({ id: 'device', key, iv: toBase64(iv), value: toBase64(new Uint8Array(encrypted)) });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(new Error('Could not remember this device unlock.'));
  }).finally(() => db.close());
}

export async function restoreRememberedPassphrase(): Promise<string | null> {
  const db = await openUnlockDatabase();
  const record = await new Promise<{ key: CryptoKey; iv: string; value: string } | undefined>((resolve, reject) => {
    const tx = db.transaction('unlock', 'readonly');
    const request = tx.objectStore('unlock').get('device');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Could not read this device unlock.'));
  }).finally(() => db.close());
  if (!record) return null;
  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(record.iv) },
      record.key,
      fromBase64(record.value),
    );
    return new TextDecoder().decode(plaintext) || null;
  } catch {
    return null;
  }
}

function openUnlockDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('halfstep-sealed-unlock', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('unlock', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Secure device storage is unavailable.'));
  });
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function simpleFingerprint(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16);
}
