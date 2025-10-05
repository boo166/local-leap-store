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
  Trash2,
  Shield,
  Eye,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminRoute from '@/components/AdminRoute';
import SiteContentManager from '@/components/SiteContentManager';

const Admin = () => {
  const [stores, setStores] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stores');
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
        order_items(id, quantity, price_at_time, products(name))
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
      // Validate role type
      if (role !== 'admin' && role !== 'seller' && role !== 'buyer') {
        toast({
          title: "Invalid role",
          description: "Please select a valid role.",
          variant: "destructive",
        });
        return;
      }

      // First, check if the role already exists
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
      // Validate role type
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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

        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">
                  Admin Dashboard
                </h1>
              </div>
              <p className="text-muted-foreground">
                Manage all stores, products, orders, and users
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stores.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {stores.filter(s => s.is_active).length} active
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{products.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {products.filter(p => p.is_active).length} active
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orders.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {orders.filter(o => o.status === 'pending').length} pending
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered users
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="stores">Stores</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="content">Site Content</TabsTrigger>
              </TabsList>

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

              {/* Site Content Tab */}
              <TabsContent value="content" className="space-y-4">
                <SiteContentManager />
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
                              {user.full_name || 'N/A'}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <div className="flex gap-1 flex-wrap">
                                {user.user_roles?.map((roleObj: any, idx: number) => (
                                  <Badge key={idx} variant="outline">
                                    {roleObj.role}
                                  </Badge>
                                )) || <span className="text-muted-foreground text-sm">No roles</span>}
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(user.created_at)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Shield className="h-3 w-3 mr-1" />
                                      Manage
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Manage User Roles</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Assign or remove roles for {user.full_name || user.email}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="space-y-4 my-4">
                                      {['admin', 'seller', 'buyer'].map((role) => {
                                        const hasRole = user.user_roles?.some(
                                          (r: any) => r.role === role
                                        );
                                        return (
                                          <div key={role} className="flex items-center justify-between">
                                            <Label className="capitalize">{role}</Label>
                                            {hasRole ? (
                                              <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => removeUserRole(user.user_id, role)}
                                              >
                                                Remove
                                              </Button>
                                            ) : (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => updateUserRole(user.user_id, role)}
                                              >
                                                Assign
                                              </Button>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Close</AlertDialogCancel>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
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
