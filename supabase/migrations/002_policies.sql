-- 002_policies.sql
-- RLS + Policies para groups y profiles

-- 1) Activar RLS
alter table public.groups enable row level security;
alter table public.profiles enable row level security;

-- 2) Policies de lectura pública (opcional según tu app)
drop policy if exists "Public can read groups" on public.groups;
create policy "Public can read groups"
on public.groups
for select
to anon
using (true);

-- Si quieres también lectura para authenticated:
drop policy if exists "Authenticated can read groups" on public.groups;
create policy "Authenticated can read groups"
on public.groups
for select
to authenticated
using (true);

-- 3) Insert solo admin (authenticated)
drop policy if exists "Admin insert groups" on public.groups;
create policy "Admin insert groups"
on public.groups
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

-- 4) Update/Delete solo admin (opcional pero recomendado)
drop policy if exists "Admin update groups" on public.groups;
create policy "Admin update groups"
on public.groups
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists "Admin delete groups" on public.groups;
create policy "Admin delete groups"
on public.groups
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

-- 5) profiles: cada usuario puede leer su propio perfil (mínimo)
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

-- (Opcional) permitir insertar perfil propio (si lo necesitan)
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

-- (Opcional) permitir update propio
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());
