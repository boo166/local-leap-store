import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Sparkles, Store, ShoppingBag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const WelcomeBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const dismissed = localStorage.getItem('welcome-banner-dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    }
  }, [user]);

  const dismissBanner = () => {
    localStorage.setItem('welcome-banner-dismissed', 'true');
    setShowBanner(false);
  };

  if (!showBanner || !user) return null;

  return (
    <section className="py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="glass-card border-primary/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-apple opacity-10"></div>
          <CardContent className="relative p-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissBanner}
              className="absolute top-2 right-2 hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-gradient-apple rounded-full p-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>

              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center md:justify-start gap-2">
                  Welcome to the Marketplace! 🎉
                </h3>
                <p className="text-muted-foreground mb-4">
                  Start your entrepreneurial journey today. Create your first store or explore amazing products from sellers worldwide.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <Link to="/create-store">
                    <Button variant="apple" className="w-full sm:w-auto">
                      <Store className="h-4 w-4 mr-2" />
                      Create Your Store
                    </Button>
                  </Link>
                  <Link to="/marketplace">
                    <Button variant="outline" className="w-full sm:w-auto">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Browse Products
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default WelcomeBanner;
