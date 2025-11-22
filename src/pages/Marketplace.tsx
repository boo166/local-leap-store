import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Star, MapPin, ExternalLink, Search, Filter, Grid3x3, Store as StoreIcon, SlidersHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '@/components/ProductCard';
import SEOHead from '@/components/SEOHead';

interface Store {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  image_url: string;
  profiles: {
    full_name: string;
  };
  product_count?: number;
}

interface Product {
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
}

const Marketplace = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [viewMode, setViewMode] = useState<'stores' | 'products'>('products');
  const { toast } = useToast();

  const categories = [
    'all',
    'Tech & Accessories',
    'Design & Lifestyle', 
    'Home & Decor',
    'Fashion',
    'Electronics',
    'Books & Media',
    'Health & Beauty',
    'Sports & Fitness'
  ];

  const locations = [
    'all',
    'San Francisco, CA',
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Austin, TX',
    'Seattle, WA'
  ];

  useEffect(() => {
    fetchStores();
    fetchProducts();
  }, []);

  useEffect(() => {
    filterStores();
  }, [stores, searchTerm, selectedCategory, selectedLocation]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, sortBy, priceRange]);

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select(`
          *,
          profiles!stores_user_id_fkey(full_name),
          products(id)
        `)
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      const storesWithCounts = data?.map(store => ({
        ...store,
        product_count: store.products?.length || 0
      })) || [];

      setStores(storesWithCounts);
    } catch (error: any) {
      toast({
        title: "Error loading stores",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          stores!products_store_id_fkey(id, name)
        `)
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      const prices = data?.map(p => p.price) || [0];
      const max = Math.max(...prices, 1000);
      setMaxPrice(max);
      setPriceRange([0, max]);
      setProducts(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading products",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterStores = () => {
    let filtered = stores;

    if (searchTerm) {
      filtered = filtered.filter(store =>
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(store => store.category === selectedCategory);
    }

    if (selectedLocation && selectedLocation !== 'all') {
      filtered = filtered.filter(store => store.location === selectedLocation);
    }

    setFilteredStores(filtered);
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.stores?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="glass rounded-xl p-8">
            <div className="animate-pulse text-center space-y-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full mx-auto animate-bounce"></div>
              <p className="text-muted-foreground">Loading marketplace...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Marketplace - Discover Local Stores & Products"
        description="Browse unique products from talented local creators and businesses. Shop handmade crafts, artisanal goods, and more from verified sellers."
        keywords={['marketplace', 'local stores', 'handmade products', 'artisan goods', 'shop local', 'small business']}
      />
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-apple py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Discover Amazing Stores
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Explore unique products from talented creators and support local businesses
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search stores, products, or creators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass border-white/20"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'products' ? 'apple' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('products')}
                >
                  <Grid3x3 className="h-4 w-4 mr-2" />
                  Products
                </Button>
                <Button
                  variant={viewMode === 'stores' ? 'apple' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('stores')}
                >
                  <StoreIcon className="h-4 w-4 mr-2" />
                  Stores
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 glass border-white/20">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {viewMode === 'stores' && (
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-48 glass border-white/20">
                    <MapPin className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>
                        {location === 'all' ? 'All Locations' : location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {viewMode === 'products' && (
                <>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48 glass border-white/20">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="name">Name: A to Z</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="glass border-white/20 rounded-md px-4 py-2 min-w-[200px]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Price Range</span>
                      <span className="text-sm font-medium">${priceRange[0]} - ${priceRange[1]}</span>
                    </div>
                    <Slider
                      min={0}
                      max={maxPrice}
                      step={10}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="w-full"
                    />
                  </div>
                </>
              )}

              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedLocation('all');
                  setSortBy('newest');
                  setPriceRange([0, maxPrice]);
                }}
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {viewMode === 'products' 
                ? `${filteredProducts.length} ${filteredProducts.length === 1 ? 'Product' : 'Products'} Found`
                : `${filteredStores.length} ${filteredStores.length === 1 ? 'Store' : 'Stores'} Found`
              }
            </h2>
            <p className="text-muted-foreground">
              {searchTerm && `Results for "${searchTerm}"`}
              {selectedCategory !== 'all' && ` in ${selectedCategory}`}
              {viewMode === 'stores' && selectedLocation !== 'all' && ` located in ${selectedLocation}`}
            </p>
          </div>

          {viewMode === 'products' ? (
            filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or browse all categories
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSortBy('newest');
                    setPriceRange([0, maxPrice]);
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )
          ) : (
            filteredStores.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No stores found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or browse all categories
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedLocation('all');
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredStores.map((store) => (
                  <Card key={store.id} className="group hover-lift glass-card cursor-pointer overflow-hidden">
                    <div className="relative">
                      <img 
                        src={store.image_url || '/placeholder.svg'} 
                        alt={`${store.name} store`}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-smooth"
                      />
                      {store.category && (
                        <Badge className="absolute top-4 left-4 bg-white/90 text-foreground">
                          {store.category}
                        </Badge>
                      )}
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-foreground mb-1">
                            {store.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            by {store.profiles?.full_name || 'Unknown'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">4.8</span>
                          <span className="text-xs text-muted-foreground">(124)</span>
                        </div>
                      </div>

                      <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-2">
                        {store.description || 'A unique store offering quality products.'}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1" />
                          {store.location || 'Location not specified'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {store.product_count} products
                        </div>
                      </div>

                      <Link to={`/store/${store.id}`}>
                        <Button variant="apple" className="w-full">
                          Visit Store
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Marketplace;