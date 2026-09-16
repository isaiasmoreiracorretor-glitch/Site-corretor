ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS image_thumb text;

CREATE POLICY "Admins can upload property images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'imoveis' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update property images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'imoveis' AND public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'imoveis' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete property images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'imoveis' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can read property images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'imoveis' AND public.has_role(auth.uid(), 'admin'::app_role));