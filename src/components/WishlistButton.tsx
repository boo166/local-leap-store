import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  productId: string;
  variant?: 'default' | 'icon';
  className?: string;
}

const WishlistButton = ({ 
  productId, 
  variant = 'default',
  className 
}: WishlistButtonProps) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(productId);

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(productId);
        }}
        className={cn(
          "transition-colors",
          inWishlist && "text-red-500 hover:text-red-600",
          className
        )}
      >
        <Heart 
          className={cn(
            "h-5 w-5",
            inWishlist && "fill-current"
          )}
        />
      </Button>
    );
  }

  return (
    <Button
      variant={inWishlist ? "default" : "outline"}
      size="sm"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(productId);
      }}
      className={cn(
        "transition-colors",
        inWishlist && "bg-red-500 hover:bg-red-600",
        className
      )}
    >
      <Heart 
        className={cn(
          "h-4 w-4 mr-2",
          inWishlist && "fill-current"
        )}
      />
      {inWishlist ? 'Saved' : 'Save'}
    </Button>
  );
};

export default WishlistButton;
