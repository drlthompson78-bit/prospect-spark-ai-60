-- Prevent duplicate prospects on website_url (case-insensitive, ignore nulls)
CREATE UNIQUE INDEX IF NOT EXISTS prospects_website_url_unique
  ON public.prospects (lower(website_url))
  WHERE website_url IS NOT NULL;