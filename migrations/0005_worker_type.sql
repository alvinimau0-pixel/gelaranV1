-- Persist the manpower split used by the attendance and manpower registers.
alter table workers add column if not exists worker_type text not null default 'Direct';
update workers
set worker_type = case
  when nullif(trim(coalesce(subcontractor, '')), '') is not null then 'Subcontractor'
  else 'Direct'
end
where worker_type is null or worker_type not in ('Direct', 'Subcontractor');
alter table workers drop constraint if exists workers_worker_type_check;
alter table workers add constraint workers_worker_type_check check (worker_type in ('Direct', 'Subcontractor'));
create index if not exists workers_worker_type_idx on workers (worker_type) where active = true;
