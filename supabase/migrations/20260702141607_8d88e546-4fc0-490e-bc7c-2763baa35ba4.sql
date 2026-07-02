ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS website_review_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS visual_age_score integer,
  ADD COLUMN IF NOT EXISTS mobile_usability_score integer,
  ADD COLUMN IF NOT EXISTS cta_score integer,
  ADD COLUMN IF NOT EXISTS trust_score integer,
  ADD COLUMN IF NOT EXISTS local_seo_score integer,
  ADD COLUMN IF NOT EXISTS conversion_opportunity_score integer,
  ADD COLUMN IF NOT EXISTS review_notes text,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_prospects_website_review_status ON public.prospects(website_review_status);