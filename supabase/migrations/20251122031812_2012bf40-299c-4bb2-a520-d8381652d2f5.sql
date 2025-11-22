-- Create product reviews table
CREATE TABLE public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, user_id)
);

COMMENT ON COLUMN public.product_reviews.rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN public.product_reviews.verified_purchase IS 'True if user purchased this product';
COMMENT ON COLUMN public.product_reviews.helpful_count IS 'Number of users who found this review helpful';
COMMENT ON COLUMN public.product_reviews.is_approved IS 'Admin approval status for moderation';

-- Create wishlist items table
CREATE TABLE public.wishlist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

COMMENT ON TABLE public.wishlist_items IS 'User wishlist for saving favorite products';

-- Create review helpful votes table
CREATE TABLE public.review_helpful_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.product_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(review_id, user_id)
);

COMMENT ON TABLE public.review_helpful_votes IS 'Track which users found reviews helpful';

-- Enable Row Level Security
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_helpful_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_reviews
CREATE POLICY "Reviews are viewable by everyone"
ON public.product_reviews
FOR SELECT
USING (is_approved = true);

CREATE POLICY "Users can create reviews for products they purchased"
ON public.product_reviews
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.orders o ON oi.order_id = o.id
    WHERE o.user_id = auth.uid() 
    AND oi.product_id = product_reviews.product_id
    AND o.status IN ('delivered', 'completed')
  )
);

CREATE POLICY "Users can update their own reviews"
ON public.product_reviews
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
ON public.product_reviews
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviews"
ON public.product_reviews
FOR ALL
USING (is_admin(auth.uid()));

-- RLS Policies for wishlist_items
CREATE POLICY "Users can view their own wishlist"
ON public.wishlist_items
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own wishlist"
ON public.wishlist_items
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for review_helpful_votes
CREATE POLICY "Users can view helpful votes"
ON public.review_helpful_votes
FOR SELECT
USING (true);

CREATE POLICY "Users can vote reviews as helpful"
ON public.review_helpful_votes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their helpful votes"
ON public.review_helpful_votes
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update review helpful count
CREATE OR REPLACE FUNCTION public.update_review_helpful_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.product_reviews
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.product_reviews
    SET helpful_count = helpful_count - 1
    WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for helpful count updates
CREATE TRIGGER update_review_helpful_count_trigger
AFTER INSERT OR DELETE ON public.review_helpful_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_review_helpful_count();

-- Create trigger for review updated_at
CREATE TRIGGER update_product_reviews_updated_at
BEFORE UPDATE ON public.product_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();