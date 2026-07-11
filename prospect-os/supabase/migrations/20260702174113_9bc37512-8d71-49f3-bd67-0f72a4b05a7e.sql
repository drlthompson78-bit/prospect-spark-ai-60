CREATE OR REPLACE FUNCTION public.block_fictive_prospect_inserts()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.is_test_record = true
     OR NEW.source_type IN ('test_seed', 'assistant_test', 'sandbox')
     OR NEW.company_name ILIKE '[TEST]%'
     OR NEW.company_name ILIKE 'TEST - %'
     OR COALESCE(NEW.notes, '') ILIKE '%[TESTDATA]%'
  THEN
    RAISE EXCEPTION 'Fictive/test prospects are not allowed in public.prospects (company_name=%, source_type=%, is_test_record=%)',
      NEW.company_name, NEW.source_type, NEW.is_test_record
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS block_fictive_prospect_inserts_trg ON public.prospects;
CREATE TRIGGER block_fictive_prospect_inserts_trg
BEFORE INSERT ON public.prospects
FOR EACH ROW EXECUTE FUNCTION public.block_fictive_prospect_inserts();