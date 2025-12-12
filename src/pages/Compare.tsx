import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, X, ShoppingCart, Check, Minus, GitCompare } from 'lucide-react';
import { useProductComparison } from '@/hooks/useProductComparison';
import { useCart } from '@/hooks/useCart';
import SEOHead from '@/components/SEOHead';

const Compare = () => {
  const { compareProducts, removeFromCompare, clearCompare } = useProductComparison();
  const { addToCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(price);
  };

  const getLowestPrice = () => {
    if (compareProducts.length === 0) return null;
    return Math.min(...compareProducts.map(p => p.price));
  };

  const lowestPrice = getLowestPrice();

  if (compareProducts.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <GitCompare className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">No Products to Compare</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Add products to compare by clicking the compare button on product cards in the marketplace.
            </p>
            <Link to="/marketplace">
              <Button variant="apple">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const comparisonFields = [
    { key: 'price', label: 'Price', render: (p: typeof compareProducts[0]) => formatPrice(p.price) },
    { key: 'category', label: 'Category', render: (p: typeof compareProducts[0]) => p.category || 'N/A' },
    { key: 'store', label: 'Store', render: (p: typeof compareProducts[0]) => p.stores?.name || 'N/A' },
    { 
      key: 'availability', 
      label: 'Availability', 
      render: (p: typeof compareProducts[0]) => (
        <span className={p.inventory_count > 0 ? 'text-green-600' : 'text-destructive'}>
          {p.inventory_count > 0 ? `In Stock (${p.inventory_count})` : 'Out of Stock'}
        </span>
      ) 
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Compare Products"
        description="Compare products side by side to find the best option for you."
      />
      <Navigation />

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link to="/marketplace">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Marketplace
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Compare Products</h1>
                <p className="text-muted-foreground">
                  Comparing {compareProducts.length} products
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={clearCompare}>
              Clear All
            </Button>
          </div>

          {/* Product Cards Header */}
          <div className="overflow-x-auto">
            <div className="min-w-max">
              {/* Product Images & Names */}
              <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${compareProducts.length}, minmax(200px, 1fr))` }}>
                <div className="p-4" />
                {compareProducts.map((product) => (
                  <Card key={product.id} className="glass-card relative overflow-hidden">
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute top-2 right-2 z-10 bg-background/80 rounded-full p-1 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="relative">
                      <img
                        src={product.image_url || '/placeholder.svg'}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      {product.price === lowestPrice && compareProducts.length > 1 && (
                        <Badge className="absolute top-2 left-2 bg-green-600">
                          Best Price
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-2xl font-bold text-primary mb-4">
                        {formatPrice(product.price)}
                      </p>
                      <Button
                        variant="apple"
                        size="sm"
                        className="w-full"
                        onClick={() => addToCart(product.id, 1)}
                        disabled={product.inventory_count === 0}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {product.inventory_count === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Separator className="my-6" />

              {/* Comparison Table */}
              <div className="space-y-0">
                {comparisonFields.map((field, index) => (
                  <div
                    key={field.key}
                    className={`grid gap-4 py-4 ${index % 2 === 0 ? 'bg-muted/30' : ''}`}
                    style={{ gridTemplateColumns: `200px repeat(${compareProducts.length}, minmax(200px, 1fr))` }}
                  >
                    <div className="px-4 font-medium text-foreground flex items-center">
                      {field.label}
                    </div>
                    {compareProducts.map((product) => (
                      <div key={product.id} className="px-4 text-muted-foreground flex items-center">
                        {field.render(product)}
                      </div>
                    ))}
                  </div>
                ))}

                {/* Description Row */}
                <div
                  className="grid gap-4 py-4 bg-muted/30"
                  style={{ gridTemplateColumns: `200px repeat(${compareProducts.length}, minmax(200px, 1fr))` }}
                >
                  <div className="px-4 font-medium text-foreground">
                    Description
                  </div>
                  {compareProducts.map((product) => (
                    <div key={product.id} className="px-4 text-sm text-muted-foreground">
                      {product.description || 'No description available'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Compare;
