-- Restore execute permissions required by RLS policies that call has_role(...).
-- Without this, authenticated requests hit 403/42501 "permission denied".
DO $$
DECLARE
	fn_signature text;
BEGIN
	FOR fn_signature IN
		SELECT pg_catalog.oidvectortypes(p.proargtypes)
		FROM pg_catalog.pg_proc p
		JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
		WHERE n.nspname = 'public'
			AND p.proname = 'has_role'
	LOOP
		EXECUTE format('GRANT EXECUTE ON FUNCTION public.has_role(%s) TO authenticated', fn_signature);
	END LOOP;
END;
$$;
