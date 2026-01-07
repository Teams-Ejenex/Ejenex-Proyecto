-- Agregar columna categoria a la tabla groups
ALTER TABLE public.groups
ADD COLUMN categoria text NOT NULL DEFAULT 'Sin categoría';
