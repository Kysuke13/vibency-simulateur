-- Simulations du Vibency Simulateur.
-- À appliquer avec `supabase db push`, ou en collant ce fichier dans le SQL Editor.
-- Le site n'utilise que la clé anon. La clé service_role ne doit pas être dans le dépôt.

create table public.simulations (
  id text primary key,
  name text not null default '',
  keywords jsonb not null default '[]'::jsonb,
  params jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index simulations_updated_at_idx on public.simulations (updated_at desc);

alter table public.simulations enable row level security;

grant select, insert, update, delete on table public.simulations to anon, authenticated;

create policy "simulations_select"
  on public.simulations
  for select
  to anon, authenticated
  using (true);

create policy "simulations_insert"
  on public.simulations
  for insert
  to anon, authenticated
  with check (true);

create policy "simulations_update"
  on public.simulations
  for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "simulations_delete"
  on public.simulations
  for delete
  to anon, authenticated
  using (true);
