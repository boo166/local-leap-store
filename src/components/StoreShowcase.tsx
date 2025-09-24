import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import localBusinessOwner from "@/assets/apple-business-owner.jpg";
import sampleProducts from "@/assets/apple-products.jpg";

const StoreShowcase = () => {
  const stores = [
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
      description: "Premium tech accessories and modern gadgets designed with Apple-quality craftsmanship and attention to detail."
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
      description: "Curated collection of minimalist products inspired by modern design principles and clean aesthetics."
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
      description: "Beautiful glass and modern home decor pieces that bring light and elegance to any space."
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Featured Design Stores
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover premium products from talented creators who share Apple's passion for beautiful design. 
            Support innovative businesses and find unique items crafted with precision and care.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stores.map((store) => (
            <Card key={store.id} className="group hover-lift glass-card cursor-pointer overflow-hidden">
              <div className="relative">
                <img 
                  src={store.image} 
                  alt={`${store.name} - ${store.description}`}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-smooth"
                />
                <Badge className="absolute top-4 left-4 bg-white/90 text-foreground">
                  {store.category}
                </Badge>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-1">
                      {store.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">by {store.owner}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{store.rating}</span>
                    <span className="text-xs text-muted-foreground">({store.reviews})</span>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {store.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {store.location}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {store.products} products
                  </div>
                </div>

                <Link to="/marketplace">
                  <Button variant="apple" className="w-full">
                    Visit Store
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/marketplace">
            <Button variant="outline" size="lg">
              View All Stores
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default StoreShowcase;