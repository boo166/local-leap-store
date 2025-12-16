import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Store, ShoppingCart, CreditCard, BarChart3, Users, Shield, Zap, Globe, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, any> = {
  Store, ShoppingCart, CreditCard, BarChart3, Users, Shield, Zap, Globe, Palette
};

const defaultFeatures = [
  {
    icon: Store,
    title: "Beautiful Storefronts",
    description: "Create stunning, Apple-inspired stores that convert visitors into customers.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: ShoppingCart,
    title: "Seamless Checkout",
    description: "Frictionless purchasing experience with multiple payment options.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description: "Real-time insights to grow your business with data-driven decisions.",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level security to protect your store and customer data.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Sell worldwide with multi-currency and localization support.",
    color: "from-indigo-500 to-blue-500"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized performance that loads in milliseconds, not seconds.",
    color: "from-yellow-500 to-orange-500"
  }
];

const FeaturesSection = () => {
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from('site_content')
      .select('content')
      .eq('section', 'features')
      .maybeSingle();
    
    if (data) setContent(data.content);
  };

  const features = content?.items?.map((item: any, index: number) => ({
    icon: iconMap[item.icon] || Store,
    title: item.title,
    description: item.description,
    color: defaultFeatures[index % defaultFeatures.length].color
  })) || defaultFeatures;

  return (
    <section className="py-32 bg-secondary/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            Features
          </span>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-6 tracking-tight">
            {content?.title || "Everything You Need"}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {content?.subtitle || "Powerful tools to build, manage, and scale your online business."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature: any, index: number) => (
            <Card 
              key={index} 
              className="group bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-8">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
