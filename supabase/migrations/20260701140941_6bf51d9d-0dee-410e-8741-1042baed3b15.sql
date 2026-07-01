
-- ========== ENUMS ==========
CREATE TYPE public.app_role AS ENUM ('admin','sales','viewer');

-- ========== PROFILES ==========
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- ========== USER ROLES ==========
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Trigger: create profile + first user gets admin role, others get viewer
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE user_count INT;
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email);

  SELECT COUNT(*) INTO user_count FROM auth.users;
  IF user_count <= 1 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'viewer');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========== SHARED updated_at TRIGGER ==========
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ========== REGIONS ==========
CREATE TABLE public.regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_order INTEGER NOT NULL,
  region_name TEXT NOT NULL,
  ring INTEGER,
  city TEXT,
  distance_from_rotterdam_km NUMERIC,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.regions TO authenticated;
GRANT ALL ON public.regions TO service_role;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read regions" ON public.regions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage regions" ON public.regions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.regions (region_order, region_name, ring, city, distance_from_rotterdam_km) VALUES
(1, 'Rotterdam / 010', 1, 'Rotterdam', 0),
(2, 'Schiedam / Vlaardingen', 2, 'Schiedam', 8),
(3, 'Capelle / Krimpen / Ridderkerk / Barendrecht', 2, 'Capelle aan den IJssel', 10),
(4, 'Dordrecht / Delft / Gouda / Zoetermeer', 3, 'Dordrecht', 25),
(5, 'Den Haag / Westland / Leiden', 3, 'Den Haag', 30),
(6, 'Utrecht / Breda / bredere Randstad', 4, 'Utrecht', 60);

-- ========== SEARCH JOBS ==========
CREATE TABLE public.search_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
  segment TEXT,
  query TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  results_found INTEGER NOT NULL DEFAULT 0,
  prospects_created INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.search_jobs TO authenticated;
GRANT ALL ON public.search_jobs TO service_role;
ALTER TABLE public.search_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth manage search_jobs" ON public.search_jobs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ========== PROSPECTS ==========
CREATE TABLE public.prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rank_overall INTEGER,
  region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
  region_rank INTEGER,
  company_name TEXT NOT NULL,
  segment TEXT,
  city TEXT,
  address TEXT,
  distance_ring INTEGER,
  latitude NUMERIC,
  longitude NUMERIC,
  google_place_id TEXT UNIQUE,
  website_url TEXT,
  contact_page_url TEXT,
  phone_main TEXT,
  phone_mobile_e164 TEXT,
  whatsapp_visible BOOLEAN NOT NULL DEFAULT false,
  whatsapp_link TEXT,
  google_rating NUMERIC,
  google_review_count INTEGER,
  business_status TEXT,
  source_url TEXT,
  source_type TEXT NOT NULL DEFAULT 'google_places',
  is_directory_or_leadsite BOOLEAN NOT NULL DEFAULT false,
  has_own_website BOOLEAN NOT NULL DEFAULT false,
  has_visible_phone BOOLEAN NOT NULL DEFAULT false,
  has_mobile_or_whatsapp BOOLEAN NOT NULL DEFAULT false,
  redesign_score INTEGER NOT NULL DEFAULT 0,
  lead_score INTEGER NOT NULL DEFAULT 0,
  fit_category TEXT NOT NULL DEFAULT 'pending',
  reason_fit TEXT,
  exclusion_reason TEXT,
  permission_status TEXT NOT NULL DEFAULT 'not_contacted',
  import_allowed BOOLEAN NOT NULL DEFAULT false,
  outreach_status TEXT NOT NULL DEFAULT 'not_contacted',
  notes TEXT,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_prospects_region ON public.prospects(region_id);
CREATE INDEX idx_prospects_fit ON public.prospects(fit_category);
CREATE INDEX idx_prospects_lead_score ON public.prospects(lead_score DESC);
CREATE UNIQUE INDEX idx_prospects_website_unique ON public.prospects(lower(website_url)) WHERE website_url IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.prospects TO authenticated;
GRANT ALL ON public.prospects TO service_role;
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read prospects" ON public.prospects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert prospects" ON public.prospects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update prospects" ON public.prospects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins delete prospects" ON public.prospects FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER prospects_set_updated_at BEFORE UPDATE ON public.prospects
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Compliance: import_allowed can only be true if permission_status='opt_in'
CREATE OR REPLACE FUNCTION public.enforce_import_allowed()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.import_allowed = true AND NEW.permission_status <> 'opt_in' THEN
    NEW.import_allowed := false;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER prospects_enforce_import_allowed BEFORE INSERT OR UPDATE ON public.prospects
FOR EACH ROW EXECUTE FUNCTION public.enforce_import_allowed();

-- ========== PROSPECT EVENTS ==========
CREATE TABLE public.prospect_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_note TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_prospect ON public.prospect_events(prospect_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prospect_events TO authenticated;
GRANT ALL ON public.prospect_events TO service_role;
ALTER TABLE public.prospect_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth manage events" ON public.prospect_events FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ========== SCREENSHOTS ==========
CREATE TABLE public.screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  screenshot_type TEXT NOT NULL DEFAULT 'desktop',
  image_url TEXT,
  storage_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.screenshots TO authenticated;
GRANT ALL ON public.screenshots TO service_role;
ALTER TABLE public.screenshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth manage screenshots" ON public.screenshots FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ========== SCAN PAGES ==========
CREATE TABLE public.scan_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  scan_slug TEXT NOT NULL UNIQUE,
  public_url TEXT,
  scan_score INTEGER,
  scan_status TEXT NOT NULL DEFAULT 'draft',
  opened_count INTEGER NOT NULL DEFAULT 0,
  last_opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scan_pages TO authenticated;
GRANT ALL ON public.scan_pages TO service_role;
ALTER TABLE public.scan_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth manage scan_pages" ON public.scan_pages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Public RPC to fetch scan page + increment view counter (no direct anon table access)
CREATE OR REPLACE FUNCTION public.get_scan_page(_slug TEXT)
RETURNS TABLE (
  scan_slug TEXT,
  company_name TEXT,
  city TEXT,
  website_url TEXT,
  scan_score INTEGER,
  scan_status TEXT
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.scan_pages
    SET opened_count = opened_count + 1, last_opened_at = now()
    WHERE scan_pages.scan_slug = _slug;
  RETURN QUERY
    SELECT sp.scan_slug, p.company_name, p.city, p.website_url, sp.scan_score, sp.scan_status
    FROM public.scan_pages sp
    JOIN public.prospects p ON p.id = sp.prospect_id
    WHERE sp.scan_slug = _slug;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_scan_page(TEXT) TO anon, authenticated;

-- ========== EXPORTS ==========
CREATE TABLE public.exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  export_type TEXT NOT NULL,
  file_url TEXT,
  filters_json JSONB,
  row_count INTEGER,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exports TO authenticated;
GRANT ALL ON public.exports TO service_role;
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth manage exports" ON public.exports FOR ALL TO authenticated USING (true) WITH CHECK (true);
