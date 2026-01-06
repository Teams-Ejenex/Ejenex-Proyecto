-- =========================
-- RLS: habilitar seguridad
-- =========================
alter table public.profiles enable row level security;
alter table public.groups enable row level security;

-- =====================================
-- 1) PROFILES: lectura del propio perfil
-- =====================================
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

-- (Opcional) Permitir que el usuario actualice SOLO su perfil (si lo van a usar después)
-- drop policy if exists "Users update own profile" on public.profiles;
-- create policy "Users update own profile"
-- on public.profiles
-- for update
-- to authenticated
-- using (auth.uid() = id)
-- with check (auth.uid() = id);

-- =====================================================
-- 2) GROUPS: lectura pública del catálogo (landing pública)
-- =====================================================
drop policy if exists "Public read groups" on public.groups;
create policy "Public read groups"
on public.groups
for select
to anon, authenticated
using (true);

-- ===================================================
-- 3) GROUPS: INSERT solo administradores autenticados
-- ===================================================
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

-- ===================================================
-- 4) (FUTURO) UPDATE/DELETE solo admin (Sprint futuro)
-- ===================================================
-- drop policy if exists "Admin update groups" on public.groups;
-- create policy "Admin update groups"
-- on public.groups
-- for update
-- to authenticated
-- using (
--   exists (
--     select 1
--     from public.profiles p
--     where p.id = auth.uid()
--       and p.role = 'admin'
--   )
-- )
-- with check (
--   exists (
--     select 1
--     from public.profiles p
--     where p.id = auth.uid()
--       and p.role = 'admin'
--   )
-- );

-- drop policy if exists "Admin delete groups" on public.groups;
-- create policy "Admin delete groups"
-- on public.groups
-- for delete
-- to authenticated
-- using (
--   exists (
--     select 1
--     from public.profiles p
--     where p.id = auth.uid()
--       and p.role = 'admin'
--   )
-- );

-- ===================================================
-- 5) Recomendación: dejar created_by_admin automático
-- ===================================================
-- Esto evita que el frontend "finja" quién creó el grupo
alter table public.groups
alter column created_by_admin set default auth.uid();
