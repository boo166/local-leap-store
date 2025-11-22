import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    id: string;
    name: string;
    revenue: number;
    orders: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  recentOrders: Array<{
    id: string;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
}

export const useSellerAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    averageOrderValue: 0,
    topProducts: [],
    revenueByMonth: [],
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Get seller's stores
      const { data: stores } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', user?.id);

      if (!stores || stores.length === 0) {
        setLoading(false);
        return;
      }

      const storeIds = stores.map(s => s.id);

      // Get products
      const { data: products } = await supabase
        .from('products')
        .select('id, name')
        .in('store_id', storeIds);

      if (!products || products.length === 0) {
        setLoading(false);
        return;
      }

      const productIds = products.map(p => p.id);

      // Get order items
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('order_id, product_id, quantity, price_at_time')
        .in('product_id', productIds);

      if (!orderItems || orderItems.length === 0) {
        setLoading(false);
        return;
      }

      const orderIds = [...new Set(orderItems.map(oi => oi.order_id))];

      // Get orders
      const { data: orders } = await supabase
        .from('orders')
        .select('id, total_amount, status, created_at')
        .in('id', orderIds)
        .order('created_at', { ascending: false });

      if (!orders) {
        setLoading(false);
        return;
      }

      // Calculate analytics
      const totalRevenue = orders
        .filter(o => ['completed', 'delivered', 'shipped'].includes(o.status))
        .reduce((sum, o) => sum + Number(o.total_amount), 0);

      const totalOrders = orders.length;
      const completedOrders = orders.filter(o => 
        ['completed', 'delivered'].includes(o.status)
      ).length;
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Top products
      const productSales = new Map<string, { revenue: number; orders: number }>();
      orderItems.forEach(item => {
        const current = productSales.get(item.product_id) || { revenue: 0, orders: 0 };
        productSales.set(item.product_id, {
          revenue: current.revenue + (Number(item.price_at_time) * item.quantity),
          orders: current.orders + 1,
        });
      });

      const topProducts = Array.from(productSales.entries())
        .map(([productId, data]) => ({
          id: productId,
          name: products.find(p => p.id === productId)?.name || 'Unknown',
          revenue: data.revenue,
          orders: data.orders,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Revenue by month (last 6 months)
      const monthlyData = new Map<string, { revenue: number; orders: number }>();
      orders.forEach(order => {
        const date = new Date(order.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const current = monthlyData.get(monthKey) || { revenue: 0, orders: 0 };
        
        if (['completed', 'delivered', 'shipped'].includes(order.status)) {
          monthlyData.set(monthKey, {
            revenue: current.revenue + Number(order.total_amount),
            orders: current.orders + 1,
          });
        }
      });

      const revenueByMonth = Array.from(monthlyData.entries())
        .map(([month, data]) => ({
          month,
          revenue: data.revenue,
          orders: data.orders,
        }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6);

      const recentOrders = orders.slice(0, 10);

      setAnalytics({
        totalRevenue,
        totalOrders,
        completedOrders,
        pendingOrders,
        averageOrderValue,
        topProducts,
        revenueByMonth,
        recentOrders,
      });
    } catch (error: any) {
      toast({
        title: 'Error fetching analytics',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return { analytics, loading, refetch: fetchAnalytics };
};
