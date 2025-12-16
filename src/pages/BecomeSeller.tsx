import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import {
  Store,
  Package,
  TrendingUp,
  Shield,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Users,
  CreditCard,
  BarChart3,
} from 'lucide-react';

const BecomeSeller = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { hasRole, loading: roleLoading } = useUserRole();
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Redirect if already a seller
  useEffect(() => {
    if (!roleLoading && hasRole('seller')) {
      navigate('/dashboard');
    }
  }, [hasRole, roleLoading, navigate]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !roleLoading) {
      navigate('/auth');
    }
  }, [user, roleLoading, navigate]);

  const handleBecomeSeller = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setIsUpgrading(true);
    try {
      // Add seller role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{ user_id: user.id, role: 'seller' }]);

      if (roleError) throw roleError;

      // Get free trial plan
      const { data: freePlan } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('name', 'Free Trial')
        .eq('is_active', true)
        .maybeSingle();

      if (freePlan) {
        // Create trial subscription
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 7);

        await supabase
          .from('user_subscriptions')
          .insert([{
            user_id: user.id,
            plan_id: freePlan.id,
            status: 'trial',
            trial_start_date: new Date().toISOString(),
            trial_end_date: trialEndDate.toISOString(),
          }]);
      }

      toast({
        title: "Welcome, Seller!",
        description: "Your 7-day free trial has started. Let's create your store!",
      });

      // Redirect to create store
      navigate('/create-store');
    } catch (error: any) {
      console.error('Error upgrading to seller:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upgrade account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const benefits = [
    {
      icon: Store,
      title: "Your Own Store",
      description: "Create a beautiful, customizable storefront for your products",
    },
    {
      icon: Package,
      title: "Easy Product Management",
      description: "Add, edit, and manage your products with our intuitive tools",
    },
    {
      icon: TrendingUp,
      title: "Analytics Dashboard",
      description: "Track your sales, views, and customer behavior in real-time",
    },
    {
      icon: BarChart3,
      title: "Order Management",
      description: "Manage orders, shipping, and customer communication",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Receive payments securely with our trusted payment system",
    },
    {
      icon: Users,
      title: "Growing Community",
      description: "Join thousands of sellers reaching millions of customers",
    },
  ];

  const trialFeatures = [
    "Create your store",
    "List up to 10 products",
    "Access to basic analytics",
    "Order management tools",
    "Customer messaging",
    "7 days completely free",
  ];

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="glass rounded-xl p-8">
            <div className="animate-pulse text-center space-y-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full mx-auto animate-bounce"></div>
              <p className="text-muted-foreground">Loading...</p>
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
        title="Become a Seller - Start Your Business on GlassStore"
        description="Join GlassStore as a seller and start your online business today. Get a 7-day free trial with full access to all selling tools."
        keywords={['sell online', 'become a seller', 'start business', 'online store']}
      />
      <Navigation />

      <main>
        {/* Hero Section */}
        <section className="py-16 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="max-w-6xl mx-auto text-center">
            <Badge className="mb-4" variant="secondary">
              <Sparkles className="h-3 w-3 mr-1" />
              7-Day Free Trial
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Start Selling on GlassStore
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Turn your passion into profit. Create your store, list your products, 
              and reach thousands of customers today.
            </p>
            <Button
              variant="apple"
              size="lg"
              onClick={handleBecomeSeller}
              disabled={isUpgrading}
              className="text-lg px-8 py-6"
            >
              {isUpgrading ? 'Setting up...' : 'Start Free Trial'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • Cancel anytime
            </p>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Everything You Need to Succeed
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="glass-card hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                    <CardDescription>{benefit.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Free Trial Card */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <Card className="glass-card border-primary/20">
              <CardHeader className="text-center">
                <Badge className="w-fit mx-auto mb-4" variant="secondary">
                  Limited Time Offer
                </Badge>
                <CardTitle className="text-3xl">7-Day Free Trial</CardTitle>
                <CardDescription className="text-lg">
                  Try all seller features with no commitment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold mb-4">What's included:</h4>
                    <ul className="space-y-3">
                      {trialFeatures.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary mb-2">$0</div>
                      <p className="text-muted-foreground mb-6">for 7 days</p>
                      <Button
                        variant="apple"
                        size="lg"
                        className="w-full"
                        onClick={handleBecomeSeller}
                        disabled={isUpgrading}
                      >
                        {isUpgrading ? 'Setting up...' : 'Get Started Now'}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-4">
                        After trial, choose a plan starting from $9.99/month
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Selling?</h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of successful sellers on GlassStore
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="apple"
                size="lg"
                onClick={handleBecomeSeller}
                disabled={isUpgrading}
              >
                {isUpgrading ? 'Setting up...' : 'Become a Seller'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/marketplace')}
              >
                Explore Marketplace
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BecomeSeller;
