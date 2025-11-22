import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface LowStockProduct {
  id: string;
  name: string;
  inventory_count: number;
  low_stock_threshold: number;
}

interface LowStockAlertProps {
  storeId: string;
}

export const LowStockAlert: React.FC<LowStockAlertProps> = ({ storeId }) => {
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowStockProducts();
  }, [storeId]);

  const fetchLowStockProducts = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_low_stock_products', { store_id_param: storeId });

      if (error) throw error;
      setLowStockProducts(data || []);
    } catch (error) {
      console.error('Error fetching low stock products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || lowStockProducts.length === 0) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Low Stock Alert</AlertTitle>
      <AlertDescription>
        <p className="mb-3">
          {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's are' : ' is'} running low on stock
        </p>
        <div className="space-y-2">
          {lowStockProducts.slice(0, 3).map((product) => (
            <div key={product.id} className="flex items-center justify-between p-2 bg-background/50 rounded">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="text-sm font-medium">{product.name}</span>
              </div>
              <Badge variant="destructive" className="text-xs">
                {product.inventory_count} left
              </Badge>
            </div>
          ))}
        </div>
        {lowStockProducts.length > 3 && (
          <p className="text-xs mt-2 text-muted-foreground">
            +{lowStockProducts.length - 3} more products
          </p>
        )}
        <Link to="/dashboard">
          <Button variant="outline" size="sm" className="mt-3">
            View All Products
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
};
