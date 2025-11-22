import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, AlertTriangle, Crown, Upload, X, Plus, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useProductImageUpload } from '@/hooks/useProductImageUpload';
import { LowStockAlert } from '@/components/LowStockAlert';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Store {
  id: string;
  name: string;
}

interface ProductVariant {
  name: string;
  value: string;
  priceAdjustment?: number;
}

const AddProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const subscription = useSubscription();
  const { uploadProductImage, uploading } = useProductImageUpload();
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [canAdd, setCanAdd] = useState<boolean | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [tagInput, setTagInput] = useState('');
  const [variantName, setVariantName] = useState('');
  const [variantValue, setVariantValue] = useState('');
  const [formData, setFormData] = useState({
    store_id: '',
    name: '',
    description: '',
    price: '',
    category: '',
    inventory_count: '',
    image_url: '',
    images: [] as string[],
    sku: '',
    tags: [] as string[],
    variants: [] as ProductVariant[],
    low_stock_threshold: '5',
    weight: '',
    dimensions: { length: '', width: '', height: '' }
  });

  useEffect(() => {
    fetchUserStores();
    checkProductLimit();
  }, [user]);

  const checkProductLimit = async () => {
    const allowed = await subscription.canAddProduct();
    setCanAdd(allowed);
  };

  const fetchUserStores = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setStores(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading stores",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const categories = [
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Sports',
    'Books',
    'Toys',
    'Food & Beverage',
    'Beauty',
    'Jewelry',
    'Art',
    'Other'
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const url = await uploadProductImage(files[i], user.id);
      if (url) urls.push(url);
    }

    if (urls.length > 0) {
      setFormData({
        ...formData,
        images: [...formData.images, ...urls],
        image_url: formData.image_url || urls[0]
      });
      toast({
        title: 'Images uploaded',
        description: `${urls.length} image(s) uploaded successfully`,
      });
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      images: newImages,
      image_url: newImages[0] || ''
    });
  };

  const addTag = () => {
    if (tagInput.trim() && formData.tags.length < 10) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== index) });
  };

  const addVariant = () => {
    if (variantName.trim() && variantValue.trim()) {
      setFormData({
        ...formData,
        variants: [...formData.variants, { name: variantName, value: variantValue }]
      });
      setVariantName('');
      setVariantValue('');
    }
  };

  const removeVariant = (index: number) => {
    setFormData({ ...formData, variants: formData.variants.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add products.",
        variant: "destructive",
      });
      return;
    }

    const allowed = await subscription.canAddProduct();
    if (!allowed) {
      toast({
        title: "Product limit reached",
        description: "Please upgrade your subscription to add more products.",
        variant: "destructive",
      });
      navigate('/subscription');
      return;
    }

    setLoading(true);
    try {
      const productData: TablesInsert<'products'> = {
        store_id: formData.store_id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        inventory_count: parseInt(formData.inventory_count),
        image_url: formData.image_url,
        images: formData.images as any,
        sku: formData.sku || null,
        tags: formData.tags,
        variants: formData.variants as any,
        low_stock_threshold: parseInt(formData.low_stock_threshold),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        dimensions: formData.dimensions.length ? (formData.dimensions as any) : null,
        is_active: true
      };

      const { error } = await supabase
        .from('products')
        .insert(productData);

      if (error) throw error;

      toast({
        title: "Product added!",
        description: "Your product has been successfully added.",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error adding product",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (stores.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navigation />
          <section className="py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="glass-card">
                <CardContent className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Store Found</h3>
                  <p className="text-muted-foreground mb-6">
                    You need to create a store before adding products
                  </p>
                  <Button variant="apple" onClick={() => navigate('/create-store')}>
                    Create Store
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>

            {formData.store_id && <LowStockAlert storeId={formData.store_id} />}

            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Add New Product</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add a new product to your store inventory
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {!subscription.loading && canAdd === false && (
                  <Alert className="mb-6 border-orange-500/50 bg-orange-500/10">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>You've reached your product limit. Upgrade to add more products.</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/subscription')}
                        className="ml-4"
                      >
                        <Crown className="h-3 w-3 mr-1" />
                        Upgrade
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="store_id">Select Store *</Label>
                      <Select
                        value={formData.store_id}
                        onValueChange={(value) => setFormData({ ...formData, store_id: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a store" />
                        </SelectTrigger>
                        <SelectContent>
                          {stores.map((store) => (
                            <SelectItem key={store.id} value={store.id}>
                              {store.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Product Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter product name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sku">SKU (Optional)</Label>
                        <Input
                          id="sku"
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          placeholder="PROD-001"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your product..."
                        rows={4}
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (USD) *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="0.00"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="inventory_count">Stock *</Label>
                        <Input
                          id="inventory_count"
                          type="number"
                          min="0"
                          value={formData.inventory_count}
                          onChange={(e) => setFormData({ ...formData, inventory_count: e.target.value })}
                          placeholder="0"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="low_stock_threshold">Low Stock Alert</Label>
                        <Input
                          id="low_stock_threshold"
                          type="number"
                          min="0"
                          value={formData.low_stock_threshold}
                          onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                          placeholder="5"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Product Images */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Product Images</h3>
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label>Upload Images (Max 5)</Label>
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={uploading || formData.images.length >= 5}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploading ? 'Uploading...' : 'Upload Images'}
                      </Button>
                      
                      {formData.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                          {formData.images.map((url, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={url} 
                                alt={`Product ${index + 1}`}
                                className="w-full h-32 object-cover rounded border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeImage(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              {index === 0 && (
                                <Badge className="absolute bottom-2 left-2">Primary</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Variants */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Product Variants</h3>
                    <Separator />
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <Input
                        placeholder="Variant name (e.g., Size)"
                        value={variantName}
                        onChange={(e) => setVariantName(e.target.value)}
                      />
                      <Input
                        placeholder="Value (e.g., Large)"
                        value={variantValue}
                        onChange={(e) => setVariantValue(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addVariant}
                        disabled={!variantName.trim() || !variantValue.trim()}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Variant
                      </Button>
                    </div>
                    
                    {formData.variants.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.variants.map((variant, index) => (
                          <Badge key={index} variant="secondary" className="gap-2">
                            {variant.name}: {variant.value}
                            <button
                              type="button"
                              onClick={() => removeVariant(index)}
                              className="hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Search Tags</h3>
                    <Separator />
                    
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Add tags for better discovery"
                        disabled={formData.tags.length >= 10}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addTag}
                        disabled={!tagInput.trim() || formData.tags.length >= 10}
                      >
                        Add
                      </Button>
                    </div>
                    
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(index)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Shipping Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Shipping Information (Optional)</h3>
                    <Separator />
                    
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="length">Length (cm)</Label>
                        <Input
                          id="length"
                          type="number"
                          min="0"
                          value={formData.dimensions.length}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            dimensions: { ...formData.dimensions, length: e.target.value }
                          })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="width">Width (cm)</Label>
                        <Input
                          id="width"
                          type="number"
                          min="0"
                          value={formData.dimensions.width}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            dimensions: { ...formData.dimensions, width: e.target.value }
                          })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height">Height (cm)</Label>
                        <Input
                          id="height"
                          type="number"
                          min="0"
                          value={formData.dimensions.height}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            dimensions: { ...formData.dimensions, height: e.target.value }
                          })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="apple"
                      disabled={loading || uploading || canAdd === false}
                      className="flex-1"
                    >
                      {loading || uploading ? 'Adding...' : canAdd === false ? 'Limit Reached' : 'Add Product'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default AddProduct;
