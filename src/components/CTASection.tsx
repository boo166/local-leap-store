import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const CTASection = () => {
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from('site_content')
      .select('content')
      .eq('section', 'cta')
      .maybeSingle();
    
    if (data) setContent(data.content);
  };

  const defaultContent = {
    title: "Ready to Transform Your Business?",
    subtitle: "Join thousands of successful sellers who have already made the switch. Start your free trial today.",
    benefits: ["Free 14-day trial", "No credit card required", "Cancel anytime", "24/7 support", "Instant setup"],
    disclaimer: "No hidden fees. Scale as you grow."
  };

  const displayContent = content || defaultContent;

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-95" />
      
      {/* Animated circles */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float animate-delay-300" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-8 backdrop-blur-sm">
          <Sparkles className="h-4 w-4" />
          <span>Limited Time Offer</span>
        </div>

        <h2 className="text-4xl lg:text-6xl font-display font-bold text-white mb-6 tracking-tight leading-tight">
          {displayContent.title}
        </h2>
        
        <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
          {displayContent.subtitle}
        </p>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-12">
          {displayContent.benefits.map((benefit: string, index: number) => (
            <div key={index} className="flex items-center space-x-2 text-white/90">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-sm font-medium">{benefit}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/auth">
            <Button 
              size="lg" 
              className="text-base px-10 h-14 bg-white text-foreground hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 group"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/marketplace">
            <Button 
              variant="outline" 
              size="lg" 
              className="text-base px-10 h-14 border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
            >
              Explore Stores
            </Button>
          </Link>
        </div>

        <p className="text-white/60 text-sm mt-8">
          {displayContent.disclaimer}
        </p>
      </div>
    </section>
  );
};

export default CTASection;
