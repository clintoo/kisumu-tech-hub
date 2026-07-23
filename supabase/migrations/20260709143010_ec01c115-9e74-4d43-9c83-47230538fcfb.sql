
CREATE OR REPLACE FUNCTION public.normalize_email()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.email = lower(btrim(NEW.email));
  RETURN NEW;
END;
$$;
