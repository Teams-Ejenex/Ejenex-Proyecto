-- seed.sql
-- Datos iniciales de ejemplo (puedes cargar los 15 grupos aquí)

insert into public.groups (name, short_description)
values
  ('Grupo de prueba', 'Grupo inicial para verificar catálogo')
on conflict (name) do nothing;
