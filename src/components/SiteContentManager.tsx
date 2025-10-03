import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, RefreshCw } from 'lucide-react';

const SiteContentManager = () => {
  const [heroContent, setHeroContent] = useState<any>(null);
  const [featuresContent, setFeaturesContent] = useState<any>(null);
  const [showcaseContent, setShowcaseContent] = useState<any>(null);
  const [ctaContent, setCtaContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllContent();
  }, []);

  const fetchAllContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('*');

      if (error) throw error;

      data?.forEach(item => {
        switch(item.section) {
          case 'hero':
            setHeroContent(item);
            break;
          case 'features':
            setFeaturesContent(item);
            break;
          case 'showcase':
            setShowcaseContent(item);
            break;
          case 'cta':
            setCtaContent(item);
            break;
        }
      });
    } catch (error: any) {
      toast({
        title: "Error loading content",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateContent = async (section: string, content: any) => {
    try {
      const { error } = await supabase
        .from('site_content')
        .update({ content })
        .eq('section', section);

      if (error) throw error;

      toast({
        title: "Content updated",
        description: `${section} section updated successfully.`,
      });

      fetchAllContent();
    } catch (error: any) {
      toast({
        title: "Error updating content",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading site content...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="hero" className="space-y-4">
      <TabsList>
        <TabsTrigger value="hero">Hero Section</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
        <TabsTrigger value="showcase">Store Showcase</TabsTrigger>
        <TabsTrigger value="cta">Call to Action</TabsTrigger>
      </TabsList>

      {/* Hero Section */}
      <TabsContent value="hero">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Hero Section Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {heroContent && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const content = {
                  title: formData.get('title'),
                  titleHighlight: formData.get('titleHighlight'),
                  description: formData.get('description'),
                  stats: {
                    stores: {
                      value: formData.get('storesValue'),
                      label: formData.get('storesLabel')
                    },
                    customers: {
                      value: formData.get('customersValue'),
                      label: formData.get('customersLabel')
                    },
                    growth: {
                      value: formData.get('growthValue'),
                      label: formData.get('growthLabel')
                    }
                  }
                };
                updateContent('hero', content);
              }}>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="title">Main Title</Label>
                    <Input id="title" name="title" defaultValue={heroContent.content.title} />
                  </div>
                  <div>
                    <Label htmlFor="titleHighlight">Highlighted Title</Label>
                    <Input id="titleHighlight" name="titleHighlight" defaultValue={heroContent.content.titleHighlight} />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" defaultValue={heroContent.content.description} rows={3} />
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Stores Stat</Label>
                      <Input name="storesValue" defaultValue={heroContent.content.stats.stores.value} placeholder="Value" />
                      <Input name="storesLabel" defaultValue={heroContent.content.stats.stores.label} placeholder="Label" />
                    </div>
                    <div className="space-y-2">
                      <Label>Customers Stat</Label>
                      <Input name="customersValue" defaultValue={heroContent.content.stats.customers.value} placeholder="Value" />
                      <Input name="customersLabel" defaultValue={heroContent.content.stats.customers.label} placeholder="Label" />
                    </div>
                    <div className="space-y-2">
                      <Label>Growth Stat</Label>
                      <Input name="growthValue" defaultValue={heroContent.content.stats.growth.value} placeholder="Value" />
                      <Input name="growthLabel" defaultValue={heroContent.content.stats.growth.label} placeholder="Label" />
                    </div>
                  </div>
                </div>
                
                <Button type="submit" className="mt-4">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Features Section */}
      <TabsContent value="features">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Features Section Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {featuresContent && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateContent('features', {
                  title: formData.get('title'),
                  subtitle: formData.get('subtitle'),
                  items: featuresContent.content.items
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Section Title</Label>
                    <Input id="title" name="title" defaultValue={featuresContent.content.title} />
                  </div>
                  <div>
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Textarea id="subtitle" name="subtitle" defaultValue={featuresContent.content.subtitle} rows={2} />
                  </div>
                </div>
                
                <Button type="submit" className="mt-4">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Showcase Section */}
      <TabsContent value="showcase">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Store Showcase Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {showcaseContent && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateContent('showcase', {
                  title: formData.get('title'),
                  subtitle: formData.get('subtitle')
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Section Title</Label>
                    <Input id="title" name="title" defaultValue={showcaseContent.content.title} />
                  </div>
                  <div>
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Textarea id="subtitle" name="subtitle" defaultValue={showcaseContent.content.subtitle} rows={2} />
                  </div>
                </div>
                
                <Button type="submit" className="mt-4">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* CTA Section */}
      <TabsContent value="cta">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Call to Action Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ctaContent && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const benefits = [];
                for (let i = 0; i < 5; i++) {
                  const benefit = formData.get(`benefit${i}`);
                  if (benefit) benefits.push(benefit);
                }
                updateContent('cta', {
                  title: formData.get('title'),
                  subtitle: formData.get('subtitle'),
                  benefits,
                  disclaimer: formData.get('disclaimer')
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Section Title</Label>
                    <Input id="title" name="title" defaultValue={ctaContent.content.title} />
                  </div>
                  <div>
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Textarea id="subtitle" name="subtitle" defaultValue={ctaContent.content.subtitle} rows={2} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Benefits (5 items)</Label>
                    {ctaContent.content.benefits.map((benefit: string, index: number) => (
                      <Input 
                        key={index} 
                        name={`benefit${index}`} 
                        defaultValue={benefit}
                        placeholder={`Benefit ${index + 1}`}
                      />
                    ))}
                  </div>

                  <div>
                    <Label htmlFor="disclaimer">Disclaimer Text</Label>
                    <Input id="disclaimer" name="disclaimer" defaultValue={ctaContent.content.disclaimer} />
                  </div>
                </div>
                
                <Button type="submit" className="mt-4">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default SiteContentManager;
