import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  isTrial: boolean;
  isExpired: boolean;
  daysRemaining: number;
  planName: string | null;
  maxProducts: number | null;
  hasAnalytics: boolean;
  loading: boolean;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    hasActiveSubscription: false,
    isTrial: false,
    isExpired: false,
    daysRemaining: 0,
    planName: null,
    maxProducts: null,
    hasAnalytics: false,
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setStatus({
        hasActiveSubscription: false,
        isTrial: false,
        isExpired: false,
        daysRemaining: 0,
        planName: null,
        maxProducts: null,
        hasAnalytics: false,
        loading: false,
      });
      return;
    }

    const fetchSubscriptionStatus = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_user_subscription_status', { user_id_param: user.id })
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setStatus({
            hasActiveSubscription: data.has_active_subscription,
            isTrial: data.is_trial,
            isExpired: data.is_expired,
            daysRemaining: data.days_remaining,
            planName: data.plan_name,
            maxProducts: data.max_products,
            hasAnalytics: data.has_analytics,
            loading: false,
          });
        } else {
          // No subscription found - set defaults
          setStatus({
            hasActiveSubscription: false,
            isTrial: false,
            isExpired: false,
            daysRemaining: 0,
            planName: null,
            maxProducts: null,
            hasAnalytics: false,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Error fetching subscription status:', error);
        setStatus(prev => ({ ...prev, loading: false }));
      }
    };

    fetchSubscriptionStatus();

    // Subscribe to subscription changes
    const channel = supabase
      .channel('subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_subscriptions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchSubscriptionStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const canAddProduct = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .rpc('can_add_product', { user_id_param: user.id })
        .single();

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking product limit:', error);
      return false;
    }
  };

  return {
    ...status,
    canAddProduct,
  };
};
