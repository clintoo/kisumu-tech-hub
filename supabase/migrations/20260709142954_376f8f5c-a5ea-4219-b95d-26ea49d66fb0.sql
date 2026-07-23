
-- Normalize emails to lowercase + trim before insert
CREATE OR REPLACE FUNCTION public.normalize_email()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.email = lower(btrim(NEW.email));
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.normalize_email() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_registrations_normalize_email ON public.registrations;
CREATE TRIGGER trg_registrations_normalize_email
  BEFORE INSERT ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.normalize_email();

DROP TRIGGER IF EXISTS trg_newsletter_normalize_email ON public.newsletter_subscribers;
CREATE TRIGGER trg_newsletter_normalize_email
  BEFORE INSERT ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.normalize_email();

-- Backfill existing rows to lowercase before adding unique constraint
UPDATE public.newsletter_subscribers SET email = lower(btrim(email)) WHERE email <> lower(btrim(email));
UPDATE public.registrations SET email = lower(btrim(email)) WHERE email <> lower(btrim(email));

-- Deduplicate newsletter before adding unique constraint (keep earliest)
DELETE FROM public.newsletter_subscribers a
USING public.newsletter_subscribers b
WHERE a.email = b.email AND a.created_at > b.created_at;

-- Unique newsletter email
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_unique
  ON public.newsletter_subscribers (email);

-- Performance indexes
CREATE INDEX IF NOT EXISTS events_status_datetime_idx
  ON public.events (status, date_time DESC);

CREATE INDEX IF NOT EXISTS events_datetime_idx
  ON public.events (date_time DESC);

CREATE INDEX IF NOT EXISTS registrations_event_id_idx
  ON public.registrations (event_id);

CREATE INDEX IF NOT EXISTS registrations_event_email_idx
  ON public.registrations (event_id, email);
