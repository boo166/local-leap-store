-- Add saved_for_later table for cart items
CREATE TABLE IF NOT EXISTS public.saved_for_later (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Add RLS policies for saved_for_later
ALTER TABLE public.saved_for_later ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their saved items"
  ON public.saved_for_later
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add promo_codes table
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  min_purchase_amount NUMERIC,
  max_discount_amount NUMERIC,
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for promo_codes
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Promo codes are viewable by everyone"
  ON public.promo_codes
  FOR SELECT
  USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

CREATE POLICY "Admins can manage promo codes"
  ON public.promo_codes
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- Add price_history table for wishlist price tracking
CREATE TABLE IF NOT EXISTS public.product_price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for price_history
ALTER TABLE public.product_price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Price history is viewable by everyone"
  ON public.product_price_history
  FOR SELECT
  USING (true);

-- Add function to validate promo code
CREATE OR REPLACE FUNCTION public.validate_promo_code(
  code_param TEXT,
  cart_total_param NUMERIC
) RETURNS TABLE(
  is_valid BOOLEAN,
  discount_amount NUMERIC,
  message TEXT
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  promo_record RECORD;
  calculated_discount NUMERIC;
BEGIN
  -- Find the promo code
  SELECT * INTO promo_record
  FROM public.promo_codes
  WHERE code = code_param
    AND is_active = true
    AND (valid_until IS NULL OR valid_until > now())
    AND (usage_limit IS NULL OR usage_count < usage_limit);
  
  -- Check if code exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0::NUMERIC, 'Invalid or expired promo code';
    RETURN;
  END IF;
  
  -- Check minimum purchase amount
  IF promo_record.min_purchase_amount IS NOT NULL AND cart_total_param < promo_record.min_purchase_amount THEN
    RETURN QUERY SELECT false, 0::NUMERIC, 
      'Minimum purchase amount of $' || promo_record.min_purchase_amount || ' required';
    RETURN;
  END IF;
  
  -- Calculate discount
  IF promo_record.discount_type = 'percentage' THEN
    calculated_discount := cart_total_param * (promo_record.discount_value / 100);
  ELSE
    calculated_discount := promo_record.discount_value;
  END IF;
  
  -- Apply max discount cap
  IF promo_record.max_discount_amount IS NOT NULL AND calculated_discount > promo_record.max_discount_amount THEN
    calculated_discount := promo_record.max_discount_amount;
  END IF;
  
  -- Make sure discount doesn't exceed cart total
  IF calculated_discount > cart_total_param THEN
    calculated_discount := cart_total_param;
  END IF;
  
  RETURN QUERY SELECT true, calculated_discount, 'Promo code applied successfully';
END;
$$;

-- Add trigger to update updated_at
CREATE OR REPLACE TRIGGER update_saved_for_later_updated_at
  BEFORE UPDATE ON public.saved_for_later
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_promo_codes_updated_at
  BEFORE UPDATE ON public.promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();