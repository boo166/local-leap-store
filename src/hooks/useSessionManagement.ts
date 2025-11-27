import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserSession {
  id: string;
  session_token: string;
  device_info: {
    browser?: string;
    os?: string;
    device?: string;
  };
  ip_address: string | null;
  user_agent: string | null;
  is_active: boolean;
  last_activity_at: string;
  expires_at: string | null;
  created_at: string;
}

export const useSessionManagement = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('last_activity_at', { ascending: false });

      if (error) throw error;
      setSessions((data || []) as UserSession[]);
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: 'Session revoked',
        description: 'The session has been successfully terminated.',
      });

      await fetchSessions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to revoke session.',
        variant: 'destructive',
      });
    }
  };

  const revokeAllOtherSessions = async () => {
    if (!user || !session) return;

    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .neq('session_token', session.access_token);

      if (error) throw error;

      toast({
        title: 'Sessions revoked',
        description: 'All other sessions have been terminated.',
      });

      await fetchSessions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to revoke sessions.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  return {
    sessions,
    loading,
    fetchSessions,
    revokeSession,
    revokeAllOtherSessions,
  };
};
