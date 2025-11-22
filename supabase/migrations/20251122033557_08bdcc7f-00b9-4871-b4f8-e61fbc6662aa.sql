-- Add 2FA tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS mfa_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_completed_at timestamp with time zone;

-- Create function to check profile completion
CREATE OR REPLACE FUNCTION public.calculate_profile_completion(user_id_param uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN p.full_name IS NOT NULL AND p.avatar_url IS NOT NULL AND p.bio IS NOT NULL 
      THEN 100
      WHEN p.full_name IS NOT NULL AND (p.avatar_url IS NOT NULL OR p.bio IS NOT NULL)
      THEN 66
      WHEN p.full_name IS NOT NULL OR p.avatar_url IS NOT NULL OR p.bio IS NOT NULL
      THEN 33
      ELSE 0
    END as completion_percentage
  FROM public.profiles p
  WHERE p.user_id = user_id_param;
$$;

-- Create edge function helper for account deletion
CREATE OR REPLACE FUNCTION public.prepare_account_deletion(user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete user's stores and related data
  DELETE FROM public.products WHERE store_id IN (
    SELECT id FROM public.stores WHERE user_id = user_id_param
  );
  
  DELETE FROM public.stores WHERE user_id = user_id_param;
  
  -- Delete user's orders and related data
  DELETE FROM public.order_items WHERE order_id IN (
    SELECT id FROM public.orders WHERE user_id = user_id_param
  );
  
  DELETE FROM public.orders WHERE user_id = user_id_param;
  
  -- Delete user's cart
  DELETE FROM public.cart_items WHERE user_id = user_id_param;
  
  -- Delete user's wishlist
  DELETE FROM public.wishlist_items WHERE user_id = user_id_param;
  
  -- Delete user's reviews
  DELETE FROM public.product_reviews WHERE user_id = user_id_param;
  
  -- Delete user's subscriptions
  DELETE FROM public.user_subscriptions WHERE user_id = user_id_param;
  
  -- Delete user's roles
  DELETE FROM public.user_roles WHERE user_id = user_id_param;
  
  -- Delete user profile (cascade will handle the rest)
  DELETE FROM public.profiles WHERE user_id = user_id_param;
  
  RETURN true;
END;
$$;