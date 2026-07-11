-- Revoke EXECUTE on SECURITY DEFINER functions from anon/authenticated where not needed.
-- Keep: has_role (needed by authenticated RLS policies), get_scan_page (needed by anon for public scan pages).
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_import_allowed() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.block_fictive_prospect_inserts() FROM PUBLIC, anon, authenticated;

-- has_role: only authenticated should call it (not anon)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- get_scan_page: intentionally public (scan landing pages)
REVOKE EXECUTE ON FUNCTION public.get_scan_page(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_scan_page(text) TO anon, authenticated;