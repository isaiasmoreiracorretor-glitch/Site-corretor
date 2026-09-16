ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS phone text NOT NULL DEFAULT ''::text,
  ADD COLUMN IF NOT EXISTS household_income text NOT NULL DEFAULT ''::text,
  ADD COLUMN IF NOT EXISTS age text NOT NULL DEFAULT ''::text,
  ADD COLUMN IF NOT EXISTS down_payment text NOT NULL DEFAULT ''::text,
  ADD COLUMN IF NOT EXISTS fgts text NOT NULL DEFAULT ''::text;