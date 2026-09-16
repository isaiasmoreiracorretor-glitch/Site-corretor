ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS financing text[] NOT NULL DEFAULT '{}';

UPDATE public.properties
SET financing = ARRAY['Minha Casa Minha Vida']::text[]
WHERE minha_casa_minha_vida = true
  AND NOT ('Minha Casa Minha Vida' = ANY(financing));