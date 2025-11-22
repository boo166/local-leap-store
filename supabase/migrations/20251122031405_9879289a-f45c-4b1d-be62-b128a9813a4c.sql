-- Add refund/cancellation fields to orders table
ALTER TABLE public.orders 
ADD COLUMN cancellation_reason TEXT,
ADD COLUMN cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN refund_status TEXT DEFAULT 'none' CHECK (refund_status IN ('none', 'requested', 'approved', 'rejected', 'completed'));

-- Add comment for clarity
COMMENT ON COLUMN public.orders.refund_status IS 'Refund status: none, requested, approved, rejected, completed';
COMMENT ON COLUMN public.orders.cancellation_reason IS 'Reason provided by buyer for cancellation';
COMMENT ON COLUMN public.orders.cancelled_at IS 'Timestamp when order was cancelled';

-- Create RLS policy for buyers to request cancellation
CREATE POLICY "Users can request cancellation for their orders"
ON public.orders
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id);

-- Update existing RLS for sellers to handle refunds
DROP POLICY IF EXISTS "Sellers can update orders with their products" ON public.orders;

CREATE POLICY "Sellers can update orders with their products"
ON public.orders
FOR UPDATE
USING (is_seller_of_order(auth.uid(), id))
WITH CHECK (is_seller_of_order(auth.uid(), id));