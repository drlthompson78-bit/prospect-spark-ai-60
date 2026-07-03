
-- Add sourcing traceability fields to prospects
ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS search_job_id uuid REFERENCES public.search_jobs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_query text,
  ADD COLUMN IF NOT EXISTS target_city text,
  ADD COLUMN IF NOT EXISTS target_segment text,
  ADD COLUMN IF NOT EXISTS actual_city text,
  ADD COLUMN IF NOT EXISTS location_match text;

CREATE INDEX IF NOT EXISTS idx_prospects_search_job_id ON public.prospects(search_job_id);
CREATE INDEX IF NOT EXISTS idx_prospects_target_city ON public.prospects(target_city);
CREATE INDEX IF NOT EXISTS idx_prospects_actual_city ON public.prospects(actual_city);

-- Extend search_jobs with target metadata and run counters
ALTER TABLE public.search_jobs
  ADD COLUMN IF NOT EXISTS source_query text,
  ADD COLUMN IF NOT EXISTS target_city text,
  ADD COLUMN IF NOT EXISTS target_segment text,
  ADD COLUMN IF NOT EXISTS started_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS raw_results_found integer,
  ADD COLUMN IF NOT EXISTS review_queue_candidates integer,
  ADD COLUMN IF NOT EXISTS rejected_count integer,
  ADD COLUMN IF NOT EXISTS duplicates_skipped integer;
