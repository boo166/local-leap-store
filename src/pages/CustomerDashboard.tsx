import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, ShoppingBag, Heart, Clock, ArrowRight, 
  TrendingUp, RefreshCw, Eye, Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import SEOHead from '@/components/SEOHead';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/useCart';

interface OrderSummary {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
}

interface RecentOrder {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_items: {
    products: {
      name: string;
      image_url: string;
    };
  }[];
}

interface WishlistItem {
  id: string;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string;
  };
}

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    total: 0, pending: 0, processing: 0, completed: 0, cancelled: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id, status, total_amount, created_at,
          order_items(products(name, image_url))
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Calculate order summary
      const summary = {
        total: orders?.length || 0,
        pending: orders?.filter(o => o.status === 'pending').length || 0,
        processing: orders?.filter(o => o.status === 'processing').length || 0,
        completed: orders?.filter(o => o.status === 'completed' || o.status === 'delivered').length || 0,
        cancelled: orders?.filter(o => o.status === 'cancelled').length || 0,
      };
      setOrderSummary(summary);
      setRecentOrders((orders || []).slice(0, 3) as RecentOrder[]);
      
      // Calculate total spent
      const spent = orders?.reduce((acc, o) => 
        o.status !== 'cancelled' ? acc + Number(o.total_amount) : acc, 0
      ) || 0;
      setTotalSpent(spent);

      // Fetch wishlist
      const { data: wishlist, error: wishlistError } = await supabase
        .from('wishlist_items')
        .select(`
          id,
          products(id, name, price, image_url)
        `)
        .eq('user_id', user?.id)
        .limit(4);

      if (wishlistError) throw wishlistError;
      setWishlistItems((wishlist || []) as WishlistItem[]);

    } catch (error: any) {
      toast({
        title: "Error loading dashboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAddToCart = async (productId: string) => {
    await addToCart(productId, 1);
    toast({
      title: "Added to cart",
      description: "Item has been added to your cart",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'bg-green-500';
      case 'processing':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <SEOHead title="My Dashboard - GlassStore" description="View your shopping dashboard" />
          <Navigation />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="glass rounded-xl p-8">
              <div className="animate-pulse text-center space-y-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full mx-auto animate-bounce"></div>
                <p className="text-muted-foreground">Loading dashboard...</p>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <SEOHead 
          title="My Dashboard - GlassStore" 
          description="View your orders, wishlist, and shopping activity"
        />
        <Navigation />
        
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back! 👋
              </h1>
              <p className="text-muted-foreground">
                Here's what's happening with your orders and wishlist.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{orderSummary.total}</p>
                      <p className="text-xs text-muted-foreground">Total Orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                      <Clock className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{orderSummary.pending + orderSummary.processing}</p>
                      <p className="text-xs text-muted-foreground">In Progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{formatPrice(totalSpent)}</p>
                      <p className="text-xs text-muted-foreground">Total Spent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-500/10 rounded-lg">
                      <Heart className="h-5 w-5 text-pink-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{wishlistItems.length}</p>
                      <p className="text-xs text-muted-foreground">Wishlist Items</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Link to="/marketplace">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  <span>Browse Stores</span>
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <Eye className="h-5 w-5" />
                  <span>View Products</span>
                </Button>
              </Link>
              <Link to="/orders">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <Package className="h-5 w-5" />
                  <span>Track Orders</span>
                </Button>
              </Link>
              <Link to="/wishlist">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <Heart className="h-5 w-5" />
                  <span>My Wishlist</span>
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Recent Orders</CardTitle>
                    <CardDescription>Your latest purchases</CardDescription>
                  </div>
                  <Link to="/orders">
                    <Button variant="ghost" size="sm">
                      View All <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {recentOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">No orders yet</p>
                      <Link to="/marketplace">
                        <Button variant="apple" size="sm">Start Shopping</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <img
                            src={order.order_items[0]?.products?.image_url || '/placeholder.svg'}
                            alt="Order"
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              Order #{order.id.slice(0, 8).toUpperCase()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                            <p className="text-sm font-medium mt-1">
                              {formatPrice(order.total_amount)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Wishlist Preview */}
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Wishlist</CardTitle>
                    <CardDescription>Items you've saved</CardDescription>
                  </div>
                  <Link to="/wishlist">
                    <Button variant="ghost" size="sm">
                      View All <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {wishlistItems.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">Your wishlist is empty</p>
                      <Link to="/products">
                        <Button variant="apple" size="sm">Explore Products</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {wishlistItems.map((item) => (
                        <div key={item.id} className="group relative rounded-lg overflow-hidden bg-muted/30">
                          <img
                            src={item.products?.image_url || '/placeholder.svg'}
                            alt={item.products?.name}
                            className="w-full h-24 object-cover"
                          />
                          <div className="p-2">
                            <p className="text-sm font-medium truncate">{item.products?.name}</p>
                            <p className="text-sm text-primary font-bold">
                              {formatPrice(item.products?.price || 0)}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="apple"
                            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 text-xs"
                            onClick={() => handleQuickAddToCart(item.products?.id)}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Status Summary */}
            {orderSummary.total > 0 && (
              <Card className="glass-card mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Order Status Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div>
                        <p className="text-sm text-muted-foreground">Pending</p>
                        <p className="font-bold">{orderSummary.pending}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <div>
                        <p className="text-sm text-muted-foreground">Processing</p>
                        <p className="font-bold">{orderSummary.processing}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <div>
                        <p className="text-sm text-muted-foreground">Completed</p>
                        <p className="font-bold">{orderSummary.completed}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cancelled</p>
                        <p className="font-bold">{orderSummary.cancelled}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default CustomerDashboard;
