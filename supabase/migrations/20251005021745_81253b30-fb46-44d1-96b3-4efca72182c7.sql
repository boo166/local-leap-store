-- Step 2: Auto-create trial subscription for sellers
-- Function to create trial subscription for sellers
CREATE OR REPLACE FUNCTION public.create_seller_trial_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  trial_plan_id uuid;
BEGIN
  -- Check if the new role is 'seller'
  IF NEW.role = 'seller' THEN
    -- Get the Free Trial plan ID
    SELECT id INTO trial_plan_id
    FROM public.subscription_plans
    WHERE name = 'Free Trial'
    LIMIT 1;
    
    -- Only create subscription if plan exists and user doesn't have one
    IF trial_plan_id IS NOT NULL THEN
      INSERT INTO public.user_subscriptions (
        user_id,
        plan_id,
        status,
        billing_cycle,
        trial_start_date,
        trial_end_date,
        current_period_start,
        current_period_end
      )
      VALUES (
        NEW.user_id,
        trial_plan_id,
        'trial',
        'monthly',
        now(),
        now() + interval '7 days',
        now(),
        now() + interval '7 days'
      )
      ON CONFLICT (user_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-assign trial when seller role is added
CREATE TRIGGER on_seller_role_created
  AFTER INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_seller_trial_subscription();