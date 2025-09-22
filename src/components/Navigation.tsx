import { Button } from "@/components/ui/button";
import { Store, ShoppingBag, User, Menu } from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-hero p-2 rounded-lg">
              <Store className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">EgyptBazaar</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-foreground hover:text-primary transition-smooth">
              Browse Stores
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-smooth">
              Products
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-smooth">
              For Brands
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-smooth">
              About
            </a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
            <Button variant="hero" size="sm">
              Start Selling
            </Button>
            <Button variant="outline" size="icon">
              <ShoppingBag className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border mt-2 pt-4 pb-4">
            <div className="flex flex-col space-y-4">
              <a href="#" className="text-foreground hover:text-primary transition-smooth">
                Browse Stores
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-smooth">
                Products
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-smooth">
                For Brands
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-smooth">
                About
              </a>
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button variant="hero" size="sm">
                  Start Selling
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;