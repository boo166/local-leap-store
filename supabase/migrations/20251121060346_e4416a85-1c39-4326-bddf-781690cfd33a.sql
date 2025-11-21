-- Add tracking number to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS tracking_number text,
ADD COLUMN IF NOT EXISTS seller_notes text;

-- Create security definer function to check if user is seller of order
CREATE OR REPLACE FUNCTION public.is_seller_of_order(_user_id uuid, _order_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.order_items oi
    JOIN public.products p ON oi.product_id = p.id
    JOIN public.stores s ON p.store_id = s.id
    WHERE oi.order_id = _order_id
      AND s.user_id = _user_id
  )
$$;

-- Allow sellers to view orders containing their products
CREATE POLICY "Sellers can view orders with their products"
ON public.orders
FOR SELECT
USING (
  public.is_seller_of_order(auth.uid(), id)
);

-- Allow sellers to update order status and tracking
CREATE POLICY "Sellers can update orders with their products"
ON public.orders
FOR UPDATE
USING (
  public.is_seller_of_order(auth.uid(), id)
)
WITH CHECK (
  public.is_seller_of_order(auth.uid(), id)
);

-- Allow sellers to view order items for their products
CREATE POLICY "Sellers can view order items for their products"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.products p
    JOIN public.stores s ON p.store_id = s.id
    WHERE p.id = product_id
      AND s.user_id = auth.uid()
  )
);