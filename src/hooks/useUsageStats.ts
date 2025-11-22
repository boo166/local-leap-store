import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UsageStats {
  total_products: number;
  active_products: number;
  total_orders: number;
  total_revenue: number;
  product_limit: number;
  usage_percentage: number;
}

export const useUsageStats = () => {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUsageStats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('get_user_usage_stats', { user_id_param: user.id })
        .single();

      if (error) throw error;
      setStats(data);
    } catch (error: any) {
      console.error('Error fetching usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageStats();

    // Subscribe to changes in products to update usage
    const channel = supabase
      .channel('usage_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          fetchUsageStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    stats,
    loading,
    refetch: fetchUsageStats,
  };
};
