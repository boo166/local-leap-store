import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import OrderTimeline from '@/components/OrderTimeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  Copy,
  ExternalLink,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Printer,
} from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  price_at_time: number;
  product_id: string;
  products: {
    id: string;
    name: string;
    image_url: string | null;
    stores: {
      id: string;
      name: string;
    };
  };
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  shipping_address: string | null;
  tracking_number: string | null;
  seller_notes: string | null;
  created_at: string;
  updated_at: string;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  refund_status: string | null;
  order_items: OrderItem[];
}

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId && user) {
      fetchOrder();
    }
  }, [orderId, user]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            price_at_time,
            product_id,
            products (
              id,
              name,
              image_url,
              stores!products_store_id_fkey (
                id,
                name
              )
            )
          )
        `)
        .eq('id', orderId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error: any) {
      console.error('Error fetching order:', error);
      toast({
        title: "Order not found",
        description: "The order you're looking for doesn't exist.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Copied to clipboard.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5" />;
      case 'processing':
        return <Package className="h-5 w-5" />;
      case 'shipped':
        return <Truck className="h-5 w-5" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'processing':
        return 'bg-blue-500';
      case 'shipped':
        return 'bg-purple-500';
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The order you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate('/orders')}>
            View My Orders
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = order.order_items.reduce(
    (sum, item) => sum + item.price_at_time * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`Order #${order.id.slice(0, 8)} - GlassStore`}
        description="View your order details and tracking information"
        noindex={true}
      />
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Orders
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>

        {/* Order Header Card */}
        <Card className="glass-card mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  Order #{order.id.slice(0, 8)}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(order.id)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </CardTitle>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Calendar className="h-4 w-4" />
                  Placed on {formatDate(order.created_at)}
                </p>
              </div>
              <Badge className={`${getStatusColor(order.status)} text-white px-4 py-2`}>
                <span className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Order Timeline */}
        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderTimeline
              currentStatus={order.status}
              createdAt={order.created_at}
              cancelledAt={order.cancelled_at}
            />
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Shipping Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line">
                {order.shipping_address || 'No address provided'}
              </p>
            </CardContent>
          </Card>

          {/* Tracking Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Tracking Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.tracking_number ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Tracking Number:</span>
                    <code className="bg-muted px-2 py-1 rounded text-sm">
                      {order.tracking_number}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(order.tracking_number!)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  {order.seller_notes && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Seller Notes:</span> {order.seller_notes}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Tracking information will be available once your order ships.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cancellation Info */}
        {order.status === 'cancelled' && order.cancellation_reason && (
          <Card className="glass-card mb-6 border-destructive/50">
            <CardHeader>
              <CardTitle className="text-lg text-destructive flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Cancellation Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{order.cancellation_reason}</p>
              {order.cancelled_at && (
                <p className="text-sm text-muted-foreground mt-2">
                  Cancelled on {formatDate(order.cancelled_at)}
                </p>
              )}
              {order.refund_status && order.refund_status !== 'none' && (
                <Badge variant="secondary" className="mt-2">
                  Refund Status: {order.refund_status}
                </Badge>
              )}
            </CardContent>
          </Card>
        )}

        {/* Order Items */}
        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items ({order.order_items.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg"
                >
                  <Link to={`/product/${item.product_id}`}>
                    <img
                      src={item.products?.image_url || '/placeholder.svg'}
                      alt={item.products?.name}
                      className="w-20 h-20 object-cover rounded-lg hover:opacity-80 transition-opacity"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.product_id}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {item.products?.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      Sold by:{' '}
                      <Link
                        to={`/store/${item.products?.stores?.id}`}
                        className="hover:text-primary"
                      >
                        {item.products?.stores?.name}
                      </Link>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatPrice(item.price_at_time * item.quantity)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.price_at_time)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate('/orders')}
          >
            View All Orders
          </Button>
          <Button
            variant="apple"
            className="flex-1"
            onClick={() => navigate('/marketplace')}
          >
            Continue Shopping
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderDetails;
