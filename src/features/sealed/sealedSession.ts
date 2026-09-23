/** In-tab only: passphrase kept in memory after a successful unlock/save. */

let sessionPassphrase: string | null = null;

export function rememberSealedPassphrase(passphrase: string): void {
  const trimmed = passphrase.trim();
  sessionPassphrase = trimmed || null;
}

export function readSealedPassphrase(): string | null {
  return sessionPassphrase;
}

export function clearSealedPassphrase(): void {
  sessionPassphrase = null;
}
