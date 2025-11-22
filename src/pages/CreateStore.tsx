import React, { useState, useRef } from 'react';
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
import { ArrowLeft, Store, AlertTriangle, Crown, Upload, Image as ImageIcon, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useStoreImageUpload } from '@/hooks/useStoreImageUpload';
import ProtectedRoute from '@/components/ProtectedRoute';

const CreateStore = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const subscription = useSubscription();
  const { uploadStoreImage, uploading } = useStoreImageUpload();
  const [loading, setLoading] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    location: '',
    image_url: '',
    logo_url: '',
    phone: '',
    email: '',
    website: '',
    instagram: '',
    facebook: '',
    twitter: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  const categories = [
    'Tech & Accessories',
    'Design & Lifestyle',
    'Vintage & Apparel',
    'Food & Beverage',
    'Home & Garden',
    'Beauty & Wellness',
    'Sports & Outdoors',
    'Art & Crafts',
    'Books & Media',
    'Other'
  ];

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const url = await uploadStoreImage(file, user.id, 'banner');
    if (url) {
      setFormData({ ...formData, image_url: url });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const url = await uploadStoreImage(file, user.id, 'logo');
    if (url) {
      setFormData({ ...formData, logo_url: url });
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a store.",
        variant: "destructive",
      });
      return;
    }

    if (!subscription.hasActiveSubscription) {
      toast({
        title: "Subscription required",
        description: "You need an active subscription to create a store.",
        variant: "destructive",
      });
      navigate('/subscription');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('stores')
        .insert({
          user_id: user.id,
          ...formData,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Store created!",
        description: "Your store has been successfully created.",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error creating store",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Store className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Create Your Store</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start selling your products to customers worldwide
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {!subscription.loading && !subscription.hasActiveSubscription && (
                  <Alert className="mb-6 border-orange-500/50 bg-orange-500/10">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>You need an active subscription to create a store.</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/subscription')}
                        className="ml-4"
                      >
                        <Crown className="h-3 w-3 mr-1" />
                        View Plans
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
                      <Label htmlFor="name">Store Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your store name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Tell customers about your store..."
                        rows={4}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
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

                      <div className="space-y-2">
                        <Label htmlFor="location">Location *</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="City, Country"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Branding */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Branding</h3>
                    <Separator />
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Store Banner</Label>
                        <div className="border-2 border-dashed rounded-lg p-4 hover:border-primary/50 transition-colors">
                          <input
                            ref={bannerInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleBannerUpload}
                            className="hidden"
                          />
                          {formData.image_url ? (
                            <div className="relative">
                              <img 
                                src={formData.image_url} 
                                alt="Banner preview"
                                className="w-full h-32 object-cover rounded"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => setFormData({ ...formData, image_url: '' })}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => bannerInputRef.current?.click()}
                              disabled={uploading}
                              className="w-full flex flex-col items-center justify-center py-6 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <ImageIcon className="h-8 w-8 mb-2" />
                              <span className="text-sm">Click to upload banner</span>
                              <span className="text-xs">Recommended: 1200x400px</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Store Logo</Label>
                        <div className="border-2 border-dashed rounded-lg p-4 hover:border-primary/50 transition-colors">
                          <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          {formData.logo_url ? (
                            <div className="relative">
                              <img 
                                src={formData.logo_url} 
                                alt="Logo preview"
                                className="w-32 h-32 object-cover rounded mx-auto"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => setFormData({ ...formData, logo_url: '' })}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => logoInputRef.current?.click()}
                              disabled={uploading}
                              className="w-full flex flex-col items-center justify-center py-6 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Upload className="h-8 w-8 mb-2" />
                              <span className="text-sm">Click to upload logo</span>
                              <span className="text-xs">Recommended: 400x400px</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Contact Information</h3>
                    <Separator />
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="store@example.com"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          type="url"
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          placeholder="https://www.example.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Social Media</h3>
                    <Separator />
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="instagram">Instagram</Label>
                        <Input
                          id="instagram"
                          value={formData.instagram}
                          onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                          placeholder="@yourstore"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="facebook">Facebook</Label>
                        <Input
                          id="facebook"
                          value={formData.facebook}
                          onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                          placeholder="facebook.com/yourstore"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="twitter">Twitter/X</Label>
                        <Input
                          id="twitter"
                          value={formData.twitter}
                          onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                          placeholder="@yourstore"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Search Tags</h3>
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (max 10)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="tags"
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
                      <div className="flex flex-wrap gap-2 mt-2">
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
                      disabled={loading || uploading || !subscription.hasActiveSubscription}
                      className="flex-1"
                    >
                      {loading || uploading ? 'Creating...' : !subscription.hasActiveSubscription ? 'Subscription Required' : 'Create Store'}
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

export default CreateStore;
