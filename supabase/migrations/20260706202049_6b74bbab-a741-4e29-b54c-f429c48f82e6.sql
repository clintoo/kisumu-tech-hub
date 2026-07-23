
REVOKE ALL ON FUNCTION public.auto_update_event_statuses() FROM PUBLIC, anon, authenticated;

-- Storage policies for event-images bucket
CREATE POLICY "Public can view event images"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

CREATE POLICY "Admins can upload event images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update event images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'event-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete event images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-images' AND public.has_role(auth.uid(), 'admin'));
