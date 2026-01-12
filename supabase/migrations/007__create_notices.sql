create table notices (
  id uuid primary key default uuid_generate_v4(),
  title varchar(100) not null,
  description text not null,
  image_url varchar,
  start_date timestamptz not null,
  end_date timestamptz not null,
  status varchar(10) check (status in ('draft','published')) default 'draft',
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);