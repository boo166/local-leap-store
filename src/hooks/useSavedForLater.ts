import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface SavedItem {
  id: string;
  quantity: number;
  product_id: string;
  products: {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    inventory_count: number;
  };
}

export const useSavedForLater = () => {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchSavedItems = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_for_later')
        .select(`
          *,
          products(
            id,
            name,
            description,
            price,
            image_url,
            inventory_count
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading saved items",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const saveForLater = async (productId: string, quantity: number = 1) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_for_later')
        .insert({
          user_id: user.id,
          product_id: productId,
          quantity: quantity
        });

      if (error) throw error;

      await fetchSavedItems();
      
      toast({
        title: "Saved for later",
        description: "Item has been saved for later",
      });
    } catch (error: any) {
      toast({
        title: "Error saving item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const moveToCart = async (savedItemId: string) => {
    if (!user) return;

    try {
      // Get the saved item details
      const savedItem = savedItems.find(item => item.id === savedItemId);
      if (!savedItem) return;

      // Add to cart
      const { error: cartError } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: savedItem.product_id,
          quantity: savedItem.quantity
        });

      if (cartError) throw cartError;

      // Remove from saved for later
      const { error: deleteError } = await supabase
        .from('saved_for_later')
        .delete()
        .eq('id', savedItemId);

      if (deleteError) throw deleteError;

      await fetchSavedItems();
      
      toast({
        title: "Moved to cart",
        description: "Item has been moved to your cart",
      });
    } catch (error: any) {
      toast({
        title: "Error moving item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeSavedItem = async (savedItemId: string) => {
    try {
      const { error } = await supabase
        .from('saved_for_later')
        .delete()
        .eq('id', savedItemId)
        .eq('user_id', user?.id);

      if (error) throw error;

      await fetchSavedItems();
      
      toast({
        title: "Item removed",
        description: "Item has been removed from saved items",
      });
    } catch (error: any) {
      toast({
        title: "Error removing item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSavedItems();
  }, [fetchSavedItems]);

  return {
    savedItems,
    loading,
    saveForLater,
    moveToCart,
    removeSavedItem,
    refetch: fetchSavedItems,
  };
};
