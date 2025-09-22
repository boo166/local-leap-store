import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, ExternalLink } from "lucide-react";
import localBusinessOwner from "@/assets/local-business-owner.jpg";
import sampleProducts from "@/assets/sample-products.jpg";

const StoreShowcase = () => {
  const stores = [
    {
      id: 1,
      name: "Mama Sarah's Textiles",
      owner: "Sarah Wanjiku",
      rating: 4.8,
      reviews: 124,
      location: "Nakuru, Kenya",
      category: "Textiles & Fashion",
      products: 45,
      image: localBusinessOwner,
      description: "Beautiful traditional African textiles and modern fashion pieces handcrafted with love."
    },
    {
      id: 2,
      name: "Kiprotich Crafts",
      owner: "John Kiprotich",
      rating: 4.9,
      reviews: 89,
      location: "Eldoret, Kenya",
      category: "Handicrafts",
      products: 32,
      image: sampleProducts,
      description: "Authentic Kenyan crafts, pottery, and traditional artifacts made by local artisans."
    },
    {
      id: 3,
      name: "Fresh Valley Produce",
      owner: "Mary Wangari",
      rating: 4.7,
      reviews: 156,
      location: "Meru, Kenya",
      category: "Fresh Produce",
      products: 28,
      image: localBusinessOwner,
      description: "Organic fresh produce directly from our family farm to your table."
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Featured Local Stores
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover amazing products from talented entrepreneurs in your community. 
            Support local businesses and find unique items you won't find anywhere else.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stores.map((store) => (
            <Card key={store.id} className="group hover:shadow-elegant transition-smooth cursor-pointer overflow-hidden">
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

                <Button variant="market" className="w-full">
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