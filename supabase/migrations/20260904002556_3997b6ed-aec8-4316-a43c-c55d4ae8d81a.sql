ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS youtube_url text,
  ADD COLUMN IF NOT EXISTS location_address text,
  ADD COLUMN IF NOT EXISTS map_query text,
  ADD COLUMN IF NOT EXISTS gallery_images text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS leisure text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS commercial_conditions text,
  ADD COLUMN IF NOT EXISTS down_payment_info text,
  ADD COLUMN IF NOT EXISTS accepts_fgts boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS custom_whatsapp_url text,
  ADD COLUMN IF NOT EXISTS custom_whatsapp_message text,
  ADD COLUMN IF NOT EXISTS broker_analysis jsonb NOT NULL DEFAULT '{}'::jsonb;