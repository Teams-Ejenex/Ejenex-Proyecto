-- policies.sql
-- Activa RLS y define políticas para groups y profiles

alter table public.groups enable row level security;
alter table public.profiles enable row level security;

-- Leer grupos (catálogo público)
drop policy if exists "Public read groups" on public.groups;
create policy "Public read groups"
on public.groups
for select
to anon
using (true);

-- Insertar grupos: SOLO admin autenticado
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

-- Leer tu propio perfil (para saber tu rol)
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);
