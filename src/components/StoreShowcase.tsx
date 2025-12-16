import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, ArrowRight, Verified } from "lucide-react";
import { Link } from "react-router-dom";
import localBusinessOwner from "@/assets/apple-business-owner.jpg";
import sampleProducts from "@/assets/apple-products.jpg";
import { supabase } from "@/integrations/supabase/client";

const StoreShowcase = () => {
  const [content, setContent] = useState<any>(null);
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    fetchContent();
    fetchStores();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from('site_content')
      .select('content')
      .eq('section', 'showcase')
      .maybeSingle();
    
    if (data) setContent(data.content);
  };

  const fetchStores = async () => {
    const { data } = await supabase
      .from('stores')
      .select(`
        *,
        profiles!stores_user_id_fkey(full_name),
        products(id)
      `)
      .eq('is_active', true)
      .limit(3);
    
    if (data) {
      const storesWithCounts = data.map(store => ({
        ...store,
        owner: store.profiles?.full_name || 'Unknown',
        rating: 4.8,
        reviews: 150,
        product_count: store.products?.length || 0,
        image: store.image_url || localBusinessOwner
      }));
      setStores(storesWithCounts);
    }
  };

  const defaultStores = [
    {
      id: 1,
      name: "TechCraft Studio",
      owner: "Sarah Chen",
      rating: 4.9,
      reviews: 287,
      location: "San Francisco, CA",
      category: "Tech & Accessories",
      products: 64,
      image: localBusinessOwner,
      description: "Premium tech accessories and modern gadgets with Apple-quality craftsmanship."
    },
    {
      id: 2,
      name: "Minimal Design Co",
      owner: "Alex Johnson",
      rating: 4.8,
      reviews: 198,
      location: "New York, NY",
      category: "Design & Lifestyle",
      products: 42,
      image: sampleProducts,
      description: "Curated collection of minimalist products inspired by modern design."
    },
    {
      id: 3,
      name: "Glass & Light",
      owner: "Maria Rodriguez",
      rating: 4.7,
      reviews: 156,
      location: "Los Angeles, CA",
      category: "Home & Decor",
      products: 38,
      image: localBusinessOwner,
      description: "Beautiful glass and modern home decor pieces for elegant spaces."
    }
  ];

  const displayStores = stores.length > 0 ? stores : defaultStores;

  return (
    <section className="py-32 bg-background relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
            Featured Stores
          </span>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-6 tracking-tight">
            {content?.title || 'Discover Amazing Stores'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {content?.subtitle || 'Explore premium products from talented creators around the world.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayStores.map((store, index) => (
            <Card 
              key={store.id} 
              className="group bg-card border-border/50 hover:border-primary/30 hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={store.image} 
                  alt={store.name}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <Badge className="absolute top-4 left-4 bg-white/95 text-foreground backdrop-blur-sm font-medium">
                  {store.category}
                </Badge>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{store.rating}</span>
                      <span className="text-white/70 text-sm">({store.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-white/80">
                      <MapPin className="h-4 w-4" />
                      {store.location}
                    </div>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                      {store.name}
                    </h3>
                    <Verified className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">by {store.owner}</p>
                </div>

                <p className="text-muted-foreground text-sm mb-6 leading-relaxed line-clamp-2">
                  {store.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {store.product_count || store.products} products
                  </span>
                  <Link to={store.id ? `/store/${store.id}` : "/marketplace"}>
                    <Button 
                      size="sm" 
                      className="bg-gradient-primary text-white hover:opacity-90 group/btn"
                    >
                      Visit Store
                      <ArrowRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link to="/marketplace">
            <Button 
              variant="outline" 
              size="lg" 
              className="text-base px-8 h-12 border-2 hover:bg-secondary/50 group"
            >
              Explore All Stores
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default StoreShowcase;
