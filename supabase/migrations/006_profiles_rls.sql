-- 006_profiles_rls.sql

alter table public.profiles enable row level security;

-- 1) Cualquiera autenticado puede ver perfiles (vista pública dentro de app)
drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
on public.profiles
for select
to authenticated
using (true);

-- 2) El usuario solo puede actualizar SU perfil
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- 3) El usuario puede insertar su perfil (si tu app lo hace en registro)
-- (Opcional, según tu flujo actual)
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);
