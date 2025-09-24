import { Button } from "@/components/ui/button";
import { ArrowRight, Store, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-glass-marketplace.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-apple">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-white">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
              Build Your
              <span className="block text-accent"> Digital Store</span>
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed">
              Experience the future of commerce with our glass-inspired platform. 
              Create stunning online stores with Apple-quality design and seamless user experience.
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
              <Link to="/dashboard">
                <Button variant="glass" size="lg" className="text-lg px-8">
                  Start Your Store
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button variant="outline" size="lg" className="text-lg px-8 border-white text-white hover:bg-white hover:text-foreground">
                  Browse Marketplace
                </Button>
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-elevated">
              <img 
                src={heroImage} 
                alt="Modern glass-style e-commerce interface with frosted glass panels and minimalist design"
                className="w-full h-[500px] object-cover"
              />
            </div>
            {/* Floating Cards */}
            <div className="absolute -top-6 -left-6 glass-card rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-primary rounded-lg p-2">
                  <Store className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">New Store Created</p>
                  <p className="text-xs text-muted-foreground">TechCraft Store</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 glass-card rounded-xl p-4">
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