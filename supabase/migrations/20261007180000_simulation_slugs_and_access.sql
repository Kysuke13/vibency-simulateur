-- Adresse publique /nom-de-la-simulation.
-- L'accès direct anon est retiré : le site passe par les fonctions Netlify.

alter table public.simulations
  add column if not exists slug text;

update public.simulations
set slug = 'sim-' || regexp_replace(id, '[^a-zA-Z0-9]+', '-', 'g')
where slug is null or slug = '';

alter table public.simulations
  alter column slug set not null;

create unique index if not exists simulations_slug_key on public.simulations (slug);

drop policy if exists "simulations_select" on public.simulations;
drop policy if exists "simulations_insert" on public.simulations;
drop policy if exists "simulations_update" on public.simulations;
drop policy if exists "simulations_delete" on public.simulations;

revoke all on table public.simulations from anon;
revoke all on table public.simulations from authenticated;
