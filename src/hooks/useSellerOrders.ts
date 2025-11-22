import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface OrderItem {
  id: string;
  quantity: number;
  price_at_time: number;
  product_id: string;
  products: {
    id: string;
    name: string;
    image_url: string;
  };
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  shipping_address: string;
  tracking_number: string | null;
  seller_notes: string | null;
  refund_status: string;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  created_at: string;
  order_items: OrderItem[];
  profiles?: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export const useSellerOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSellerOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // First get the seller's stores
      const { data: stores, error: storesError } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', user.id);

      if (storesError) throw storesError;

      if (!stores || stores.length === 0) {
        setOrders([]);
        return;
      }

      const storeIds = stores.map(s => s.id);

      // Get products from these stores
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id')
        .in('store_id', storeIds);

      if (productsError) throw productsError;

      if (!products || products.length === 0) {
        setOrders([]);
        return;
      }

      const productIds = products.map(p => p.id);

      // Get order items with these products
      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .select('order_id')
        .in('product_id', productIds);

      if (orderItemsError) throw orderItemsError;

      if (!orderItems || orderItems.length === 0) {
        setOrders([]);
        return;
      }

      const orderIds = [...new Set(orderItems.map(oi => oi.order_id))];

      // Finally, get the full orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            quantity,
            price_at_time,
            product_id,
            products(
              id,
              name,
              image_url
            )
          )
        `)
        .in('id', orderIds)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch profiles separately for each order
      const ordersWithProfiles = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', order.user_id)
            .single();
          
          return {
            ...order,
            profiles: profile
          };
        })
      );

      setOrders(ordersWithProfiles);
    } catch (error: any) {
      toast({
        title: 'Error fetching orders',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });

      fetchSellerOrders();
    } catch (error: any) {
      toast({
        title: 'Error updating order',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const updateTrackingInfo = async (
    orderId: string, 
    trackingNumber: string, 
    sellerNotes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          tracking_number: trackingNumber,
          seller_notes: sellerNotes || null
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Tracking information updated successfully',
      });

      fetchSellerOrders();
    } catch (error: any) {
      toast({
        title: 'Error updating tracking',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchSellerOrders();
  }, [user]);

  return {
    orders,
    loading,
    updateOrderStatus,
    updateTrackingInfo,
    refetch: fetchSellerOrders,
  };
};
