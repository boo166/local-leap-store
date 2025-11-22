-- Add enhanced product fields
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS weight DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS dimensions JSONB;

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Sellers can upload product images" ON storage.objects;
  DROP POLICY IF EXISTS "Sellers can update product images" ON storage.objects;
  DROP POLICY IF EXISTS "Sellers can delete product images" ON storage.objects;
  DROP POLICY IF EXISTS "Product images are publicly accessible" ON storage.objects;
END $$;

-- Create RLS policies for product-images bucket
CREATE POLICY "Sellers can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Sellers can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Sellers can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Product images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Create function to increment product sales
CREATE OR REPLACE FUNCTION public.increment_product_sales(product_id_param UUID, quantity_param INTEGER)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.products
  SET sales_count = sales_count + quantity_param
  WHERE id = product_id_param;
$$;

-- Create function to check low stock
CREATE OR REPLACE FUNCTION public.get_low_stock_products(store_id_param UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  inventory_count INTEGER,
  low_stock_threshold INTEGER
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name, inventory_count, low_stock_threshold
  FROM public.products
  WHERE store_id = store_id_param
    AND inventory_count <= low_stock_threshold
    AND is_active = true
  ORDER BY inventory_count ASC;
$$;

COMMENT ON COLUMN products.sku IS 'Stock Keeping Unit - unique product identifier';
COMMENT ON COLUMN products.images IS 'Array of product image URLs';
COMMENT ON COLUMN products.variants IS 'Product variants (size, color, etc.)';
COMMENT ON COLUMN products.tags IS 'Searchable tags for product discovery';
COMMENT ON COLUMN products.low_stock_threshold IS 'Inventory level that triggers low stock alert';
COMMENT ON COLUMN products.sales_count IS 'Total number of units sold';
COMMENT ON COLUMN products.weight IS 'Product weight in kg';
COMMENT ON COLUMN products.dimensions IS 'Product dimensions (length, width, height)';