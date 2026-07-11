ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS qualification_status text;
CREATE INDEX IF NOT EXISTS prospects_qualification_status_idx ON public.prospects(qualification_status);