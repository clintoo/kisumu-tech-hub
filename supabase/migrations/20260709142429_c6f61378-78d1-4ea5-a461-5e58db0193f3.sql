
-- 1. Lock down SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_update_event_statuses() FROM PUBLIC, anon, authenticated;

-- has_role: needed by RLS policies for authenticated users only. Restrict anon and enforce self-check.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow callers to check their own roles
  IF _user_id IS DISTINCT FROM auth.uid() THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;

-- 2. Replace overly permissive "always true" INSERT policies with input validation
DROP POLICY IF EXISTS "Anyone can register" ON public.registrations;
CREATE POLICY "Anyone can register"
  ON public.registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(full_name) BETWEEN 1 AND 120
    AND length(email) BETWEEN 3 AND 254
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND length(phone) BETWEEN 5 AND 30
    AND (github_url IS NULL OR length(github_url) <= 500)
    AND (linkedin_url IS NULL OR length(linkedin_url) <= 500)
  );

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(email) BETWEEN 3 AND 254
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  );
