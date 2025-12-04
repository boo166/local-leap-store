import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
  product_id: string;
  quantity: number;
  products: {
    name: string;
    is_active: boolean;
  };
}

interface QuickReorderProps {
  orderItems: OrderItem[];
  disabled?: boolean;
}

const QuickReorder: React.FC<QuickReorderProps> = ({ orderItems, disabled }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  const handleReorder = async () => {
    setLoading(true);
    try {
      const activeItems = orderItems.filter(item => item.products?.is_active !== false);
      
      if (activeItems.length === 0) {
        toast({
          title: "Cannot reorder",
          description: "None of the products in this order are currently available.",
          variant: "destructive",
        });
        return;
      }

      for (const item of activeItems) {
        await addToCart(item.product_id, item.quantity);
      }

      const skippedCount = orderItems.length - activeItems.length;
      
      toast({
        title: "Added to cart!",
        description: skippedCount > 0 
          ? `${activeItems.length} items added. ${skippedCount} unavailable items were skipped.`
          : `${activeItems.length} items have been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add items to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleReorder}
      disabled={disabled || loading}
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Adding...' : 'Reorder'}
    </Button>
  );
};

export default QuickReorder;
