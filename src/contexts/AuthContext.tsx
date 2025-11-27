import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string, role?: 'seller' | 'buyer') => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Defer activity logging to prevent deadlock
        if (session?.user && event === 'SIGNED_IN') {
          setTimeout(async () => {
            await supabase.rpc('log_user_activity', {
              p_user_id: session.user.id,
              p_activity_type: 'Login',
              p_activity_category: 'auth',
              p_description: 'User signed in',
              p_metadata: { method: 'email', event },
              p_ip_address: null,
              p_user_agent: navigator.userAgent
            });
          }, 0);
        }
        
        if (event === 'SIGNED_OUT') {
          setTimeout(() => {
            console.log('User signed out');
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string, role: 'seller' | 'buyer' = 'buyer') => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    // If signup successful and we have a user, assign the role
    if (data.user && !error) {
      // The role will be assigned via the handle_new_user_role trigger
      // But we can also manually set it to ensure the selected role is used
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: role })
        .eq('user_id', data.user.id);
      
      if (roleError) {
        console.error('Error updating user role:', roleError);
      }
      
      // Log signup activity
      const { error: logError } = await supabase.rpc('log_user_activity', {
        p_user_id: data.user.id,
        p_activity_type: 'Account Created',
        p_activity_category: 'auth',
        p_description: 'New user account created',
        p_metadata: { email, role },
        p_ip_address: null,
        p_user_agent: navigator.userAgent
      });
      
      if (logError) {
        console.error('Error logging activity:', logError);
      }
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    return { error };
  };

  const resendVerificationEmail = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    // Log signout before actually signing out
    if (user) {
      const { error: logError } = await supabase.rpc('log_user_activity', {
        p_user_id: user.id,
        p_activity_type: 'Logout',
        p_activity_category: 'auth',
        p_description: 'User signed out',
        p_metadata: {},
        p_ip_address: null,
        p_user_agent: navigator.userAgent
      });
      
      if (logError) {
        console.error('Error logging activity:', logError);
      }
    }
    
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};