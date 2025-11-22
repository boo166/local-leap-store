import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    inventory_count: number;
    category: string;
    stores: {
      id: string;
      name: string;
    };
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, loading } = useCart();
  const { user } = useAuth();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <Link to={`/store/${product.stores.id}`}>
      <Card className="group hover-lift glass-card cursor-pointer overflow-hidden h-full flex flex-col">
        <div className="relative">
          <img 
            src={product.image_url || '/placeholder.svg'} 
            alt={product.name}
            className="w-full h-56 object-cover group-hover:scale-105 transition-smooth"
          />
          {product.category && (
            <Badge className="absolute top-3 left-3 bg-white/90 text-foreground">
              {product.category}
            </Badge>
          )}
          {product.inventory_count <= 5 && product.inventory_count > 0 && (
            <Badge variant="destructive" className="absolute top-3 right-3">
              Only {product.inventory_count} left
            </Badge>
          )}
          {product.inventory_count === 0 && (
            <Badge variant="destructive" className="absolute top-3 right-3">
              Out of Stock
            </Badge>
          )}
          
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center gap-2">
            <Button 
              size="sm" 
              variant="secondary"
              className="glass"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="secondary"
              className="glass"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <CardContent className="p-5 flex-1 flex flex-col">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">
              {product.stores.name}
            </p>
            <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 min-h-[3.5rem]">
              {product.name}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {product.description}
            </p>
          </div>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="text-2xl font-bold text-primary">
              {formatPrice(product.price)}
            </div>
            
            {user && product.inventory_count > 0 && (
              <Button 
                size="sm" 
                variant="apple"
                onClick={handleAddToCart}
                disabled={loading}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;
