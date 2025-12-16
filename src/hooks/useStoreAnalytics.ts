import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  const fetchAnalytics = async () => {
    if (!storeId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_store_analytics_summary', {
          p_store_id: storeId,
          p_days: days
        })
        .maybeSingle();

      if (error) throw error;
      
      // Return default values if no analytics data exists yet
      if (!data) {
        setAnalytics({
          total_views: 0,
          total_unique_visitors: 0,
          total_orders: 0,
          total_revenue: 0,
          avg_conversion_rate: 0,
          daily_data: []
        });
      } else {
        setAnalytics(data as StoreAnalyticsSummary);
      }
    } catch (error: any) {
      console.error('Error fetching store analytics:', error);
      // Don't show error toast for empty analytics - this is expected for new stores
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
