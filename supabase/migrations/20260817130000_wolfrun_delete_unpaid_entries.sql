-- Delete all Wolf Run entries that were never paid.
-- From this point forward, no row is created at checkout time;
-- rows are only inserted by the webhook on confirmed payment.
DELETE FROM public.wolfrun_runners
WHERE status != 'confirmed';

-- Tighten the check constraint to remove payment_pending now that it is no longer used
ALTER TABLE public.wolfrun_runners
  DROP CONSTRAINT IF EXISTS wolfrun_runners_status_check;

ALTER TABLE public.wolfrun_runners
  ADD CONSTRAINT wolfrun_runners_status_check
  CHECK (status IN ('confirmed', 'failed'));
