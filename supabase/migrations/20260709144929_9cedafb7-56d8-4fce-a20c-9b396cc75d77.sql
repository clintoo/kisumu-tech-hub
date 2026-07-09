
CREATE TABLE public.rate_limits (
  id BIGSERIAL PRIMARY KEY,
  bucket_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_rate_limits_bucket_time ON public.rate_limits(bucket_key, created_at DESC);

GRANT ALL ON public.rate_limits TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.rate_limits_id_seq TO service_role;

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
-- No policies: only service_role (which bypasses RLS) touches this table.

CREATE OR REPLACE FUNCTION public.check_rate_limit(_bucket TEXT, _max INT, _window INTERVAL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  hits INT;
BEGIN
  DELETE FROM public.rate_limits WHERE created_at < now() - INTERVAL '1 day';
  SELECT COUNT(*) INTO hits FROM public.rate_limits
    WHERE bucket_key = _bucket AND created_at > now() - _window;
  IF hits >= _max THEN
    RETURN FALSE;
  END IF;
  INSERT INTO public.rate_limits(bucket_key) VALUES (_bucket);
  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.check_rate_limit(TEXT, INT, INTERVAL) FROM PUBLIC, anon, authenticated;
