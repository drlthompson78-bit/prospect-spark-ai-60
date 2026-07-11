
CREATE TABLE public.assistant_test_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  revoked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assistant_test_tokens TO authenticated;
GRANT ALL ON public.assistant_test_tokens TO service_role;
ALTER TABLE public.assistant_test_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage test tokens" ON public.assistant_test_tokens
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.assistant_test_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id uuid REFERENCES public.assistant_test_tokens(id) ON DELETE SET NULL,
  test_type text NOT NULL,
  status text NOT NULL,
  result_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.assistant_test_runs TO authenticated;
GRANT ALL ON public.assistant_test_runs TO service_role;
ALTER TABLE public.assistant_test_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read test runs" ON public.assistant_test_runs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX assistant_test_runs_token_idx ON public.assistant_test_runs(token_id, created_at DESC);
