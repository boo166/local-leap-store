import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, 
  Check, 
  Clock,
  Sparkles,
  Zap,
  Activity,
  CreditCard
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import PaymentSubmissionModal from '@/components/PaymentSubmissionModal';
import PaymentStatusCard from '@/components/PaymentStatusCard';
import UsageTracker from '@/components/UsageTracker';
import BillingHistory from '@/components/BillingHistory';
import PlanComparison from '@/components/PlanComparison';
import SEOHead from '@/components/SEOHead';

interface SubscriptionPlan {
  id: string;
  name: string;
  name_ar: string | null;
  price_monthly: number;
  price_yearly: number;
  max_products: number | null;
  has_analytics: boolean;
  has_support: boolean;
  features: any;
  currency: string;
}

interface UserSubscription {
  plan_id: string;
  status: string;
  billing_cycle: string;
  trial_start_date: string | null;
  trial_end_date: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  subscription_plans: SubscriptionPlan;
}

const Subscription = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch available plans
      const { data: plansData, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (plansError) throw plansError;
      setPlans(plansData || []);

      // Fetch current subscription
      const { data: subData, error: subError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq('user_id', user?.id)
        .single();

      if (subError && subError.code !== 'PGRST116') throw subError;
      setCurrentSubscription(subData);
    } catch (error: any) {
      toast({
        title: "Error loading subscription data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = () => {
    if (!currentSubscription?.current_period_end) return 0;
    const end = new Date(currentSubscription.current_period_end);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const formatPrice = (price: number, currency: string) => {
    return `${price} ${currency}`;
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
                <p className="text-muted-foreground">Loading subscription...</p>
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
        <SEOHead
          title="Subscription Plans - Choose Your Plan"
          description="Choose the perfect subscription plan for your business. Get more products, analytics, and support."
          keywords={['subscription', 'pricing', 'plans', 'business']}
          noindex={true}
        />
        <Navigation />
        
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Subscription Plans
              </h1>
              <p className="text-muted-foreground text-lg">
                Choose the perfect plan for your business needs
              </p>
            </div>

            <Tabs defaultValue="plans" className="space-y-8">
              <TabsList className="glass w-full justify-start">
                <TabsTrigger value="plans" className="flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  Plans
                </TabsTrigger>
                <TabsTrigger value="usage" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Usage
                </TabsTrigger>
                <TabsTrigger value="billing" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Billing History
                </TabsTrigger>
                <TabsTrigger value="comparison" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Compare Plans
                </TabsTrigger>
              </TabsList>

              <TabsContent value="plans" className="space-y-8">
            {/* Payment Status if any pending/rejected */}
            <PaymentStatusCard />

            {/* Current Subscription Status */}
            {currentSubscription && (
              <Card className="glass-card mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-accent" />
                        Current Plan: {currentSubscription.subscription_plans.name}
                      </CardTitle>
                      <CardDescription>
                        {currentSubscription.status === 'trial' && (
                          <span className="flex items-center gap-2 mt-2">
                            <Clock className="h-4 w-4" />
                            Trial expires in {getDaysRemaining()} days
                          </span>
                        )}
                        {currentSubscription.status === 'active' && (
                          <span className="flex items-center gap-2 mt-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Active until {new Date(currentSubscription.current_period_end!).toLocaleDateString()}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={currentSubscription.status === 'trial' ? 'secondary' : 'default'}
                      className="text-lg py-2 px-4"
                    >
                      {currentSubscription.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-accent" />
                      <span className="text-sm">
                        {currentSubscription.subscription_plans.max_products 
                          ? `Up to ${currentSubscription.subscription_plans.max_products} products`
                          : 'Unlimited products'}
                      </span>
                    </div>
                    {currentSubscription.subscription_plans.has_analytics && (
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-accent" />
                        <span className="text-sm">Advanced Analytics</span>
                      </div>
                    )}
                    {currentSubscription.subscription_plans.has_support && (
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Priority Support</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Billing Cycle Toggle */}
            <div className="flex justify-center mb-8">
              <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as 'monthly' | 'yearly')} className="w-auto">
                <TabsList className="glass">
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly">
                    Yearly
                    <Badge className="ml-2 bg-accent">Save 20%</Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Plans Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan) => {
                const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
                const isCurrentPlan = currentSubscription?.plan_id === plan.id;
                const isTrial = plan.name === 'Free Trial';

                return (
                  <Card 
                    key={plan.id} 
                    className={`glass-card hover-lift ${
                      isCurrentPlan ? 'border-2 border-primary' : ''
                    } ${isTrial ? 'opacity-75' : ''}`}
                  >
                    <CardHeader>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription>
                        <span className="text-3xl font-bold text-foreground">
                          {formatPrice(price, plan.currency)}
                        </span>
                        <span className="text-muted-foreground">
                          /{billingCycle === 'monthly' ? 'month' : 'year'}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>
                            {plan.max_products 
                              ? `Up to ${plan.max_products} products`
                              : 'Unlimited products'}
                          </span>
                        </li>
                        {plan.has_analytics && (
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span>Advanced Analytics</span>
                          </li>
                        )}
                        {plan.has_support && (
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span>Priority Support</span>
                          </li>
                        )}
                        {Array.isArray(plan.features) && plan.features.map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {isCurrentPlan ? (
                        <Button variant="outline" className="w-full" disabled>
                          Current Plan
                        </Button>
                      ) : isTrial ? (
                        <Button variant="outline" className="w-full" disabled>
                          Trial Period
                        </Button>
                      ) : (
                        <Button 
                          variant="apple" 
                          className="w-full"
                          onClick={() => handleSelectPlan(plan)}
                        >
                          Upgrade to {plan.name}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Payment Instructions */}
            <Card className="glass-card mt-12">
              <CardHeader>
                <CardTitle>Payment Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  To upgrade your subscription, please follow these steps:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Select your desired plan above</li>
                  <li>Send payment via Vodafone Cash to: <strong className="text-foreground">01234567890</strong></li>
                  <li>Take a screenshot of the payment confirmation</li>
                  <li>Submit the screenshot and transaction ID through our payment form</li>
                  <li>Your subscription will be activated within 24 hours after admin approval</li>
                </ol>
              </CardContent>
            </Card>
              </TabsContent>

              <TabsContent value="usage">
                <UsageTracker />
              </TabsContent>

              <TabsContent value="billing">
                <BillingHistory />
              </TabsContent>

              <TabsContent value="comparison">
                <PlanComparison />
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <Footer />

        {selectedPlan && (
          <PaymentSubmissionModal
            open={showPaymentModal}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedPlan(null);
            }}
            plan={selectedPlan}
            billingCycle={billingCycle}
            onSuccess={() => {
              fetchData();
              navigate('/subscription');
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Subscription;
