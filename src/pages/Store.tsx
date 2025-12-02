import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Star, 
  MapPin, 
  Store as StoreIcon, 
  ShoppingCart, 
  ArrowLeft,
  Heart,
  Share2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import SEOHead from '@/components/SEOHead';
import WishlistButton from '@/components/WishlistButton';
import StoreReviews from '@/components/StoreReviews';

interface StoreData {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  image_url: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  inventory_count: number;
}

const Store = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    if (storeId) {
      fetchStoreData();
    }
  }, [storeId]);

  const fetchStoreData = async () => {
    try {
      // Fetch store details
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select(`
          *,
          profiles!stores_user_id_fkey(full_name, avatar_url)
        `)
        .eq('id', storeId)
        .eq('is_active', true)
        .single();

      if (storeError) {
        throw storeError;
      }

      setStore(storeData);

      // Fetch store products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (productsError) {
        throw productsError;
      }

      setProducts(productsData || []);
    } catch (error: any) {
      toast({
        title: "Error loading store",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId, 1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="glass rounded-xl p-8">
            <div className="animate-pulse text-center space-y-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full mx-auto animate-bounce"></div>
              <p className="text-muted-foreground">Loading store...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Store not found</h1>
            <p className="text-muted-foreground mb-6">
              The store you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/marketplace">
              <Button variant="apple">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Marketplace
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${store.name} - Shop Local Products`}
        description={store.description || `Discover unique products from ${store.name}. Shop local and support small businesses.`}
        keywords={[store.name, store.category, 'local store', 'shop local', store.location || 'marketplace']}
        ogType="product"
        ogImage={store.image_url}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Store",
          "name": store.name,
          "description": store.description,
          "image": store.image_url,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": store.location
          }
        }}
      />
      <Navigation />
      
      {/* Store Header */}
      <section className="relative">
        <div className="h-64 bg-gradient-apple relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <img 
            src={store.image_url || '/placeholder.svg'} 
            alt={store.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 mb-8">
            <Link to="/marketplace">
              <Button variant="ghost" size="sm" className="glass text-white hover:bg-white/20 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Marketplace
              </Button>
            </Link>
            
            <Card className="glass-card">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={store.profiles?.avatar_url} />
                    <AvatarFallback className="text-xl font-bold">
                      {store.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                          {store.name}
                        </h1>
                        <p className="text-muted-foreground">
                          by {store.profiles?.full_name || 'Unknown'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4 md:mt-0">
                        <Button variant="outline" size="sm">
                          <Heart className="h-4 w-4 mr-2" />
                          Follow
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="font-medium">4.8</span>
                        <span className="text-muted-foreground ml-1">(124 reviews)</span>
                      </div>
                      
                      {store.location && (
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1" />
                          {store.location}
                        </div>
                      )}
                      
                      {store.category && (
                        <Badge variant="secondary">
                          {store.category}
                        </Badge>
                      )}
                      
                      <div className="flex items-center text-muted-foreground">
                        <StoreIcon className="h-4 w-4 mr-1" />
                        {products.length} products
                      </div>
                    </div>
                    
                    {store.description && (
                      <p className="text-muted-foreground leading-relaxed">
                        {store.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Products ({products.length})
            </h2>
            <Separator />
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <StoreIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No products yet</h3>
              <p className="text-muted-foreground">
                This store hasn't added any products yet. Check back later!
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="group hover-lift glass-card overflow-hidden">
                  <div className="relative">
                    <img 
                      src={product.image_url || '/placeholder.svg'} 
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-smooth"
                    />
                    {product.category && (
                      <Badge className="absolute top-2 left-2 bg-white/90 text-foreground text-xs">
                        {product.category}
                      </Badge>
                    )}
                    {product.inventory_count <= 5 && product.inventory_count > 0 && (
                      <Badge className="absolute top-2 right-2 bg-destructive text-xs">
                        Only {product.inventory_count} left
                      </Badge>
                    )}
                    <div className="absolute top-2 right-2">
                      <WishlistButton productId={product.id} variant="icon" />
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-1">
                      {product.name}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {product.description || 'No description available.'}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {product.inventory_count > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    
                    <Button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={product.inventory_count === 0}
                      variant="apple"
                      size="sm"
                      className="w-full"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {product.inventory_count === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Store Reviews Section */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StoreReviews
            storeId={store.id}
            storeName={store.name}
          />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Store;