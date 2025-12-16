import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Store, Users, TrendingUp, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-glass-marketplace.jpg";
import { supabase } from "@/integrations/supabase/client";

const HeroSection = () => {
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from('site_content')
      .select('content')
      .eq('section', 'hero')
      .maybeSingle();
    
    if (data) setContent(data.content);
  };

  // Default content if none from database
  const defaultContent = {
    title: "Build Your Dream",
    titleHighlight: "Online Store",
    description: "Create stunning e-commerce experiences with our Apple-inspired platform. Beautiful design, powerful features, seamless experience.",
    stats: {
      stores: { value: "10K+", label: "Active Stores" },
      customers: { value: "500K+", label: "Happy Customers" },
      growth: { value: "250%", label: "Avg Growth" }
    }
  };

  const displayContent = content || defaultContent;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/30" />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float animate-delay-200" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-primary opacity-5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium animate-fade-in">
              <Sparkles className="h-4 w-4" />
              <span>Now with AI-powered features</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-display font-bold leading-[1.1] tracking-tight animate-fade-in-up">
              <span className="text-foreground">{displayContent.title}</span>
              <span className="block text-gradient mt-2">{displayContent.titleHighlight}</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl animate-fade-in-up animate-delay-100">
              {displayContent.description}
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 py-6 animate-fade-in-up animate-delay-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold font-display text-foreground">
                    {displayContent.stats.stores.value}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{displayContent.stats.stores.label}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-accent" />
                  <span className="text-2xl font-bold font-display text-foreground">
                    {displayContent.stats.customers.value}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{displayContent.stats.customers.label}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold font-display text-foreground">
                    {displayContent.stats.growth.value}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{displayContent.stats.growth.label}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animate-delay-300">
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="text-base px-8 h-14 bg-gradient-primary text-white shadow-lg hover:shadow-xl hover:opacity-90 transition-all duration-300 group"
                >
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-base px-8 h-14 border-2 hover:bg-secondary/50 transition-all duration-300 group"
                >
                  <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  View Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="relative lg:pl-8 animate-fade-in animate-delay-200">
            {/* Main image container */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-primary rounded-3xl opacity-20 blur-2xl" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border/10">
                <img 
                  src={heroImage} 
                  alt="Modern e-commerce platform interface"
                  className="w-full h-[500px] object-cover"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>
            
            {/* Floating cards */}
            <div className="absolute -top-4 -left-4 glass-card rounded-2xl p-4 shadow-lg animate-float">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-primary rounded-xl p-2.5">
                  <Store className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">New Store</p>
                  <p className="text-xs text-muted-foreground">TechCraft Studio</p>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -right-4 glass-card rounded-2xl p-4 shadow-lg animate-float animate-delay-300">
              <div className="flex items-center space-x-3">
                <div className="bg-green-500 rounded-xl p-2.5">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Revenue Up</p>
                  <p className="text-xs text-green-600 font-medium">+250% this month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
