import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Store, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const EditStore = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    location: '',
    image_url: '',
    is_active: true
  });

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

  useEffect(() => {
    fetchStore();
  }, [storeId]);

  const fetchStore = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          name: data.name,
          description: data.description || '',
          category: data.category || '',
          location: data.location || '',
          image_url: data.image_url || '',
          is_active: data.is_active
        });
      }
    } catch (error: any) {
      toast({
        title: "Error loading store",
        description: error.message,
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('stores')
        .update(formData)
        .eq('id', storeId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Store updated!",
        description: "Your store has been successfully updated.",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error updating store",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', storeId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Store deleted",
        description: "Your store has been permanently deleted.",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error deleting store",
        description: error.message,
        variant: "destructive",
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
                <p className="text-muted-foreground">Loading store...</p>
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
        <Navigation />
        
        <section className="py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Store className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Edit Store</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Update your store information
                      </p>
                    </div>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Store?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your store
                          and all associated products.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive">
                          Delete Store
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex items-center justify-between space-x-2 p-4 bg-secondary/20 rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="is_active" className="text-base">Store Status</Label>
                      <p className="text-sm text-muted-foreground">
                        {formData.is_active ? 'Store is visible to customers' : 'Store is hidden from customers'}
                      </p>
                    </div>
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                  </div>

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

                  <div className="space-y-2">
                    <Label htmlFor="image_url">Store Image URL</Label>
                    <Input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                    {formData.image_url && (
                      <div className="mt-2">
                        <img 
                          src={formData.image_url} 
                          alt="Store preview"
                          className="w-full h-48 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      </div>
                    )}
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
                      disabled={saving}
                      className="flex-1"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
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

export default EditStore;