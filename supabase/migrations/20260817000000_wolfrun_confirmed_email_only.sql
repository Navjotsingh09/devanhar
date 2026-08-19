-- Allow retrying failed or pending Wolf Run entries while keeping confirmed runners unique.
-- This removes the global email uniqueness that was blocking repeat attempts.

ALTER TABLE public.wolfrun_runners
  DROP CONSTRAINT IF EXISTS wolfrun_runners_email_key;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_wolfrun_runner_email_confirmed
  ON public.wolfrun_runners (email)
  WHERE status = 'confirmed';

ALTER TABLE public.wolfrun_runners
  ALTER COLUMN status SET DEFAULT 'payment_pending';
