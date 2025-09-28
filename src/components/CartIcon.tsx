import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

const CartIcon = () => {
  const { cartCount } = useCart();

  return (
    <Link to="/cart">
      <Button variant="ghost" size="sm" className="relative">
        <ShoppingCart className="h-5 w-5" />
        {cartCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
            {cartCount > 99 ? '99+' : cartCount}
          </Badge>
        )}
      </Button>
    </Link>
  );
};

export default CartIcon;