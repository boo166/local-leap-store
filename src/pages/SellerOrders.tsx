import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Package, Truck, CheckCircle, XCircle, Clock, Edit, DollarSign, Filter, Download, LayoutDashboard } from 'lucide-react';
import { useSellerOrders } from '@/hooks/useSellerOrders';
import OrderTimeline from '@/components/OrderTimeline';
import OrderFilters from '@/components/OrderFilters';
import ProtectedRoute from '@/components/ProtectedRoute';
import RefundManagementDialog from '@/components/RefundManagementDialog';
import SEOHead from '@/components/SEOHead';
import BulkOrderActions from '@/components/BulkOrderActions';
import { Link } from 'react-router-dom';

const SellerOrders = () => {
  const { orders, loading, updateOrderStatus, updateTrackingInfo, refetch } = useSellerOrders();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [sellerNotes, setSellerNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedRefundOrder, setSelectedRefundOrder] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showBulkActions, setShowBulkActions] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(price);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const handleUpdateTracking = (orderId: string) => {
    setSelectedOrder(orderId);
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setTrackingNumber(order.tracking_number || '');
      setSellerNotes(order.seller_notes || '');
    }
    setDialogOpen(true);
  };

  const handleSaveTracking = async () => {
    if (!selectedOrder) return;
    await updateTrackingInfo(selectedOrder, trackingNumber, sellerNotes);
    setDialogOpen(false);
    setSelectedOrder(null);
    setTrackingNumber('');
    setSellerNotes('');
  };

  const handleRefundClick = (order: any) => {
    setSelectedRefundOrder(order);
    setRefundDialogOpen(true);
  };

  const getRefundStatusBadge = (refundStatus: string) => {
    switch (refundStatus) {
      case 'requested':
        return <Badge variant="secondary" className="bg-yellow-500">Refund Requested</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-600">Completed</Badge>;
      default:
        return null;
    }
  };

  const exportOrders = () => {
    const csv = [
      ['Order ID', 'Customer', 'Date', 'Status', 'Total', 'Items'].join(','),
      ...filteredOrders.map(order => [
        order.id.slice(0, 8),
        order.profiles?.full_name || order.profiles?.email || 'N/A',
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
    a.download = `seller-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredOrders = orders.filter(order => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesId = order.id.toLowerCase().includes(query);
      const matchesCustomer = (order.profiles?.full_name || order.profiles?.email || '').toLowerCase().includes(query);
      const matchesItems = order.order_items.some(item =>
        item.products?.name.toLowerCase().includes(query)
      );
      if (!matchesId && !matchesCustomer && !matchesItems) return false;
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

  if (loading) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <SEOHead
          title="Manage Orders - Seller Dashboard"
          description="Manage your store orders, update shipping information, and handle refund requests."
          keywords={['seller orders', 'order management', 'shipping', 'refunds']}
          noindex={true}
        />
        <Navigation />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="glass rounded-xl p-8">
              <div className="animate-pulse text-center space-y-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full mx-auto animate-bounce"></div>
                <p className="text-muted-foreground">Loading orders...</p>
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
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="mb-4">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>

            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Manage Orders
                </h1>
                <p className="text-muted-foreground">
                  View and manage orders for your products ({filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'})
                </p>
              </div>
              <div className="flex gap-2">
                {orders.length > 0 && (
                  <>
                    <Button 
                      variant={showBulkActions ? "secondary" : "outline"} 
                      size="sm" 
                      onClick={() => setShowBulkActions(!showBulkActions)}
                    >
                      Bulk Actions
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportOrders}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Bulk Actions Panel */}
            {showBulkActions && orders.length > 0 && (
              <div className="mb-6">
                <BulkOrderActions orders={orders} onUpdate={refetch} />
              </div>
            )}

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
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                  <p className="text-muted-foreground">
                    Orders for your products will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="glass-card">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg mb-2">
                            Order #{order.id.slice(0, 8)}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Customer: {order.profiles?.full_name || order.profiles?.email}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={getStatusColor(order.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {order.status}
                            </span>
                          </Badge>
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-4">
                        {/* Order Timeline */}
                        <OrderTimeline
                          currentStatus={order.status}
                          createdAt={order.created_at}
                          cancelledAt={order.cancelled_at}
                        />

                        <Separator />

                        {/* Refund Status if applicable */}
                        {order.refund_status && order.refund_status !== 'none' && (
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Refund Status:</span>
                              {getRefundStatusBadge(order.refund_status)}
                            </div>
                            {order.cancellation_reason && (
                              <p className="text-sm text-muted-foreground">
                                Reason: {order.cancellation_reason}
                              </p>
                            )}
                            {order.refund_status === 'requested' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 w-full"
                                onClick={() => handleRefundClick(order)}
                              >
                                <DollarSign className="h-4 w-4 mr-2" />
                                Review Refund Request
                              </Button>
                            )}
                          </div>
                        )}

                        {/* Order Items */}
                        <div>
                          <h4 className="font-semibold mb-3">Items</h4>
                          <div className="space-y-2">
                            {order.order_items.map((item) => (
                              <div key={item.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                                <img
                                  src={item.products?.image_url || '/placeholder.svg'}
                                  alt={item.products?.name}
                                  className="w-16 h-16 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <p className="font-medium">{item.products?.name}</p>
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
                        </div>

                        {/* Shipping & Tracking */}
                        <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                          <div>
                            <h4 className="font-semibold mb-2">Shipping Address</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                              {order.shipping_address || 'No address provided'}
                            </p>
                          </div>
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold">Tracking Info</h4>
                              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateTracking(order.id)}
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Update Tracking Information</DialogTitle>
                                    <DialogDescription>
                                      Add or update tracking number and notes for this order
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="tracking">Tracking Number</Label>
                                      <Input
                                        id="tracking"
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        placeholder="Enter tracking number"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="notes">Seller Notes</Label>
                                      <Textarea
                                        id="notes"
                                        value={sellerNotes}
                                        onChange={(e) => setSellerNotes(e.target.value)}
                                        placeholder="Add any notes for the customer"
                                        rows={3}
                                      />
                                    </div>
                                    <Button onClick={handleSaveTracking} className="w-full">
                                      Save Changes
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                            {order.tracking_number ? (
                              <div className="space-y-1">
                                <p className="text-sm">
                                  <span className="font-medium">Tracking:</span>{' '}
                                  {order.tracking_number}
                                </p>
                                {order.seller_notes && (
                                  <p className="text-sm text-muted-foreground">
                                    {order.seller_notes}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No tracking information yet
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Total */}
                        <div className="flex justify-end pt-4 border-t">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                            <p className="text-2xl font-bold text-primary">
                              {formatPrice(order.total_amount)}
                            </p>
                          </div>
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

      {/* Refund Management Dialog */}
      {selectedRefundOrder && (
        <RefundManagementDialog
          order={selectedRefundOrder}
          open={refundDialogOpen}
          onOpenChange={setRefundDialogOpen}
          onSuccess={() => window.location.reload()}
        />
      )}
    </ProtectedRoute>
  );
};

export default SellerOrders;
