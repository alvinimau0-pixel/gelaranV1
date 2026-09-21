-- Shared MEP matrix progression (floor x item %). Singleton JSON row so every
-- device reads/writes the same matrix. Seeded from report-data on first load.

create table if not exists mep_progression (
  id integer primary key default 1 check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);
