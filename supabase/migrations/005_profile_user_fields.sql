-- 005_profile_user_fields.sql
-- Agrega campos para perfil editable en profiles

alter table public.profiles
add column if not exists full_name text,
add column if not exists career varchar(120),
add column if not exists interests jsonb,
add column if not exists favorite_groups jsonb,
add column if not exists profile_picture_url text;

-- Defaults (opcional)
alter table public.profiles
alter column interests set default '[]'::jsonb;

alter table public.profiles
alter column favorite_groups set default '[]'::jsonb;

-- Actualiza updated_at automáticamente (si ya tienes trigger, omite esto)
-- Si NO tienes, pega esto:
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_profiles_updated_at'
  ) then
    create trigger trg_profiles_updated_at
    before update on public.profiles
    for each row execute function public.set_updated_at();
  end if;
end $$;
