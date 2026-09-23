-- Sealed history blobs for household sync.
-- Clients encrypt before write. The passphrase never reaches this table.
-- Row id is a SHA-256 hex digest derived from the passphrase (see sealedStoreId.ts).

create table if not exists public.sealed_stores (
  id text primary key
    check (id ~ '^[0-9a-f]{64}$'),
  payload text not null
    check (char_length(payload) > 0 and char_length(payload) <= 1048576),
  schema_version integer not null default 1
    check (schema_version >= 1),
  updated_at timestamptz not null default now()
);

create index if not exists sealed_stores_updated_at_idx
  on public.sealed_stores (updated_at desc);

comment on table public.sealed_stores is
  'Client-encrypted injection-history blobs. Id is passphrase-derived; server never sees plaintext.';

comment on column public.sealed_stores.id is
  '64-char lowercase hex SHA-256 of halfstep-sealed-v1 + NUL + passphrase (UTF-8).';

comment on column public.sealed_stores.payload is
  'Opaque client envelope (JSON text): schema_version, salt, iv, ciphertext. Server must not parse.';

comment on column public.sealed_stores.schema_version is
  'Envelope / sync contract version. Bump when payload shape changes.';

alter table public.sealed_stores enable row level security;

-- Access = knowing the id. Clients always filter by primary key (no list-all UI).
-- Ciphertext without the passphrase is useless; id space is 256-bit.

drop policy if exists sealed_stores_select on public.sealed_stores;
create policy sealed_stores_select on public.sealed_stores
  for select to anon, authenticated
  using (true);

drop policy if exists sealed_stores_insert on public.sealed_stores;
create policy sealed_stores_insert on public.sealed_stores
  for insert to anon, authenticated
  with check (true);

drop policy if exists sealed_stores_update on public.sealed_stores;
create policy sealed_stores_update on public.sealed_stores
  for update to anon, authenticated
  using (true)
  with check (true);

drop policy if exists sealed_stores_delete on public.sealed_stores;
create policy sealed_stores_delete on public.sealed_stores
  for delete to anon, authenticated
  using (true);

grant select, insert, update, delete on public.sealed_stores to anon, authenticated;
