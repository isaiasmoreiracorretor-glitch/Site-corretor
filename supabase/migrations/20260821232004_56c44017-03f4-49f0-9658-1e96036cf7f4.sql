CREATE TABLE public.leads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  property_id uuid,
  property_ref text NOT NULL DEFAULT '',
  property_title text NOT NULL DEFAULT '',
  property_slug text NOT NULL DEFAULT '',
  developer text NOT NULL DEFAULT '',
  neighborhood text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  page_url text NOT NULL DEFAULT '',
  user_agent text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'site'
);

GRANT INSERT ON public.leads TO anon;
GRANT INSERT, SELECT, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create leads"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view leads"
ON public.leads
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete leads"
ON public.leads
FOR DELETE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX leads_created_at_idx ON public.leads (created_at DESC);