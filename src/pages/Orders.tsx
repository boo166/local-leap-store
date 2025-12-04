import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, ShoppingBag, ArrowLeft, XCircle, AlertCircle, Download, LayoutDashboard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import CancellationDialog from '@/components/CancellationDialog';
import OrderTimeline from '@/components/OrderTimeline';
import OrderFilters from '@/components/OrderFilters';
import SEOHead from '@/components/SEOHead';
import QuickReorder from '@/components/QuickReorder';

interface Order {
  id: string;
  total_amount: number;
  status: string;
  shipping_address: string;
  tracking_number: string | null;
  seller_notes: string | null;
  refund_status: string;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  created_at: string;
  order_items: {
    id: string;
    quantity: number;
    price_at_time: number;
    product_id: string;
    products: {
      name: string;
      image_url: string;
      is_active: boolean;
    };
  }[];
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellationDialogOpen, setCancellationDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            quantity,
            price_at_time,
            product_id,
            products(name, image_url, is_active)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading orders",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'processing':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getRefundStatusBadge = (refundStatus: string) => {
    switch (refundStatus) {
      case 'requested':
        return <Badge variant="secondary" className="bg-yellow-500">Refund Requested</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-500">Refund Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Refund Rejected</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-600">Refunded</Badge>;
      default:
        return null;
    }
  };

  const canCancelOrder = (order: Order) => {
    return order.status === 'pending' && order.refund_status === 'none';
  };

  const handleCancelClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCancellationDialogOpen(true);
  };

  const exportOrders = () => {
    const csv = [
      ['Order ID', 'Date', 'Status', 'Total', 'Items'].join(','),
      ...filteredOrders.map(order => [
        order.id.slice(0, 8),
        new Date(order.created_at).toLocaleDateString(),
        order.status,
        order.total_amount.toFixed(2),
        order.order_items.length
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(query);
        const matchesItems = order.order_items.some(item =>
          item.products.name.toLowerCase().includes(query)
        );
        if (!matchesId && !matchesItems) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      // Date filter
      if (dateFilter !== 'all') {
        const orderDate = new Date(order.created_at);
        const now = new Date();
        
        switch (dateFilter) {
          case 'today':
            if (orderDate.toDateString() !== now.toDateString()) return false;
            break;
          case 'week':
            const weekAgo = new Date(now.setDate(now.getDate() - 7));
            if (orderDate < weekAgo) return false;
            break;
          case 'month':
            const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
            if (orderDate < monthAgo) return false;
            break;
          case 'year':
            const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
            if (orderDate < yearAgo) return false;
            break;
        }
      }

      return true;
    });
  }, [orders, searchQuery, statusFilter, dateFilter]);

  if (loading) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <SEOHead
          title="My Orders - GlassStore"
          description="View and track all your orders. Check order status, shipping information, and request cancellations."
          keywords={['orders', 'order history', 'track order', 'order status']}
        />
        <Navigation />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="glass rounded-xl p-8">
              <div className="animate-pulse text-center space-y-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full mx-auto animate-bounce"></div>
                <p className="text-muted-foreground">Loading your orders...</p>
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
        <Navigation />
        
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-4">
              <Link to="/my-dashboard">
                <Button variant="ghost" size="sm">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  My Dashboard
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Marketplace
                </Button>
              </Link>
            </div>

            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  My Orders
                </h1>
                <p className="text-muted-foreground">
                  View and track all your orders ({filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'})
                </p>
              </div>
              {orders.length > 0 && (
                <Button variant="outline" size="sm" onClick={exportOrders}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
            </div>

            {orders.length > 0 && (
              <OrderFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                dateFilter={dateFilter}
                onDateChange={setDateFilter}
              />
            )}

            {filteredOrders.length === 0 && orders.length > 0 ? (
              <Card className="glass-card">
                <CardContent className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No orders match your filters</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search or filters
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setDateFilter('all');
                  }}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : orders.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="text-center py-12">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start shopping to see your orders here
                  </p>
                  <Link to="/marketplace">
                    <Button variant="apple">
                      Browse Products
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="glass-card">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          {getRefundStatusBadge(order.refund_status)}
                        </div>
                      </div>
                      
                      {/* Cancellation reason if exists */}
                      {order.cancellation_reason && (
                        <div className="mt-3 p-3 bg-muted rounded-lg flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Cancellation Reason:</p>
                            <p className="text-sm text-muted-foreground">{order.cancellation_reason}</p>
                          </div>
                        </div>
                      )}
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Order Timeline */}
                      <OrderTimeline
                        currentStatus={order.status}
                        createdAt={order.created_at}
                        cancelledAt={order.cancelled_at}
                      />

                      <Separator />

                      {/* Order Items */}
                      <div className="space-y-3">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex gap-4">
                            <img 
                              src={item.products.image_url || '/placeholder.svg'} 
                              alt={item.products.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground">
                                {item.products.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-primary">
                                {formatPrice(item.price_at_time * item.quantity)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatPrice(item.price_at_time)} each
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Separator />
                      
                      {/* Order Summary */}
                      <div className="space-y-3">
                        {order.shipping_address && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Shipping to: </span>
                            <span className="text-foreground">{order.shipping_address}</span>
                          </div>
                        )}
                        {order.tracking_number && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Tracking Number: </span>
                            <span className="text-foreground font-mono">{order.tracking_number}</span>
                          </div>
                        )}
                        {order.seller_notes && order.refund_status !== 'none' && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              {order.refund_status === 'rejected' ? 'Rejection Reason: ' : 'Seller Notes: '}
                            </span>
                            <span className="text-foreground">{order.seller_notes}</span>
                          </div>
                        )}
                        
                        <Separator />
                        
                        <div className="flex justify-between items-center font-bold text-lg">
                          <span>Total</span>
                          <span className="text-primary">{formatPrice(order.total_amount)}</span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {/* Reorder button for completed orders */}
                          {(order.status === 'completed' || order.status === 'delivered') && (
                            <QuickReorder 
                              orderItems={order.order_items.map(item => ({
                                product_id: item.product_id,
                                quantity: item.quantity,
                                products: {
                                  name: item.products.name,
                                  is_active: item.products.is_active
                                }
                              }))} 
                            />
                          )}
                          
                          {/* Cancel order button */}
                          {canCancelOrder(order) && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="gap-2"
                              onClick={() => handleCancelClick(order.id)}
                            >
                              <XCircle className="h-4 w-4" />
                              Cancel Order
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>

      {/* Cancellation Dialog */}
      {selectedOrderId && (
        <CancellationDialog
          orderId={selectedOrderId}
          open={cancellationDialogOpen}
          onOpenChange={setCancellationDialogOpen}
          onSuccess={fetchOrders}
        />
      )}
    </ProtectedRoute>
  );
};

export default Orders;