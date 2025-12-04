import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, ShoppingBag, Star, Clock, 
  ArrowRight, TrendingUp, AlertTriangle 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RecentActivity {
  type: 'order' | 'review' | 'low_stock';
  id: string;
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface RecentActivityFeedProps {
  storeIds: string[];
}

const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ storeIds }) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (storeIds.length > 0) {
      fetchActivities();
    } else {
      setLoading(false);
    }
  }, [storeIds]);

  const fetchActivities = async () => {
    try {
      const activities: RecentActivity[] = [];

      // Fetch recent orders
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          id, status, total_amount, created_at,
          order_items!inner(products!inner(store_id)),
          profiles(full_name, email)
        `)
        .in('order_items.products.store_id', storeIds)
        .order('created_at', { ascending: false })
        .limit(5);

      if (orders) {
        orders.forEach(order => {
          activities.push({
            type: 'order',
            id: order.id,
            title: `New order #${order.id.slice(0, 8)}`,
            description: `$${order.total_amount} from ${order.profiles?.full_name || order.profiles?.email || 'Customer'}`,
            timestamp: order.created_at,
            metadata: { status: order.status }
          });
        });
      }

      // Fetch recent store reviews
      const { data: reviews } = await supabase
        .from('store_reviews')
        .select(`
          id, rating, review_text, created_at,
          profiles(full_name)
        `)
        .in('store_id', storeIds)
        .order('created_at', { ascending: false })
        .limit(3);

      if (reviews) {
        reviews.forEach(review => {
          activities.push({
            type: 'review',
            id: review.id,
            title: `New ${review.rating}-star review`,
            description: review.review_text?.slice(0, 50) + (review.review_text && review.review_text.length > 50 ? '...' : '') || 'No comment',
            timestamp: review.created_at,
            metadata: { rating: review.rating }
          });
        });
      }

      // Fetch low stock products
      const { data: lowStock } = await supabase
        .from('products')
        .select('id, name, inventory_count, low_stock_threshold')
        .in('store_id', storeIds)
        .eq('is_active', true)
        .lt('inventory_count', 10)
        .order('inventory_count', { ascending: true })
        .limit(3);

      if (lowStock) {
        lowStock.forEach(product => {
          activities.push({
            type: 'low_stock',
            id: product.id,
            title: `Low stock alert`,
            description: `${product.name} - only ${product.inventory_count} left`,
            timestamp: new Date().toISOString(),
            metadata: { inventory: product.inventory_count }
          });
        });
      }

      // Sort by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(activities.slice(0, 8));
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingBag className="h-4 w-4 text-blue-500" />;
      case 'review': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'low_stock': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
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
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <CardDescription>Latest updates from your stores</CardDescription>
        </div>
        <Link to="/seller/orders">
          <Button variant="ghost" size="sm">
            View all <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-6">
            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={`${activity.type}-${activity.id}`}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="p-2 bg-muted rounded-full">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatTime(activity.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivityFeed;
