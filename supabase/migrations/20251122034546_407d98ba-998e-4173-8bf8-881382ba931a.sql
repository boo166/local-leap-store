-- Add enhanced store fields
ALTER TABLE public.stores 
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS instagram TEXT,
  ADD COLUMN IF NOT EXISTS facebook TEXT,
  ADD COLUMN IF NOT EXISTS twitter TEXT,
  ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT '{"monday": "9:00 AM - 5:00 PM", "tuesday": "9:00 AM - 5:00 PM", "wednesday": "9:00 AM - 5:00 PM", "thursday": "9:00 AM - 5:00 PM", "friday": "9:00 AM - 5:00 PM", "saturday": "Closed", "sunday": "Closed"}'::jsonb,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create storage bucket for store images if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-images', 'store-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist, then recreate
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Store owners can upload store images" ON storage.objects;
  DROP POLICY IF EXISTS "Store owners can update their store images" ON storage.objects;
  DROP POLICY IF EXISTS "Store owners can delete their store images" ON storage.objects;
  DROP POLICY IF EXISTS "Store images are publicly accessible" ON storage.objects;
END $$;

-- Create RLS policies for store-images bucket
CREATE POLICY "Store owners can upload store images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'store-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Store owners can update their store images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'store-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Store owners can delete their store images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'store-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Store images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'store-images');

-- Create function to increment store view count
CREATE OR REPLACE FUNCTION public.increment_store_views(store_id_param UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.stores
  SET view_count = view_count + 1
  WHERE id = store_id_param;
$$;