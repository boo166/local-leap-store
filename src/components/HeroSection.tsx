import { Button } from "@/components/ui/button";
import { ArrowRight, Store, Users, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-egyptian-marketplace.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-white">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
              Empower Your
              <span className="block text-accent"> Egyptian Economy</span>
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed">
              Join the digital bazaar revolution. Help local Egyptian brands 
              create online stores, reach more customers across the Nile, and grow their ancient crafts businesses.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Store className="h-6 w-6 text-accent mr-2" />
                  <span className="text-2xl font-bold">50+</span>
                </div>
                <p className="text-sm text-white/80">Local Stores</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-accent mr-2" />
                  <span className="text-2xl font-bold">1000+</span>
                </div>
                <p className="text-sm text-white/80">Happy Customers</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-6 w-6 text-accent mr-2" />
                  <span className="text-2xl font-bold">85%</span>
                </div>
                <p className="text-sm text-white/80">Growth Rate</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="pharaoh" size="lg" className="text-lg px-8">
                Start Your Store
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 border-white text-white hover:bg-white hover:text-foreground">
                Browse Marketplace
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-pharaoh">
              <img 
                src={heroImage} 
                alt="Egyptian marketplace bazaar with traditional vendors selling crafts, spices and goods with pyramid architecture"
                className="w-full h-[500px] object-cover"
              />
            </div>
            {/* Floating Cards */}
            <div className="absolute -top-6 -left-6 bg-white rounded-xl p-4 shadow-card">
              <div className="flex items-center space-x-3">
                <div className="bg-primary rounded-lg p-2">
                  <Store className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">New Store Created</p>
                  <p className="text-xs text-muted-foreground">Cleopatra's Papyrus Art</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-4 shadow-card">
              <div className="flex items-center space-x-3">
                <div className="bg-secondary rounded-lg p-2">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Sales Growing</p>
                  <p className="text-xs text-muted-foreground">+250% this month</p>
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