import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StoreAnalyticsSummary {
  total_views: number;
  total_unique_visitors: number;
  total_orders: number;
  total_revenue: number;
  avg_conversion_rate: number;
  daily_data: Array<{
    date: string;
    views: number;
    unique_visitors: number;
    orders: number;
    revenue: number;
    conversion_rate: number;
  }>;
}

export const useStoreAnalytics = (storeId: string | undefined, days: number = 30) => {
  const [analytics, setAnalytics] = useState<StoreAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    if (!storeId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_store_analytics_summary', {
          p_store_id: storeId,
          p_days: days
        })
        .single();

      if (error) throw error;
      setAnalytics(data as StoreAnalyticsSummary);
    } catch (error: any) {
      console.error('Error fetching store analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const trackView = async (visitorData: Record<string, any> = {}) => {
    if (!storeId) return;

    try {
      await supabase.rpc('track_store_view', {
        p_store_id: storeId,
        p_visitor_data: visitorData
      });
    } catch (error: any) {
      console.error('Error tracking store view:', error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [storeId, days]);

  return {
    analytics,
    loading,
    refetch: fetchAnalytics,
    trackView,
  };
};
