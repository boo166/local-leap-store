import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ShoppingCart,
  CreditCard,
  Store,
  Users,
  MessageSquare,
  Package,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'order' | 'payment' | 'store' | 'user' | 'review' | 'product';
  message: string;
  timestamp: string;
  metadata?: any;
}

const AdminActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    setLoading(true);
    try {
      // Fetch recent orders
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('id, created_at, total_amount, status, profiles!orders_user_id_fkey(full_name)')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent payments
      const { data: recentPayments } = await supabase
        .from('payment_submissions')
        .select('id, created_at, amount, status, profiles!payment_submissions_user_id_fkey(full_name)')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent stores
      const { data: recentStores } = await supabase
        .from('stores')
        .select('id, created_at, name, profiles!stores_user_id_fkey(full_name)')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent users
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('id, created_at, full_name, email')
        .order('created_at', { ascending: false })
        .limit(5);

      // Combine and sort activities
      const allActivities: Activity[] = [];

      recentOrders?.forEach(order => {
        allActivities.push({
          id: `order-${order.id}`,
          type: 'order',
          message: `New order from ${order.profiles?.full_name || 'Unknown'} - $${order.total_amount}`,
          timestamp: order.created_at,
          metadata: { status: order.status },
        });
      });

      recentPayments?.forEach(payment => {
        allActivities.push({
          id: `payment-${payment.id}`,
          type: 'payment',
          message: `Payment submission from ${payment.profiles?.full_name || 'Unknown'} - $${payment.amount}`,
          timestamp: payment.created_at,
          metadata: { status: payment.status },
        });
      });

      recentStores?.forEach(store => {
        allActivities.push({
          id: `store-${store.id}`,
          type: 'store',
          message: `New store created: ${store.name} by ${store.profiles?.full_name || 'Unknown'}`,
          timestamp: store.created_at,
        });
      });

      recentUsers?.forEach(user => {
        allActivities.push({
          id: `user-${user.id}`,
          type: 'user',
          message: `New user registered: ${user.full_name || user.email || 'Unknown'}`,
          timestamp: user.created_at,
        });
      });

      // Sort by timestamp
      allActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(allActivities.slice(0, 15));
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'order': return ShoppingCart;
      case 'payment': return CreditCard;
      case 'store': return Store;
      case 'user': return Users;
      case 'review': return MessageSquare;
      case 'product': return Package;
    }
  };

  const getColor = (type: Activity['type']) => {
    switch (type) {
      case 'order': return 'text-blue-500 bg-blue-500/10';
      case 'payment': return 'text-amber-500 bg-amber-500/10';
      case 'store': return 'text-green-500 bg-green-500/10';
      case 'user': return 'text-purple-500 bg-purple-500/10';
      case 'review': return 'text-pink-500 bg-pink-500/10';
      case 'product': return 'text-indigo-500 bg-indigo-500/10';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="text-xs">Pending</Badge>;
      case 'approved':
      case 'completed':
      case 'delivered':
        return <Badge variant="default" className="text-xs">Completed</Badge>;
      case 'rejected':
      case 'cancelled':
        return <Badge variant="destructive" className="text-xs">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = getIcon(activity.type);
              const colorClass = getColor(activity.type);
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${colorClass.split(' ')[1]}`}>
                    <Icon className={`h-4 w-4 ${colorClass.split(' ')[0]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{activity.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                      {activity.metadata?.status && getStatusBadge(activity.metadata.status)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AdminActivityFeed;
