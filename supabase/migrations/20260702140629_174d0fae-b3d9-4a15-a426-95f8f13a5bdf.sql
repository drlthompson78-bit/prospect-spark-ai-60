ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS raw_opportunity_score integer NOT NULL DEFAULT 0;
ALTER TABLE public.prospects ALTER COLUMN lead_score DROP NOT NULL;
ALTER TABLE public.prospects ALTER COLUMN lead_score DROP DEFAULT;
UPDATE public.prospects SET lead_score = 0 WHERE qualification_status LIKE 'rejected_%';
UPDATE public.prospects SET lead_score = NULL WHERE qualification_status = 'pending_manual_review';