-- Enable complete change payloads and Supabase Realtime publication for the
-- dashboard tables. RLS policies remain the authorization boundary.

alter table public.gm_progress_matrix replica identity full;
alter table public.gm_attendance replica identity full;
alter table public.gm_worker_placements replica identity full;
alter table public.gm_material_orders replica identity full;
alter table public.gm_daily_site_reports replica identity full;

alter publication supabase_realtime
  add table public.gm_progress_matrix,
             public.gm_attendance,
             public.gm_worker_placements,
             public.gm_material_orders,
             public.gm_daily_site_reports;
