-- Add billing_history table for tracking payments
CREATE TABLE IF NOT EXISTS public.billing_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES public.user_subscriptions(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EGP',
  billing_cycle TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'vodafone_cash',
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  description TEXT,
  invoice_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for billing_history
CREATE POLICY "Users can view their own billing history"
  ON public.billing_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all billing history"
  ON public.billing_history
  FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage billing history"
  ON public.billing_history
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- Add usage_tracking table
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies for usage_tracking
CREATE POLICY "Users can view their own usage"
  ON public.usage_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage usage tracking"
  ON public.usage_tracking
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- Function to get usage statistics
CREATE OR REPLACE FUNCTION public.get_user_usage_stats(user_id_param UUID)
RETURNS TABLE(
  total_products INTEGER,
  active_products INTEGER,
  total_orders INTEGER,
  total_revenue NUMERIC,
  product_limit INTEGER,
  usage_percentage INTEGER
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  plan_limit INTEGER;
BEGIN
  -- Get user's product limit from subscription
  SELECT sp.max_products INTO plan_limit
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_id_param
    AND us.status IN ('trial', 'active')
    AND us.current_period_end > now()
  LIMIT 1;

  -- Return usage statistics
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT p.id)::INTEGER as total_products,
    COUNT(DISTINCT p.id) FILTER (WHERE p.is_active = true)::INTEGER as active_products,
    COUNT(DISTINCT o.id)::INTEGER as total_orders,
    COALESCE(SUM(o.total_amount), 0)::NUMERIC as total_revenue,
    COALESCE(plan_limit, 0)::INTEGER as product_limit,
    CASE 
      WHEN plan_limit IS NULL OR plan_limit = 0 THEN 0
      ELSE (COUNT(DISTINCT p.id)::FLOAT / plan_limit * 100)::INTEGER
    END as usage_percentage
  FROM public.stores s
  LEFT JOIN public.products p ON s.id = p.store_id
  LEFT JOIN public.order_items oi ON p.id = oi.product_id
  LEFT JOIN public.orders o ON oi.order_id = o.id AND o.status = 'completed'
  WHERE s.user_id = user_id_param;
END;
$$;

-- Trigger to update updated_at
CREATE OR REPLACE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON public.usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();