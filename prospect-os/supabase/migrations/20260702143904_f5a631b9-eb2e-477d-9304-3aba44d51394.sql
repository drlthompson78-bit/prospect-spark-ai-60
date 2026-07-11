
-- Add clean_list_eligible column
ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS clean_list_eligible boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_prospects_clean_list_eligible
  ON public.prospects (clean_list_eligible) WHERE clean_list_eligible = true;

-- Backfill based on current rules (test records always false)
UPDATE public.prospects
   SET clean_list_eligible = (
        fit_category IN ('A','B','C')
    AND lead_score IS NOT NULL AND lead_score >= 70
    AND redesign_score IS NOT NULL AND redesign_score >= 70
    AND website_review_status = 'reviewed'
    AND (qualification_status IS NULL OR qualification_status NOT LIKE 'rejected%')
    AND is_test_record = false
   );
