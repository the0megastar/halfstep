const STORE_ID_PREFIX = 'halfstep-sealed-v1';

/**
 * Derive the sealed_stores primary key from the household passphrase.
 * Same passphrase → same id on every device. Never send the passphrase itself.
 */
export async function deriveSealedStoreId(passphrase: string): Promise<string> {
  const trimmed = passphrase.trim();
  if (!trimmed) {
    throw new Error('Passphrase is empty.');
  }
  const material = new TextEncoder().encode(`${STORE_ID_PREFIX}\0${trimmed}`);
  const digest = await crypto.subtle.digest('SHA-256', material);
  return bytesToHex(new Uint8Array(digest));
}

function bytesToHex(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 1) {
    out += bytes[i]!.toString(16).padStart(2, '0');
  }
  return out;
}
