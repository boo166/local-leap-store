import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, ExternalLink } from "lucide-react";
import localBusinessOwner from "@/assets/egyptian-business-owner.jpg";
import sampleProducts from "@/assets/egyptian-crafts.jpg";

const StoreShowcase = () => {
  const stores = [
    {
      id: 1,
      name: "Cleopatra's Papyrus Art",
      owner: "Fatima El-Sayed",
      rating: 4.9,
      reviews: 187,
      location: "Cairo, Egypt",
      category: "Ancient Arts & Crafts",
      products: 52,
      image: localBusinessOwner,
      description: "Authentic Egyptian papyrus art and hieroglyphic paintings handcrafted using traditional methods."
    },
    {
      id: 2,
      name: "Pharaoh's Golden Treasures",
      owner: "Ahmed Hassan",
      rating: 4.8,
      reviews: 143,
      location: "Luxor, Egypt",
      category: "Jewelry & Gold",
      products: 38,
      image: sampleProducts,
      description: "Exquisite Egyptian jewelry inspired by ancient pharaohs, crafted with precious metals and stones."
    },
    {
      id: 3,
      name: "Nile Valley Spices",
      owner: "Yasmin Abdel Rahman",
      rating: 4.7,
      reviews: 201,
      location: "Alexandria, Egypt",
      category: "Spices & Herbs",
      products: 41,
      image: localBusinessOwner,
      description: "Premium Egyptian spices and aromatic herbs sourced from the fertile Nile Valley gardens."
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Featured Egyptian Artisans
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover authentic Egyptian crafts from talented artisans preserving ancient traditions. 
            Support local businesses and find unique treasures from the land of the pharaohs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stores.map((store) => (
            <Card key={store.id} className="group hover:shadow-pharaoh transition-smooth cursor-pointer overflow-hidden">
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

                <Button variant="nile" className="w-full">
                  Visit Store
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View All Stores
          </Button>
        </div>
      </div>
    </section>
  );
};

export default StoreShowcase;