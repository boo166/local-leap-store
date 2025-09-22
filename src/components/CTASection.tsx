import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

const CTASection = () => {
  const benefits = [
    "Create your store in under 10 minutes",
    "No setup fees or hidden costs",
    "Accept local payment methods",
    "Mobile-optimized for your customers",
    "24/7 customer support in local languages"
  ];

  return (
    <section className="py-24 bg-gradient-market relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
          Ready to Transform Your Business?
        </h2>
        <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
          Join hundreds of local entrepreneurs who have already expanded their reach 
          and increased their sales with VillageMarket. Your digital transformation starts today.
        </p>

        <div className="grid md:grid-cols-5 gap-4 mb-12 text-left max-w-4xl mx-auto">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center space-x-2 text-white">
              <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
              <span className="text-sm">{benefit}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button variant="warm" size="lg" className="text-lg px-12 py-4">
            Start Selling Now
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="text-lg px-12 py-4 border-white text-white hover:bg-white hover:text-foreground"
          >
            Schedule Demo
          </Button>
        </div>

        <p className="text-white/80 text-sm mt-6">
          Free 30-day trial • No credit card required • Cancel anytime
        </p>
      </div>
    </section>
  );
};

export default CTASection;