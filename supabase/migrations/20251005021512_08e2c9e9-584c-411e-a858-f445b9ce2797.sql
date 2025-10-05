-- Drop all policies that depend on is_admin function
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage site content" ON public.site_content;

-- Drop functions
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
DROP FUNCTION IF EXISTS public.is_admin(uuid);

-- Create new enum with all needed values
CREATE TYPE public.app_role_new AS ENUM ('admin', 'seller', 'buyer');

-- Update user_roles table to use new enum
ALTER TABLE public.user_roles 
  ALTER COLUMN role TYPE public.app_role_new 
  USING (
    CASE role::text
      WHEN 'customer' THEN 'buyer'::public.app_role_new
      ELSE role::text::public.app_role_new
    END
  );

-- Drop old enum and rename new one
DROP TYPE public.app_role;
ALTER TYPE public.app_role_new RENAME TO app_role;

-- Recreate the functions with new enum
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- Recreate the policies with correct syntax
CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage site content"
ON public.site_content FOR ALL
USING (public.is_admin(auth.uid()));

-- Create subscription_plans table
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  name_ar text,
  price_monthly numeric NOT NULL DEFAULT 0,
  price_yearly numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EGP',
  max_products integer,
  has_analytics boolean NOT NULL DEFAULT false,
  has_support boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  features jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert default plans
INSERT INTO public.subscription_plans (name, name_ar, price_monthly, price_yearly, max_products, has_analytics, has_support, features)
VALUES 
  ('Free Trial', 'تجربة مجانية', 0, 0, NULL, true, true, '["Unlimited products", "Full analytics", "Priority support", "7 days duration"]'::jsonb),
  ('Basic', 'أساسي', 100, 1000, 10, false, false, '["Up to 10 products", "Basic analytics", "Email support"]'::jsonb),
  ('Pro', 'احترافي', 300, 3000, NULL, true, true, '["Unlimited products", "Full analytics", "Priority support", "Advanced features"]'::jsonb);

-- Create user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  status text NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'expired', 'cancelled')),
  billing_cycle text NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  trial_start_date timestamp with time zone,
  trial_end_date timestamp with time zone,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create payment_submissions table
CREATE TABLE public.payment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid NOT NULL REFERENCES public.user_subscriptions(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  amount numeric NOT NULL,
  billing_cycle text NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  transaction_id text NOT NULL,
  screenshot_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans
CREATE POLICY "Plans are viewable by everyone"
ON public.subscription_plans FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage plans"
ON public.subscription_plans FOR ALL
USING (public.is_admin(auth.uid()));

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscription"
ON public.user_subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
ON public.user_subscriptions FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all subscriptions"
ON public.user_subscriptions FOR ALL
USING (public.is_admin(auth.uid()));

-- RLS Policies for payment_submissions
CREATE POLICY "Users can view their own payments"
ON public.payment_submissions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments"
ON public.payment_submissions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments"
ON public.payment_submissions FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all payments"
ON public.payment_submissions FOR ALL
USING (public.is_admin(auth.uid()));

-- Security definer functions
CREATE OR REPLACE FUNCTION public.get_user_subscription_status(user_id_param uuid)
RETURNS TABLE (
  has_active_subscription boolean,
  is_trial boolean,
  is_expired boolean,
  days_remaining integer,
  plan_name text,
  max_products integer,
  has_analytics boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN us.status IN ('trial', 'active') AND us.current_period_end > now() THEN true
      ELSE false
    END as has_active_subscription,
    us.status = 'trial' as is_trial,
    us.current_period_end < now() as is_expired,
    GREATEST(0, EXTRACT(day FROM us.current_period_end - now())::integer) as days_remaining,
    sp.name as plan_name,
    sp.max_products,
    sp.has_analytics
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_id_param;
$$;

CREATE OR REPLACE FUNCTION public.can_add_product(user_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(
      (SELECT 
        CASE 
          WHEN us.status IN ('trial', 'active') AND us.current_period_end > now() THEN
            CASE 
              WHEN sp.max_products IS NULL THEN true
              ELSE (
                SELECT COUNT(*) FROM public.products p 
                JOIN public.stores s ON p.store_id = s.id
                WHERE s.user_id = user_id_param
              ) < sp.max_products
            END
          ELSE false
        END
      FROM public.user_subscriptions us
      JOIN public.subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = user_id_param),
      false
    )
$$;

-- Triggers for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_submissions_updated_at
BEFORE UPDATE ON public.payment_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update handle_new_user_role to default to 'buyer'
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'buyer');
  RETURN NEW;
END;
$$;