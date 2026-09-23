create table if not exists daily_summary (
  id serial primary key,
  summary_date date not null unique,
  generated_at timestamptz not null default now(),
  present_count integer not null default 0,
  absent_count integer not null default 0,
  mc_count integer not null default 0,
  off_count integer not null default 0,
  direct_count integer not null default 0,
  subcontractor_count integer not null default 0,
  tower_a_progress numeric(6,5) not null default 0,
  tower_b_progress numeric(6,5) not null default 0,
  overall_progress numeric(6,5) not null default 0,
  payload jsonb not null default '{}'::jsonb
);
create index if not exists daily_summary_date_idx on daily_summary (summary_date desc);
