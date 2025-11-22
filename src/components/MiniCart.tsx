import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, X, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MiniCartItem {
  id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string;
  };
}

interface MiniCartProps {
  onClose: () => void;
}

const MiniCart = ({ onClose }: MiniCartProps) => {
  const [cartItems, setCartItems] = useState<MiniCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchMiniCart();
  }, [user]);

  const fetchMiniCart = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products!cart_items_product_id_fkey(
            id,
            name,
            price,
            image_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error loading mini cart:', error);
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

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => 
      total + (item.products.price * item.quantity), 0
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-muted rounded"></div>
          <div className="h-16 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="p-6 text-center">
        <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">Your cart is empty</p>
        <Link to="/marketplace" onClick={onClose}>
          <Button variant="apple" className="w-full">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-80">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Shopping Cart</h3>
          <Badge variant="secondary">{getTotalItems()} items</Badge>
        </div>
      </div>

      <ScrollArea className="h-64">
        <div className="p-4 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-3">
              <img 
                src={item.products.image_url || '/placeholder.svg'} 
                alt={item.products.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">
                  {item.products.name}
                </h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    Qty: {item.quantity}
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    {formatPrice(item.products.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-medium">Subtotal</span>
          <span className="text-lg font-bold text-primary">
            {formatPrice(getTotalPrice())}
          </span>
        </div>

        <Link to="/cart" onClick={onClose}>
          <Button variant="apple" className="w-full">
            View Cart <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>

        <Link to="/marketplace" onClick={onClose}>
          <Button variant="outline" className="w-full">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default MiniCart;
