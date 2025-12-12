import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Store,
  Package,
  ShoppingCart,
  Users,
  Edit,
  Shield,
  Eye,
  ToggleLeft,
  ToggleRight,
  CreditCard,
  Check,
  X,
  ExternalLink,
  LayoutDashboard,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminRoute from '@/components/AdminRoute';
import SiteContentManager from '@/components/SiteContentManager';
import AdminReviewModeration from '@/components/AdminReviewModeration';
import AdminQuickActions from '@/components/admin/AdminQuickActions';
import PlatformOverview from '@/components/admin/PlatformOverview';
import AdminActivityFeed from '@/components/admin/AdminActivityFeed';
import PlatformAnalytics from '@/components/admin/PlatformAnalytics';
import StoreVerificationManager from '@/components/admin/StoreVerificationManager';
import UserActivityLog from '@/components/admin/UserActivityLog';

const Admin = () => {
  const [stores, setStores] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [pendingReviews, setPendingReviews] = useState(0);
  const [pendingVerifications, setPendingVerifications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStores(),
        fetchProducts(),
        fetchOrders(),
        fetchUsers(),
        fetchPayments(),
        fetchPendingReviews(),
        fetchPendingVerifications(),
      ]);
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    const { data, error } = await supabase
      .from('stores')
      .select(`
        *,
        profiles!stores_user_id_fkey(full_name, email),
        products(id)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setStores(data || []);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        stores!products_store_id_fkey(name, user_id)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setProducts(data || []);
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        profiles!orders_user_id_fkey(full_name, email),
        order_items(id, quantity, price_at_time, product_id, products(name))
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setOrders(data || []);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles(role)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setUsers(data || []);
  };

  const fetchPayments = async () => {
    const { data, error } = await supabase
      .from('payment_submissions')
      .select(`
        *,
        profiles!payment_submissions_user_id_fkey(full_name, email),
        subscription_plans!payment_submissions_plan_id_fkey(name, price_monthly, price_yearly)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setPayments(data || []);
  };

  const fetchPendingReviews = async () => {
    const { count } = await supabase
      .from('product_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', false);
    
    setPendingReviews(count || 0);
  };

  const fetchPendingVerifications = async () => {
    const { count } = await supabase
      .from('store_verifications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    setPendingVerifications(count || 0);
  };

  const toggleStoreStatus = async (storeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('stores')
        .update({ is_active: !currentStatus })
        .eq('id', storeId);

      if (error) throw error;

      toast({
        title: "Store updated",
        description: `Store ${!currentStatus ? 'activated' : 'deactivated'} successfully.`,
      });

      fetchStores();
    } catch (error: any) {
      toast({
        title: "Error updating store",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Product updated",
        description: `Product ${!currentStatus ? 'activated' : 'deactivated'} successfully.`,
      });

      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error updating product",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Order updated",
        description: "Order status updated successfully.",
      });

      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Error updating order",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      if (role !== 'admin' && role !== 'seller' && role !== 'buyer') {
        toast({
          title: "Invalid role",
          description: "Please select a valid role.",
          variant: "destructive",
        });
        return;
      }

      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', role as 'admin' | 'seller' | 'buyer')
        .single();

      if (existingRole) {
        toast({
          title: "Role already exists",
          description: "User already has this role.",
        });
        return;
      }

      const { error } = await supabase
        .from('user_roles')
        .insert([{ 
          user_id: userId, 
          role: role as 'admin' | 'seller' | 'buyer'
        }]);

      if (error) throw error;

      toast({
        title: "Role assigned",
        description: `${role} role assigned successfully.`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error assigning role",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeUserRole = async (userId: string, role: string) => {
    try {
      if (role !== 'admin' && role !== 'seller' && role !== 'buyer') {
        toast({
          title: "Invalid role",
          description: "Please select a valid role.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role as 'admin' | 'seller' | 'buyer');

      if (error) throw error;

      toast({
        title: "Role removed",
        description: `${role} role removed successfully.`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error removing role",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const approvePayment = async (paymentId: string, subscriptionId: string, billingCycle: string) => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw new Error('Not authenticated');

      const now = new Date();
      const periodStart = now;
      const periodEnd = new Date(now);
      
      if (billingCycle === 'monthly') {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }

      const { error: paymentError } = await supabase
        .from('payment_submissions')
        .update({
          status: 'approved',
          reviewed_by: authData.user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (paymentError) throw paymentError;

      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'active',
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
          trial_end_date: null,
        })
        .eq('id', subscriptionId);

      if (subscriptionError) throw subscriptionError;

      toast({
        title: "Payment approved",
        description: "Subscription has been activated successfully.",
      });

      fetchPayments();
    } catch (error: any) {
      toast({
        title: "Error approving payment",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const rejectPayment = async (paymentId: string, adminNotes: string) => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('payment_submissions')
        .update({
          status: 'rejected',
          reviewed_by: authData.user.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes,
        })
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: "Payment rejected",
        description: "User has been notified of the rejection.",
      });

      fetchPayments();
    } catch (error: any) {
      toast({
        title: "Error rejecting payment",
        description: error.message,
        variant: "destructive",
      });
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
      month: 'short',
      day: 'numeric',
    });
  };

  const pendingPayments = payments.filter(p => p.status === 'pending').length;

  if (loading) {
    return (
      <AdminRoute>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="glass rounded-xl p-8">
              <div className="animate-pulse text-center space-y-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full mx-auto animate-bounce"></div>
                <p className="text-muted-foreground">Loading admin panel...</p>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-background">
        <Navigation />

        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">
                  Admin Dashboard
                </h1>
              </div>
              <p className="text-muted-foreground">
                Unified platform management center
              </p>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="flex flex-wrap w-full h-auto gap-1 p-1">
                <TabsTrigger value="overview" className="flex items-center gap-1">
                  <LayoutDashboard className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="stores">Stores</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="payments" className="relative">
                  Payments
                  {pendingPayments > 0 && (
                    <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                      {pendingPayments}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="verifications">Verifications</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
              </TabsList>

              {/* Overview Tab - New Unified Dashboard */}
              <TabsContent value="overview" className="space-y-6">
                <AdminQuickActions
                  onNavigate={setActiveTab}
                  pendingPayments={pendingPayments}
                  pendingReviews={pendingReviews}
                  pendingVerifications={pendingVerifications}
                />
                
                <PlatformOverview
                  stores={stores}
                  products={products}
                  orders={orders}
                  users={users}
                  payments={payments}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AdminActivityFeed />
                  
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="text-lg">System Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Database</span>
                        <Badge variant="default">Healthy</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Authentication</span>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Storage</span>
                        <Badge variant="default">Available</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Edge Functions</span>
                        <Badge variant="default">Running</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics">
                <PlatformAnalytics
                  stores={stores}
                  products={products}
                  orders={orders}
                  users={users}
                  payments={payments}
                />
              </TabsContent>

              {/* Stores Tab */}
              <TabsContent value="stores" className="space-y-4">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>All Stores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Products</TableHead>
                          <TableHead>Verified</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stores.map((store) => (
                          <TableRow key={store.id}>
                            <TableCell className="font-medium">{store.name}</TableCell>
                            <TableCell>{store.profiles?.full_name || 'Unknown'}</TableCell>
                            <TableCell>{store.category}</TableCell>
                            <TableCell>{store.products?.length || 0}</TableCell>
                            <TableCell>
                              {store.is_verified ? (
                                <Badge variant="default" className="bg-green-500/10 text-green-500">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Unverified</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={store.is_active ? 'default' : 'secondary'}>
                                {store.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Link to={`/store/${store.id}`}>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toggleStoreStatus(store.id, store.is_active)}
                                >
                                  {store.is_active ? (
                                    <ToggleRight className="h-3 w-3" />
                                  ) : (
                                    <ToggleLeft className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products" className="space-y-4">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>All Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Store</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Inventory</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.stores?.name || 'Unknown'}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>{formatPrice(product.price)}</TableCell>
                            <TableCell>{product.inventory_count}</TableCell>
                            <TableCell>
                              <Badge variant={product.is_active ? 'default' : 'secondary'}>
                                {product.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleProductStatus(product.id, product.is_active)}
                              >
                                {product.is_active ? (
                                  <ToggleRight className="h-3 w-3" />
                                ) : (
                                  <ToggleLeft className="h-3 w-3" />
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="space-y-4">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>All Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-xs">
                              {order.id.substring(0, 8)}
                            </TableCell>
                            <TableCell>{order.profiles?.full_name || 'Unknown'}</TableCell>
                            <TableCell>{order.order_items?.length || 0}</TableCell>
                            <TableCell>{formatPrice(order.total_amount)}</TableCell>
                            <TableCell>
                              <Select
                                value={order.status}
                                onValueChange={(value) => updateOrderStatus(order.id, value)}
                              >
                                <SelectTrigger className="w-32">
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
                            </TableCell>
                            <TableCell>{formatDate(order.created_at)}</TableCell>
                            <TableCell>
                              <Link to={`/orders`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-4">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>All Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Roles</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              {user.full_name || 'No name'}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <div className="flex gap-1 flex-wrap">
                                {user.user_roles?.map((r: any, idx: number) => (
                                  <Badge
                                    key={idx}
                                    variant={r.role === 'admin' ? 'default' : 'secondary'}
                                    className="cursor-pointer"
                                    onClick={() => removeUserRole(user.user_id, r.role)}
                                  >
                                    {r.role} ×
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(user.created_at)}</TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Add Role
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Assign Role</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Select a role to assign to {user.full_name || user.email}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <div className="flex gap-2 my-4">
                                    <Button
                                      variant="outline"
                                      onClick={() => updateUserRole(user.user_id, 'buyer')}
                                    >
                                      Buyer
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => updateUserRole(user.user_id, 'seller')}
                                    >
                                      Seller
                                    </Button>
                                    <Button
                                      variant="default"
                                      onClick={() => updateUserRole(user.user_id, 'admin')}
                                    >
                                      Admin
                                    </Button>
                                  </div>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payments Tab */}
              <TabsContent value="payments" className="space-y-4">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Payment Submissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Billing Cycle</TableHead>
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>Screenshot</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{payment.profiles?.full_name || 'Unknown'}</div>
                                <div className="text-xs text-muted-foreground">{payment.profiles?.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>{payment.subscription_plans?.name}</TableCell>
                            <TableCell>{formatPrice(payment.amount)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{payment.billing_cycle}</Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs">{payment.transaction_id}</TableCell>
                            <TableCell>
                              <a 
                                href={payment.screenshot_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary hover:underline"
                              >
                                View <ExternalLink className="h-3 w-3" />
                              </a>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  payment.status === 'approved' ? 'default' :
                                  payment.status === 'rejected' ? 'destructive' :
                                  'secondary'
                                }
                              >
                                {payment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(payment.created_at)}</TableCell>
                            <TableCell>
                              {payment.status === 'pending' && (
                                <div className="flex gap-2">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="outline" size="sm" className="text-green-600">
                                        <Check className="h-3 w-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Approve Payment</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will activate the user's subscription. Make sure you've verified the payment proof.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => approvePayment(payment.id, payment.subscription_id, payment.billing_cycle)}
                                        >
                                          Approve
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>

                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="outline" size="sm" className="text-red-600">
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Reject Payment</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Provide a reason for rejecting this payment submission.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <div className="my-4">
                                        <Label htmlFor="admin-notes">Rejection Reason</Label>
                                        <Input
                                          id="admin-notes"
                                          placeholder="e.g., Invalid transaction ID, screenshot unclear..."
                                          className="mt-2"
                                        />
                                      </div>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          className="bg-destructive text-destructive-foreground"
                                          onClick={() => {
                                            const notes = (document.getElementById('admin-notes') as HTMLInputElement)?.value || 'No reason provided';
                                            rejectPayment(payment.id, notes);
                                          }}
                                        >
                                          Reject
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Verifications Tab */}
              <TabsContent value="verifications">
                <StoreVerificationManager />
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews">
                <AdminReviewModeration />
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity">
                <UserActivityLog />
              </TabsContent>

              {/* Content Tab */}
              <TabsContent value="content">
                <SiteContentManager />
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <Footer />
      </div>
    </AdminRoute>
  );
};

export default Admin;
