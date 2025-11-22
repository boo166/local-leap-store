import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft,
  CreditCard,
  Bookmark,
  ShoppingBag
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSavedForLater } from '@/hooks/useSavedForLater';
import ProtectedRoute from '@/components/ProtectedRoute';
import CheckoutDialog from '@/components/CheckoutDialog';

interface CartItem {
  id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    inventory_count: number;
    stores: {
      id: string;
      name: string;
    };
  };
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { savedItems, saveForLater, moveToCart, removeSavedItem } = useSavedForLater();

  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user]);

  const fetchCartItems = async () => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products!cart_items_product_id_fkey(
            id,
            name,
            description,
            price,
            image_url,
            inventory_count,
            stores!products_store_id_fkey(id, name)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setCartItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading cart",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(cartItemId);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', cartItemId)
        .eq('user_id', user?.id);

      if (error) {
        throw error;
      }

      setCartItems(prev => 
        prev.map(item => 
          item.id === cartItemId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

      toast({
        title: "Cart updated",
        description: "Item quantity has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating cart",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeItem = async (cartItemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)
        .eq('user_id', user?.id);

      if (error) {
        throw error;
      }

      setCartItems(prev => prev.filter(item => item.id !== cartItemId));

      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
    } catch (error: any) {
      toast({
        title: "Error removing item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveForLater = async (cartItem: CartItem) => {
    await saveForLater(cartItem.products.id, cartItem.quantity);
    await removeItem(cartItem.id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => 
      total + (item.products.price * item.quantity), 0
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setCheckoutOpen(true);
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
                <p className="text-muted-foreground">Loading your cart...</p>
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
            <div className="mb-8">
              <Link to="/marketplace">
                <Button variant="ghost" size="sm" className="mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
              
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Shopping Cart
              </h1>
              <p className="text-muted-foreground">
                {cartItems.length === 0 
                  ? 'Your cart is empty' 
                  : `${getTotalItems()} ${getTotalItems() === 1 ? 'item' : 'items'} in your cart`
                }
              </p>
            </div>

            {cartItems.length === 0 && savedItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground mb-6">
                  Discover amazing products from our marketplace
                </p>
                <Link to="/marketplace">
                  <Button variant="apple">
                    Start Shopping
                  </Button>
                </Link>
              </div>
            ) : (
              <Tabs defaultValue="cart" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="cart">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Cart ({cartItems.length})
                  </TabsTrigger>
                  <TabsTrigger value="saved">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Saved for Later ({savedItems.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="cart">
                  <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                      {cartItems.map((item) => (
                        <Card key={item.id} className="glass-card">
                          <CardContent className="p-6">
                            <div className="flex gap-4">
                              <img 
                                src={item.products.image_url || '/placeholder.svg'} 
                                alt={item.products.name}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                              
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h3 className="font-semibold text-foreground">
                                      {item.products.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                      from {item.products.stores?.name}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItem(item.id)}
                                    className="text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                  {item.products.description}
                                </p>
                                
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                      disabled={item.quantity <= 1}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-8 text-center font-medium">
                                      {item.quantity}
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      disabled={item.quantity >= item.products.inventory_count}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  
                                  <div className="text-right">
                                    <div className="font-bold text-primary">
                                      {formatPrice(item.products.price * item.quantity)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {formatPrice(item.products.price)} each
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {item.products.inventory_count <= 5 && (
                                    <Badge variant="destructive">
                                      Only {item.products.inventory_count} left
                                    </Badge>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSaveForLater(item)}
                                  >
                                    <Bookmark className="h-4 w-4 mr-1" />
                                    Save for Later
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                      <Card className="glass-card sticky top-4">
                        <CardHeader>
                          <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between">
                            <span>Subtotal ({getTotalItems()} items)</span>
                            <span>{formatPrice(getTotalPrice())}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span>Shipping</span>
                            <span className="text-green-600">Free</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span>Tax</span>
                            <span>{formatPrice(getTotalPrice() * 0.08)}</span>
                          </div>
                          
                          <Separator />
                          
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>{formatPrice(getTotalPrice() * 1.08)}</span>
                          </div>
                          
                          <Button 
                            className="w-full" 
                            variant="apple" 
                            size="lg"
                            onClick={handleCheckout}
                            disabled={cartItems.length === 0}
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Proceed to Checkout
                          </Button>
                          
                          <p className="text-xs text-muted-foreground text-center">
                            Secure checkout with 256-bit SSL encryption
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="saved">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedItems.map((item) => (
                      <Card key={item.id} className="glass-card">
                        <div className="relative">
                          <img
                            src={item.products.image_url || '/placeholder.svg'}
                            alt={item.products.name}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                          {item.products.inventory_count === 0 && (
                            <Badge className="absolute top-2 right-2 bg-red-500">
                              Out of Stock
                            </Badge>
                          )}
                        </div>

                        <CardContent className="p-4">
                          <h3 className="font-medium text-foreground mb-2 line-clamp-2">
                            {item.products.name}
                          </h3>

                          <p className="text-lg font-bold text-primary mb-4">
                            {formatPrice(item.products.price)}
                          </p>

                          <div className="flex gap-2">
                            <Button
                              variant="apple"
                              size="sm"
                              className="flex-1"
                              onClick={() => moveToCart(item.id)}
                              disabled={item.products.inventory_count === 0}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Move to Cart
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeSavedItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </section>

        <Footer />

        <CheckoutDialog
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          cartItems={cartItems}
          totalAmount={getTotalPrice() * 1.08}
          userId={user?.id || ''}
        />
      </div>
    </ProtectedRoute>
  );
};

export default Cart;