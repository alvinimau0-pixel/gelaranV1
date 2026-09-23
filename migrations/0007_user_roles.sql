-- App-level role used to protect attendance and manpower mutations.
alter table if exists "user" add column if not exists "role" text not null default 'viewer';
alter table if exists "user" drop constraint if exists user_role_check;
alter table if exists "user" add constraint user_role_check check ("role" in ('supervisor', 'viewer'));
create index if not exists user_role_idx on "user" ("role");
