import { Button } from "@/components/ui/button";
import { Store, User, Menu, LogOut, X, ChevronDown, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import CartIcon from "@/components/CartIcon";
import UserQuickMenu from "@/components/UserQuickMenu";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserProfile {
  full_name?: string;
  avatar_url?: string;
  email?: string;
}

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin, hasRole } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, email')
      .eq('user_id', user?.id)
      .single();
    if (data) setProfile(data);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "See you again soon!",
    });
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `relative px-3 py-2 text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? "text-primary"
        : "text-foreground/70 hover:text-foreground"
    }`;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-border/50 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="bg-gradient-primary p-2.5 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <Store className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-primary rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
            </div>
            <span className="text-xl font-display font-bold text-foreground tracking-tight">
              GlassStore
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link to="/marketplace" className={navLinkClass("/marketplace")}>
              Marketplace
            </Link>
            <Link to="/products" className={navLinkClass("/products")}>
              Products
            </Link>
            {user && (
              <>
                <Link to="/orders" className={navLinkClass("/orders")}>
                  Orders
                </Link>
                <Link to="/wishlist" className={navLinkClass("/wishlist")}>
                  Wishlist
                </Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin" className={navLinkClass("/admin")}>
                Admin
              </Link>
            )}
            {(hasRole('seller') || isAdmin) && (
              <Link to="/dashboard" className={navLinkClass("/dashboard")}>
                Dashboard
              </Link>
            )}
            {user && !hasRole('seller') && !isAdmin && (
              <Link 
                to="/become-seller" 
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                Become Seller
              </Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <CartIcon />

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2">
              {user ? (
                <UserQuickMenu profile={profile || undefined} />
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/auth')}
                    className="text-foreground/70 hover:text-foreground"
                  >
                    Sign In
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => navigate('/auth')}
                    className="bg-gradient-primary text-white hover:opacity-90 shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="py-4 space-y-1 border-t border-border/50">
            <Link
              to="/marketplace"
              className="block px-4 py-3 text-foreground/80 hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Marketplace
            </Link>
            <Link
              to="/products"
              className="block px-4 py-3 text-foreground/80 hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            {user && (
              <>
                <Link
                  to="/orders"
                  className="block px-4 py-3 text-foreground/80 hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Orders
                </Link>
                <Link
                  to="/wishlist"
                  className="block px-4 py-3 text-foreground/80 hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Wishlist
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block px-4 py-3 text-foreground/80 hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                {(hasRole('seller') || isAdmin) && (
                  <Link
                    to="/dashboard"
                    className="block px-4 py-3 text-foreground/80 hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Seller Dashboard
                  </Link>
                )}
                {!hasRole('seller') && !isAdmin && (
                  <Link
                    to="/become-seller"
                    className="block px-4 py-3 text-primary font-medium hover:bg-primary/5 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Become a Seller
                    </span>
                  </Link>
                )}
              </>
            )}
            
            <div className="pt-4 mt-4 border-t border-border/50 space-y-2">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="block px-4 py-3 text-foreground/80 hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </span>
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-destructive hover:bg-destructive/5 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </span>
                  </button>
                </>
              ) : (
                <div className="space-y-2 px-4">
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                    onClick={() => {
                      navigate('/auth');
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="w-full justify-center bg-gradient-primary text-white"
                    onClick={() => {
                      navigate('/auth');
                      setIsMenuOpen(false);
                    }}
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
