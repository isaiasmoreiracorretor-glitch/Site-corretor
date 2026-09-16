-- Migration to add rich property details: gallery, leisure, commercial conditions, broker analysis, and custom WhatsApp
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS location_address text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS map_query text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS leisure text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS commercial_conditions text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS down_payment_info text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS accepts_fgts boolean NOT NULL DEFAULT true;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS custom_whatsapp_url text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS custom_whatsapp_message text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS gallery_images jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS broker_analysis jsonb NOT NULL DEFAULT '{}'::jsonb;
