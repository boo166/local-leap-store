import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
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

  if (!content) return null;

  return (
    <section className="py-24 bg-gradient-apple relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
          {content.title}
        </h2>
        <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
          {content.subtitle}
        </p>

        <div className="grid md:grid-cols-5 gap-4 mb-12 text-left max-w-4xl mx-auto">
          {content.benefits.map((benefit: string, index: number) => (
            <div key={index} className="flex items-center space-x-2 text-white">
              <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
              <span className="text-sm">{benefit}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/dashboard">
            <Button variant="glass" size="lg" className="text-lg px-12 py-4">
              Start Selling Now
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
          <Link to="/products">
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-12 py-4 border-white text-white hover:bg-white hover:text-foreground"
            >
              Browse Products
            </Button>
          </Link>
        </div>

        <p className="text-white/80 text-sm mt-6">
          {content.disclaimer}
        </p>
      </div>
    </section>
  );
};

export default CTASection;