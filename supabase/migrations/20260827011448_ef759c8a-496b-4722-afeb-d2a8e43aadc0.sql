CREATE TABLE public.admin_gate (
  id text PRIMARY KEY DEFAULT 'main',
  username text NOT NULL DEFAULT 'CorretorAdmArea',
  password_hash text,
  password_salt text,
  failed_attempts integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  password_changed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT admin_gate_single_row CHECK (id = 'main')
);

GRANT ALL ON public.admin_gate TO service_role;

ALTER TABLE public.admin_gate ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER admin_gate_set_updated_at
BEFORE UPDATE ON public.admin_gate
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.admin_gate (id, username) VALUES ('main', 'CorretorAdmArea');