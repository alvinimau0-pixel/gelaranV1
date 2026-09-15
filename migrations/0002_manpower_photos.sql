-- Shared manpower + photo storage (cloud photo storage + shared database
-- upgrade). Auth stays off per AGENTS.md §0.5 — this app has no sign-in, so
-- these rows are unowned and shared across the whole site team (anyone with
-- the URL can read/write them, same as the rest of this app today).

create table if not exists workers (
  id serial primary key,
  employee_code text,
  name text not null,
  trade text,
  team text,
  subcontractor text,
  phone text,
  photo_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists workers_name_unique_idx on workers (lower(name));

create table if not exists attendance (
  id serial primary key,
  worker_id integer not null references workers(id) on delete cascade,
  attendance_date date not null,
  status text not null default 'Present',
  check_in time,
  check_out time,
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attendance_status_check check (status in ('Present','Absent','Off','Leave')),
  constraint attendance_worker_date_unique unique (worker_id, attendance_date)
);
create index if not exists attendance_date_idx on attendance (attendance_date);

create table if not exists site_photos (
  id serial primary key,
  title text not null,
  note text,
  photo_url text not null,
  photo_date date not null,
  tower text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists site_photos_date_idx on site_photos (photo_date);
