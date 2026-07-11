
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Auth manage exports" ON public.exports;
DROP POLICY IF EXISTS "Auth manage events" ON public.prospect_events;
DROP POLICY IF EXISTS "Auth read prospects" ON public.prospects;
DROP POLICY IF EXISTS "Auth insert prospects" ON public.prospects;
DROP POLICY IF EXISTS "Auth update prospects" ON public.prospects;
DROP POLICY IF EXISTS "Auth read regions" ON public.regions;
DROP POLICY IF EXISTS "Auth manage scan_pages" ON public.scan_pages;
DROP POLICY IF EXISTS "Auth manage screenshots" ON public.screenshots;
DROP POLICY IF EXISTS "Auth manage search_jobs" ON public.search_jobs;

-- exports: users see/insert own; admins manage all
CREATE POLICY "Users read own exports" ON public.exports FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users insert own exports" ON public.exports FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "Admins update exports" ON public.exports FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete exports" ON public.exports FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- prospect_events
CREATE POLICY "Staff read events" ON public.prospect_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales') OR public.has_role(auth.uid(),'viewer'));
CREATE POLICY "Users insert own events" ON public.prospect_events FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales')));
CREATE POLICY "Admins update events" ON public.prospect_events FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete events" ON public.prospect_events FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- prospects: role-scoped
CREATE POLICY "Staff read prospects" ON public.prospects FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales') OR public.has_role(auth.uid(),'viewer'));
CREATE POLICY "Staff insert prospects" ON public.prospects FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales'));
CREATE POLICY "Staff update prospects" ON public.prospects FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales'));

-- regions
CREATE POLICY "Staff read regions" ON public.regions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales') OR public.has_role(auth.uid(),'viewer'));

-- scan_pages
CREATE POLICY "Staff read scan_pages" ON public.scan_pages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales') OR public.has_role(auth.uid(),'viewer'));
CREATE POLICY "Staff insert scan_pages" ON public.scan_pages FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales'));
CREATE POLICY "Staff update scan_pages" ON public.scan_pages FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales'));
CREATE POLICY "Admins delete scan_pages" ON public.scan_pages FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- screenshots
CREATE POLICY "Staff read screenshots" ON public.screenshots FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales') OR public.has_role(auth.uid(),'viewer'));
CREATE POLICY "Staff insert screenshots" ON public.screenshots FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales'));
CREATE POLICY "Staff update screenshots" ON public.screenshots FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales'));
CREATE POLICY "Admins delete screenshots" ON public.screenshots FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- search_jobs: own + admin
CREATE POLICY "Users read own jobs" ON public.search_jobs FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users insert own jobs" ON public.search_jobs FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales')));
CREATE POLICY "Users update own jobs" ON public.search_jobs FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (created_by = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete jobs" ON public.search_jobs FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- Lock down SECURITY DEFINER helper/trigger functions
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_import_allowed() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.block_fictive_prospect_inserts() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_scan_page(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_scan_page(text) TO anon, authenticated;
