import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ActivityLog {
  id: string;
  activity_type: string;
  activity_category: string;
  description: string;
  metadata: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export const useActivityLog = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivityLogs = async (limit: number = 50) => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setLogs((data || []) as ActivityLog[]);
    } catch (error: any) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (
    activityType: string,
    activityCategory: string,
    description: string,
    metadata: Record<string, any> = {}
  ) => {
    if (!user) return;

    try {
      await supabase.rpc('log_user_activity', {
        p_user_id: user.id,
        p_activity_type: activityType,
        p_activity_category: activityCategory,
        p_description: description,
        p_metadata: metadata,
        p_ip_address: null,
        p_user_agent: navigator.userAgent
      });
    } catch (error: any) {
      console.error('Error logging activity:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchActivityLogs();
    }
  }, [user]);

  return {
    logs,
    loading,
    fetchActivityLogs,
    logActivity,
  };
};
