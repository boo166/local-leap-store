-- Create store_reviews table for store-level reviews
CREATE TABLE IF NOT EXISTS public.store_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_images JSONB DEFAULT '[]'::jsonb,
  helpful_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,
  verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(store_id, user_id)
);

-- Create index for faster queries
CREATE INDEX idx_store_reviews_store_id ON public.store_reviews(store_id);
CREATE INDEX idx_store_reviews_user_id ON public.store_reviews(user_id);
CREATE INDEX idx_store_reviews_rating ON public.store_reviews(rating);

-- Enable RLS
ALTER TABLE public.store_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for store_reviews
CREATE POLICY "Store reviews are viewable by everyone"
ON public.store_reviews
FOR SELECT
USING (is_approved = true);

CREATE POLICY "Users can create reviews for stores they purchased from"
ON public.store_reviews
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1
    FROM public.orders o
    JOIN public.order_items oi ON o.id = oi.order_id
    JOIN public.products p ON oi.product_id = p.id
    WHERE o.user_id = auth.uid()
      AND p.store_id = store_reviews.store_id
      AND o.status IN ('delivered', 'completed')
  )
);

CREATE POLICY "Users can update their own store reviews"
ON public.store_reviews
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own store reviews"
ON public.store_reviews
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all store reviews"
ON public.store_reviews
FOR ALL
USING (is_admin(auth.uid()));

-- Create store_verifications table
CREATE TABLE IF NOT EXISTS public.store_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL UNIQUE REFERENCES public.stores(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verification_type TEXT NOT NULL DEFAULT 'basic' CHECK (verification_type IN ('basic', 'premium', 'enterprise')),
  business_documents JSONB DEFAULT '[]'::jsonb,
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(user_id),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index
CREATE INDEX idx_store_verifications_store_id ON public.store_verifications(store_id);
CREATE INDEX idx_store_verifications_status ON public.store_verifications(status);

-- Enable RLS
ALTER TABLE public.store_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for store_verifications
CREATE POLICY "Store owners can view their own verification"
ON public.store_verifications
FOR SELECT
USING (
  store_id IN (
    SELECT id FROM public.stores WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Store owners can create verification requests"
ON public.store_verifications
FOR INSERT
WITH CHECK (
  store_id IN (
    SELECT id FROM public.stores WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all verifications"
ON public.store_verifications
FOR ALL
USING (is_admin(auth.uid()));

-- Add verification status and theme to stores table
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_badge TEXT,
ADD COLUMN IF NOT EXISTS theme_colors JSONB DEFAULT '{
  "primary": "#2563eb",
  "secondary": "#64748b",
  "accent": "#f59e0b",
  "background": "#ffffff",
  "text": "#1e293b"
}'::jsonb,
ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- Create store_analytics table for detailed tracking
CREATE TABLE IF NOT EXISTS public.store_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  product_clicks INTEGER DEFAULT 0,
  add_to_cart INTEGER DEFAULT 0,
  orders INTEGER DEFAULT 0,
  revenue NUMERIC(10,2) DEFAULT 0,
  conversion_rate NUMERIC(5,2) DEFAULT 0,
  visitor_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(store_id, date)
);

-- Create index
CREATE INDEX idx_store_analytics_store_id ON public.store_analytics(store_id);
CREATE INDEX idx_store_analytics_date ON public.store_analytics(date DESC);

-- Enable RLS
ALTER TABLE public.store_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for store_analytics
CREATE POLICY "Store owners can view their own analytics"
ON public.store_analytics
FOR SELECT
USING (
  store_id IN (
    SELECT id FROM public.stores WHERE user_id = auth.uid()
  )
);

CREATE POLICY "System can insert analytics"
ON public.store_analytics
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update analytics"
ON public.store_analytics
FOR UPDATE
USING (true);

-- Function to update store ratings
CREATE OR REPLACE FUNCTION public.update_store_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.stores
    SET 
      average_rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM public.store_reviews
        WHERE store_id = NEW.store_id AND is_approved = true
      ),
      total_reviews = (
        SELECT COUNT(*)
        FROM public.store_reviews
        WHERE store_id = NEW.store_id AND is_approved = true
      )
    WHERE id = NEW.store_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.stores
    SET 
      average_rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM public.store_reviews
        WHERE store_id = OLD.store_id AND is_approved = true
      ),
      total_reviews = (
        SELECT COUNT(*)
        FROM public.store_reviews
        WHERE store_id = OLD.store_id AND is_approved = true
      )
    WHERE id = OLD.store_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for store rating updates
DROP TRIGGER IF EXISTS update_store_rating_trigger ON public.store_reviews;
CREATE TRIGGER update_store_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.store_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_store_rating();

-- Function to track store analytics
CREATE OR REPLACE FUNCTION public.track_store_view(
  p_store_id UUID,
  p_visitor_data JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
BEGIN
  INSERT INTO public.store_analytics (store_id, date, views, unique_visitors, visitor_data)
  VALUES (p_store_id, v_today, 1, 1, p_visitor_data)
  ON CONFLICT (store_id, date)
  DO UPDATE SET
    views = store_analytics.views + 1,
    unique_visitors = store_analytics.unique_visitors + 1;
END;
$$;

-- Function to get store analytics summary
CREATE OR REPLACE FUNCTION public.get_store_analytics_summary(
  p_store_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE(
  total_views BIGINT,
  total_unique_visitors BIGINT,
  total_orders BIGINT,
  total_revenue NUMERIC,
  avg_conversion_rate NUMERIC,
  daily_data JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    SUM(views)::BIGINT as total_views,
    SUM(unique_visitors)::BIGINT as total_unique_visitors,
    SUM(orders)::BIGINT as total_orders,
    SUM(revenue)::NUMERIC as total_revenue,
    AVG(conversion_rate)::NUMERIC as avg_conversion_rate,
    jsonb_agg(
      jsonb_build_object(
        'date', date,
        'views', views,
        'unique_visitors', unique_visitors,
        'orders', orders,
        'revenue', revenue,
        'conversion_rate', conversion_rate
      ) ORDER BY date DESC
    ) as daily_data
  FROM public.store_analytics
  WHERE store_id = p_store_id
    AND date >= CURRENT_DATE - p_days
  GROUP BY store_id;
END;
$$;