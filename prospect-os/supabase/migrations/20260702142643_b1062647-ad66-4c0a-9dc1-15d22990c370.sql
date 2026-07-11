-- Extend assistant_test_tokens
ALTER TABLE public.assistant_test_tokens
  ADD COLUMN IF NOT EXISTS scopes text[] NOT NULL DEFAULT ARRAY['read']::text[],
  ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT 'sandbox';

-- Prospects: test flag
ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS is_test_record boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_prospects_is_test_record ON public.prospects(is_test_record);

-- Action logs
CREATE TABLE IF NOT EXISTS public.assistant_action_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id uuid REFERENCES public.assistant_test_tokens(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  target_table text,
  target_id uuid,
  request_json jsonb,
  result_json jsonb,
  status text NOT NULL DEFAULT 'success',
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.assistant_action_logs TO authenticated;
GRANT ALL ON public.assistant_action_logs TO service_role;
ALTER TABLE public.assistant_action_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view action logs"
  ON public.assistant_action_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX IF NOT EXISTS idx_assistant_action_logs_created_at ON public.assistant_action_logs(created_at DESC);

-- Action settings (single row toggle)
CREATE TABLE IF NOT EXISTS public.assistant_action_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  action_mode_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
GRANT SELECT, INSERT, UPDATE ON public.assistant_action_settings TO authenticated;
GRANT ALL ON public.assistant_action_settings TO service_role;
ALTER TABLE public.assistant_action_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read action settings"
  ON public.assistant_action_settings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert action settings"
  ON public.assistant_action_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update action settings"
  ON public.assistant_action_settings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.assistant_action_settings (id, action_mode_enabled) VALUES (true, false)
  ON CONFLICT (id) DO NOTHING;