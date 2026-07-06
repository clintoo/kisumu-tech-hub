
-- New enum values (safe if exist)
ALTER TYPE public.event_status ADD VALUE IF NOT EXISTS 'cancelled';
ALTER TYPE public.event_status ADD VALUE IF NOT EXISTS 'postponed';

-- Optional end time
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ;

-- Prevent duplicate registrations by email per event
CREATE UNIQUE INDEX IF NOT EXISTS registrations_event_email_unique
  ON public.registrations (event_id, lower(email));

-- Auto status updater
CREATE OR REPLACE FUNCTION public.auto_update_event_statuses()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.events
     SET status = 'live'
   WHERE status = 'upcoming'
     AND date_time <= now()
     AND COALESCE(ends_at, date_time + interval '3 hours') > now();

  UPDATE public.events
     SET status = 'completed'
   WHERE status IN ('upcoming','live')
     AND COALESCE(ends_at, date_time + interval '3 hours') <= now();
$$;

-- Schedule it every 5 minutes
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  PERFORM cron.unschedule('auto-update-event-statuses');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'auto-update-event-statuses',
  '*/5 * * * *',
  $$SELECT public.auto_update_event_statuses();$$
);
