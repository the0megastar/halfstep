const STORAGE_KEY = 'halfstep.sealed.passphraseMarker';

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
  // Opaque marker for UI feel-testing. Real path: deriveSealedStoreId → encrypt → sealed_stores upsert.
  const marker = `v1:${trimmed.length}:${simpleFingerprint(trimmed)}`;
  localStorage.setItem(STORAGE_KEY, marker);
}

export function clearPassphraseMarker(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function simpleFingerprint(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16);
}
