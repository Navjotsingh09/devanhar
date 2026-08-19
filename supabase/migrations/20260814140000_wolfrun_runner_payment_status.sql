alter table public.wolfrun_runners
  drop constraint if exists wolfrun_runners_status_check;

alter table public.wolfrun_runners
  add constraint wolfrun_runners_status_check
  check (status in ('payment_pending', 'confirmed', 'failed'));

alter table public.wolfrun_runners
  alter column status set default 'payment_pending';
