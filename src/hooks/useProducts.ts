import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  inventory_count: number;
  is_active: boolean;
  store_id: string;
  stores?: {
    id: string;
    name: string;
    profiles?: {
      full_name: string;
    };
  };
}

export const useProducts = (storeId?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('products')
        .select(`
          *,
          stores!products_store_id_fkey(
            id,
            name,
            profiles!stores_user_id_fkey(full_name)
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (storeId) {
        query = query.eq('store_id', storeId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setProducts(data || []);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load products';
      setError(errorMessage);
      toast({
        title: "Error loading products",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [storeId, toast]);

  const getProduct = useCallback(async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          stores!products_store_id_fkey(
            id,
            name,
            description,
            location,
            profiles!stores_user_id_fkey(full_name)
          )
        `)
        .eq('id', productId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      toast({
        title: "Error loading product",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const searchProducts = useCallback(async (query: string, category?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      let searchQuery = supabase
        .from('products')
        .select(`
          *,
          stores!products_store_id_fkey(
            id,
            name,
            profiles!stores_user_id_fkey(full_name)
          )
        `)
        .eq('is_active', true);

      if (query) {
        searchQuery = searchQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
      }

      if (category && category !== 'all') {
        searchQuery = searchQuery.eq('category', category);
      }

      const { data, error } = await searchQuery.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProducts(data || []);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to search products';
      setError(errorMessage);
      toast({
        title: "Error searching products",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    getProduct,
    searchProducts,
    refetch: fetchProducts,
  };
};