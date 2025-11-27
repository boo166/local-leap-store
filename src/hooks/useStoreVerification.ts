import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StoreVerification {
  id: string;
  store_id: string;
  status: 'pending' | 'approved' | 'rejected';
  verification_type: 'basic' | 'premium' | 'enterprise';
  business_documents: string[];
  admin_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useStoreVerification = (storeId: string | undefined) => {
  const { toast } = useToast();
  const [verification, setVerification] = useState<StoreVerification | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVerification = async () => {
    if (!storeId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('store_verifications')
        .select('*')
        .eq('store_id', storeId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setVerification(data as StoreVerification);
    } catch (error: any) {
      console.error('Error fetching verification:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitVerification = async (
    verificationType: 'basic' | 'premium' | 'enterprise',
    documents: string[] = []
  ) => {
    if (!storeId) return false;

    try {
      const { error } = await supabase
        .from('store_verifications')
        .insert({
          store_id: storeId,
          verification_type: verificationType,
          business_documents: documents,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: 'Verification submitted',
        description: 'Your verification request has been submitted for review.',
      });

      await fetchVerification();
      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit verification request.',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchVerification();
  }, [storeId]);

  return {
    verification,
    loading,
    submitVerification,
    refetch: fetchVerification,
  };
};
