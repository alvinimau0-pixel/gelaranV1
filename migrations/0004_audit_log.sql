-- Shared operational audit history. Auth is intentionally unchanged; entries
-- identify the shared workspace and request metadata until user auth is enabled.
create table if not exists audit_log (
  id bigserial primary key,
  action text not null,
  entity_type text not null,
  entity_id text,
  summary text not null,
  details jsonb not null default '{}'::jsonb,
  actor_label text not null default 'shared workspace',
  request_id text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists audit_log_created_at_idx on audit_log (created_at desc);
create index if not exists audit_log_entity_idx on audit_log (entity_type, entity_id);
