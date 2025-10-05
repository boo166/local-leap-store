import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'admin' | 'seller' | 'buyer';

export const useUserRole = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) throw error;

        const userRoles = data?.map(r => r.role as UserRole) || [];
        setRoles(userRoles);
        setIsAdmin(userRoles.includes('admin'));
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRoles([]);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();

    // Subscribe to role changes
    const channel = supabase
      .channel('user_roles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchRoles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const hasRole = (role: UserRole) => roles.includes(role);

  return {
    roles,
    isAdmin,
    loading,
    hasRole,
  };
};
