import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Store, 
  Package, 
  TrendingUp, 
  Users, 
  Plus,
  Eye,
  Edit,
  Crown,
  AlertTriangle,
  Clock,
  ShoppingBag,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useSellerAnalytics } from '@/hooks/useSellerAnalytics';
import ProtectedRoute from '@/components/ProtectedRoute';
import AnalyticsMetrics from '@/components/analytics/AnalyticsMetrics';
import RevenueChart from '@/components/analytics/RevenueChart';
import TopProductsCard from '@/components/analytics/TopProductsCard';

interface StoreData {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  image_url: string;
  is_active: boolean;
  product_count?: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  inventory_count: number;
  is_active: boolean;
}

const Dashboard = () => {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const subscription = useSubscription();
  const { analytics, loading: analyticsLoading } = useSellerAnalytics();

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch user's stores
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select(`
          *,
          products(id)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (storesError) {
        throw storesError;
      }

      const storesWithCounts = storesData?.map(store => ({
        ...store,
        product_count: store.products?.length || 0
      })) || [];

      setStores(storesWithCounts);

      // Fetch user's products across all stores
      if (storesData && storesData.length > 0) {
        const storeIds = storesData.map(store => store.id);
        
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('store_id', storeIds)
          .order('created_at', { ascending: false });

        if (productsError) {
          throw productsError;
        }

        setProducts(productsData || []);
      }
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getTotalInventoryValue = () => {
    return products.reduce((total, product) => 
      total + (product.price * product.inventory_count), 0
    );
  };

  const getActiveProducts = () => {
    return products.filter(product => product.is_active).length;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
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
        <Navigation />
        
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Manage your stores and track your business performance
                </p>
              </div>
              <div className="flex gap-2">
                <Link to="/seller/orders">
                  <Button variant="outline">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Orders
                  </Button>
                </Link>
                <Link to="/subscription">
                  <Button variant="outline">
                    <Crown className="h-4 w-4 mr-2" />
                    Subscription
                  </Button>
                </Link>
              </div>
            </div>

            {/* Subscription Status Alert */}
            {!subscription.loading && subscription.isTrial && (
              <Alert className="mb-6 border-accent/50 bg-accent/10">
                <Clock className="h-4 w-4 text-accent" />
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    Trial ends in {subscription.daysRemaining} days. 
                    {subscription.maxProducts && ` Current limit: ${products.length}/${subscription.maxProducts} products`}
                  </span>
                  <Link to="/subscription">
                    <Button variant="outline" size="sm">
                      <Crown className="h-3 w-3 mr-1" />
                      Upgrade Now
                    </Button>
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            {!subscription.loading && subscription.isExpired && (
              <Alert className="mb-6 border-destructive/50 bg-destructive/10">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Your subscription has expired. Upgrade to continue using all features.</span>
                  <Link to="/subscription">
                    <Button variant="destructive" size="sm">
                      <Crown className="h-3 w-3 mr-1" />
                      Renew Plan
                    </Button>
                  </Link>
                </AlertDescription>
              </Alert>
            )}


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
                    {stores.filter(store => store.is_active).length} active
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
                    {getActiveProducts()} active
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPrice(getTotalInventoryValue())}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all products
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$0</div>
                  <p className="text-xs text-muted-foreground">
                    This month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="analytics" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="stores">My Stores</TabsTrigger>
                <TabsTrigger value="products">My Products</TabsTrigger>
              </TabsList>

              <TabsContent value="analytics" className="space-y-6">
                {analyticsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="glass rounded-xl p-8">
                      <div className="animate-pulse text-center space-y-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-full mx-auto animate-bounce"></div>
                        <p className="text-muted-foreground">Loading analytics...</p>
                      </div>
                    </div>
                  </div>
                ) : analytics.totalOrders === 0 ? (
                  <Card className="glass-card">
                    <CardContent className="text-center py-12">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Sales Data Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Once you start receiving orders, your analytics will appear here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <AnalyticsMetrics
                      totalRevenue={analytics.totalRevenue}
                      totalOrders={analytics.totalOrders}
                      completedOrders={analytics.completedOrders}
                      pendingOrders={analytics.pendingOrders}
                      averageOrderValue={analytics.averageOrderValue}
                    />
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <RevenueChart data={analytics.revenueByMonth} />
                      <TopProductsCard products={analytics.topProducts} />
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="stores" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Your Stores</h2>
                  <Link to="/create-store">
                    <Button variant="apple">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Store
                    </Button>
                  </Link>
                </div>

                {stores.length === 0 ? (
                  <Card className="glass-card">
                    <CardContent className="text-center py-12">
                      <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No stores yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first store to start selling products
                      </p>
                      <Link to="/create-store">
                        <Button variant="apple">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Store
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stores.map((store) => (
                      <Card key={store.id} className="glass-card group hover-lift">
                        <div className="relative">
                          <img 
                            src={store.image_url || '/placeholder.svg'} 
                            alt={store.name}
                            className="w-full h-32 object-cover rounded-t-lg"
                          />
                          <Badge 
                            className={`absolute top-2 right-2 ${
                              store.is_active ? 'bg-green-500' : 'bg-gray-500'
                            }`}
                          >
                            {store.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-foreground mb-1">
                            {store.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {store.description || 'No description'}
                          </p>
                          
                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                            <span>{store.category}</span>
                            <span>{store.product_count} products</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <Link to={`/store/${store.id}`} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </Link>
                            <Link to={`/edit-store/${store.id}`} className="flex-1">
                              <Button variant="apple" size="sm" className="w-full">
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="products" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Your Products</h2>
                  {stores.length > 0 && (
                    <Link to="/add-product">
                      <Button variant="apple">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </Link>
                  )}
                </div>

                {products.length === 0 ? (
                  <Card className="glass-card">
                    <CardContent className="text-center py-12">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                      <p className="text-muted-foreground mb-4">
                        {stores.length === 0 
                          ? 'Create a store first, then add products to start selling'
                          : 'Add your first product to start selling'
                        }
                      </p>
                      {stores.length === 0 ? (
                        <Link to="/create-store">
                          <Button variant="apple">
                            <Store className="h-4 w-4 mr-2" />
                            Create Store First
                          </Button>
                        </Link>
                      ) : (
                        <Link to="/add-product">
                          <Button variant="apple">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Product
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map((product) => (
                      <Card key={product.id} className="glass-card group hover-lift">
                        <div className="relative">
                          <img 
                            src={product.image_url || '/placeholder.svg'} 
                            alt={product.name}
                            className="w-full h-32 object-cover rounded-t-lg"
                          />
                          <Badge 
                            className={`absolute top-2 right-2 text-xs ${
                              product.is_active ? 'bg-green-500' : 'bg-gray-500'
                            }`}
                          >
                            {product.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {product.inventory_count <= 5 && product.inventory_count > 0 && (
                            <Badge className="absolute top-2 left-2 bg-orange-500 text-xs">
                              Low Stock
                            </Badge>
                          )}
                        </div>
                        
                        <CardContent className="p-3">
                          <h3 className="font-medium text-foreground text-sm mb-1 line-clamp-1">
                            {product.name}
                          </h3>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                            <span>{product.category}</span>
                            <span>{product.inventory_count} in stock</span>
                          </div>
                          
                          <div className="text-lg font-bold text-primary mb-2">
                            {formatPrice(product.price)}
                          </div>
                          
                          <Link to={`/edit-product/${product.id}`} className="w-full block">
                            <Button variant="apple" size="sm" className="w-full">
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;