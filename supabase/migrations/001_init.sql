-- 001_init.sql
-- Migración inicial
-- Crea tablas base: groups y profiles
-- Define estructura mínima del dominio "Grupos estudiantiles"

-- Extensión para UUIDs
create extension if not exists pgcrypto;

-- =========================
-- Tabla: profiles
-- =========================
create table if not exists public.profiles (
  id uuid primary key
    references auth.users(id)
    on delete cascade,
  role text not null default 'user'
);

-- =========================
-- Tabla: groups
-- =========================
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name varchar(120) not null unique,
  short_description varchar(300) not null,
  full_description text,
  email varchar(150),
  social_links jsonb,
  logo_url varchar,
  created_at timestamptz not null default now(),
  updated_at timesta_
