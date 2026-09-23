/**
 * Contract for public.sealed_stores — keep in sync with
 * supabase/migrations/20260923160000_sealed_stores.sql
 */

/** One row in sealed_stores. */
export type SealedStoreRow = {
  /** 64-char lowercase hex SHA-256 store id (see deriveSealedStoreId). */
  id: string;
  /** Opaque client envelope as JSON text (salt, iv, ciphertext). */
  payload: string;
  /** Envelope / sync contract version. */
  schema_version: number;
  /** Server timestamp (ISO). Set by Postgres on write. */
  updated_at: string;
};

/** Fields the client sends on upsert (updated_at comes from the server). */
export type SealedStoreUpsert = {
  id: string;
  payload: string;
  schema_version: number;
};

/** Current payload envelope version written by this app build. */
export const SEALED_PAYLOAD_SCHEMA_VERSION = 1;

/**
 * Payload JSON shape for schema_version 1.
 * Encrypt/decrypt: sealedCrypto.ts. This is the wire shape only.
 */
export type SealedPayloadV1 = {
  v: 1;
  /** Base64 random salt for KDF. */
  salt: string;
  /** Base64 AES-GCM IV. */
  iv: string;
  /** Base64 ciphertext of the injection-history snapshot. */
  ct: string;
};

export function parseSealedPayloadV1(payload: string): SealedPayloadV1 {
  const parsed = JSON.parse(payload) as Partial<SealedPayloadV1>;
  if (
    parsed.v !== 1 ||
    typeof parsed.salt !== 'string' ||
    typeof parsed.iv !== 'string' ||
    typeof parsed.ct !== 'string' ||
    !parsed.salt ||
    !parsed.iv ||
    !parsed.ct
  ) {
    throw new Error('Sealed payload is not a valid v1 envelope.');
  }
  return { v: 1, salt: parsed.salt, iv: parsed.iv, ct: parsed.ct };
}

export function serializeSealedPayloadV1(envelope: SealedPayloadV1): string {
  return JSON.stringify({
    v: 1,
    salt: envelope.salt,
    iv: envelope.iv,
    ct: envelope.ct,
  });
}
