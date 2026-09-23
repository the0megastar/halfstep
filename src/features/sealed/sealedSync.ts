import type { SealedStoreRow, SealedStoreUpsert } from './sealedStore';

/**
 * Thin PostgREST client for public.sealed_stores.
 * Encrypt before upsert; decrypt after fetch. No @supabase/supabase-js required yet.
 */

function sealedSyncEnabled(): boolean {
  const raw = (import.meta.env.VITE_SEALED_SYNC_ENABLED as string | undefined)?.trim().toLowerCase() ?? '';
  return raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on';
}

function supabaseConfig(): { url: string; anonKey: string } {
  if (!sealedSyncEnabled()) {
    throw new Error('Cloud sync is off for this build. Set VITE_SEALED_SYNC_ENABLED=true to opt in.');
  }
  const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? '';
  const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? '';
  if (!url || !anonKey) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  return { url: url.replace(/\/$/, ''), anonKey };
}

function restHeaders(anonKey: string, prefer?: string): HeadersInit {
  const headers: Record<string, string> = {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    Accept: 'application/json',
  };
  if (prefer) headers.Prefer = prefer;
  return headers;
}

/** Fetch one sealed row by id. Returns null when the store does not exist yet. */
export async function fetchSealedStore(id: string): Promise<SealedStoreRow | null> {
  const { url, anonKey } = supabaseConfig();
  const endpoint = `${url}/rest/v1/sealed_stores?id=eq.${encodeURIComponent(id)}&select=id,payload,schema_version,updated_at`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: restHeaders(anonKey),
  });
  if (!response.ok) {
    throw new Error(`Could not read sealed store (${response.status}).`);
  }
  const rows = (await response.json()) as SealedStoreRow[];
  return rows[0] ?? null;
}

/** Insert or replace the sealed blob for this id. Server sets updated_at. */
export async function upsertSealedStore(row: SealedStoreUpsert): Promise<SealedStoreRow> {
  const { url, anonKey } = supabaseConfig();
  const endpoint = `${url}/rest/v1/sealed_stores`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      ...restHeaders(anonKey, 'resolution=merge-duplicates,return=representation'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: row.id,
      payload: row.payload,
      schema_version: row.schema_version,
      updated_at: new Date().toISOString(),
    }),
  });
  if (!response.ok) {
    throw new Error(`Could not save sealed store (${response.status}).`);
  }
  const rows = (await response.json()) as SealedStoreRow[];
  const saved = rows[0];
  if (!saved) {
    throw new Error('Sealed store save returned no row.');
  }
  return saved;
}

/** Remove the remote sealed blob (optional; local clear can leave the row). */
export async function deleteSealedStore(id: string): Promise<void> {
  const { url, anonKey } = supabaseConfig();
  const endpoint = `${url}/rest/v1/sealed_stores?id=eq.${encodeURIComponent(id)}`;
  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers: restHeaders(anonKey),
  });
  if (!response.ok) {
    throw new Error(`Could not remove sealed store (${response.status}).`);
  }
}

export function isSealedSyncConfigured(): boolean {
  if (!sealedSyncEnabled()) return false;
  try {
    supabaseConfig();
    return true;
  } catch {
    return false;
  }
}
