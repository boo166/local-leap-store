import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Trash2, ArrowLeft, Share2 } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import ProtectedRoute from '@/components/ProtectedRoute';
import SEOHead from '@/components/SEOHead';
import { useToast } from '@/hooks/use-toast';

const Wishlist = () => {
  const { wishlist, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleAddToCart = async (productId: string, productName: string) => {
    await addToCart(productId);
    toast({
      title: "Added to cart",
      description: `${productName} has been added to your cart.`,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Wishlist',
        text: 'Check out my wishlist!',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Wishlist link copied to clipboard!",
      });
    }
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
                <p className="text-muted-foreground">Loading wishlist...</p>
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
        <SEOHead
          title="My Wishlist - Saved Products"
          description="View and manage your saved favorite products. Shop your wishlist and get notified of price drops."
          keywords={['wishlist', 'saved products', 'favorites']}
          noindex={true}
        />
        <Navigation />

        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <Link to="/marketplace">
                  <Button variant="ghost" size="sm" className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Marketplace
                  </Button>
                </Link>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  My Wishlist
                </h1>
                <p className="text-muted-foreground">
                  {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
                </p>
              </div>
              {wishlist.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Wishlist
                </Button>
              )}
            </div>

            {wishlist.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="text-center py-12">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
                  <p className="text-muted-foreground mb-6">
                    Start adding products you love to your wishlist
                  </p>
                  <Link to="/marketplace">
                    <Button variant="apple">
                      Browse Products
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlist.map((item) => (
                  <Card key={item.id} className="glass-card group hover-lift">
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
                      <Link to={`/store/${item.products.stores.name}`}>
                        <p className="text-xs text-muted-foreground mb-1">
                          {item.products.stores.name}
                        </p>
                      </Link>

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
                          onClick={() => handleAddToCart(item.product_id, item.products.name)}
                          disabled={item.products.inventory_count === 0}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromWishlist(item.product_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Wishlist;
